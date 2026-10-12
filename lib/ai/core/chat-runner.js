/**
 * @file lib/ai/core/chat-runner.js
 * @description Robust completion runner for Azure OpenAI chat completions.
 * Enforces JSON mode, robust extraction, Zod validation, retry repair, and resilient fallbacks.
 */

import { getAzureOpenAIClient, getAzureDeploymentName } from "./openai-client.js";
import { AppError } from "../../errors.js";

/**
 * Safely extracts and parses JSON from raw LLM output, handling markdown code fences,
 * preamble text, and minor formatting noise.
 *
 * @param {string} content
 * @returns {any}
 */
export function safeParseJson(content) {
  if (!content || typeof content !== "string") {
    throw new Error("Empty AI response content.");
  }

  const trimmed = content.trim();

  // 1. Direct parse attempt
  try {
    return JSON.parse(trimmed);
  } catch {
    // 2. Strip markdown fences: ```json ... ``` or ``` ... ```
    const stripped = trimmed
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    try {
      return JSON.parse(stripped);
    } catch {
      // 3. Extract outermost { ... } substring
      const firstBrace = stripped.indexOf("{");
      const lastBrace = stripped.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        try {
          return JSON.parse(stripped.slice(firstBrace, lastBrace + 1));
        } catch {
          // continue
        }
      }

      // 4. Extract outermost [ ... ] substring
      const firstBracket = stripped.indexOf("[");
      const lastBracket = stripped.lastIndexOf("]");
      if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        try {
          return JSON.parse(stripped.slice(firstBracket, lastBracket + 1));
        } catch {
          // continue
        }
      }

      throw new Error("No parseable JSON structure located in AI output.");
    }
  }
}

/**
 * Unwraps common top-level wrapper keys (e.g. { "evaluation": { ... } }).
 *
 * @param {any} parsed
 * @returns {any}
 */
export function unwrapNestedRoot(parsed) {
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    if (parsed.evaluation && typeof parsed.evaluation === "object") return parsed.evaluation;
    if (parsed.result && typeof parsed.result === "object") return parsed.result;
    if (parsed.data && typeof parsed.data === "object") return parsed.data;
    if (parsed.answer && typeof parsed.answer === "object") return parsed.answer;
    if (parsed.output && typeof parsed.output === "object") return parsed.output;
  }
  return parsed;
}

/**
 * Invokes Azure OpenAI chat completion with JSON parsing, Zod validation, and retry-once repair.
 *
 * @template T
 * @param {Object} options
 * @param {string} options.systemPrompt
 * @param {string} options.userPrompt
 * @param {import("zod").ZodType<T>} options.schema
 * @param {number} [options.temperature=0.2]
 * @returns {Promise<T>}
 */
export async function callChatWithRetry({
  systemPrompt,
  userPrompt,
  schema,
  temperature = 0.2,
}) {
  const client = getAzureOpenAIClient();
  const deployment = getAzureDeploymentName();

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  let rawContent = "";

  // Helper to execute OpenAI call with transient retry for 429 / 5xx
  const executeCall = async (msgs) => {
    let attempts = 0;
    while (attempts < 2) {
      try {
        attempts++;
        const response = await client.chat.completions.create({
          model: deployment,
          messages: msgs,
          temperature,
          response_format: { type: "json_object" },
        });

        const choice = response.choices?.[0];
        if (!choice?.message?.content) {
          throw new AppError("AI_INVALID_OUTPUT", "Azure OpenAI returned an empty response.", 502);
        }
        return choice.message.content;
      } catch (err) {
        if (err instanceof AppError) throw err;

        const status = err.status || err.statusCode;
        // If 429 Rate Limit or 5xx Server Error, retry once after backoff
        if ((status === 429 || status >= 500) && attempts < 2) {
          await new Promise((r) => setTimeout(r, 1500));
          continue;
        }

        // Map client errors to safe AppErrors without leaking credentials
        if (status === 401 || status === 403) {
          throw new AppError(
            "AI_UNAVAILABLE",
            "Azure OpenAI authentication failed. Please verify API credentials.",
            502,
            err
          );
        }
        if (err.code === "ETIMEDOUT" || err.message?.includes("timeout")) {
          throw new AppError(
            "AI_UNAVAILABLE",
            "Azure OpenAI request timed out. Please try again.",
            504,
            err
          );
        }

        throw new AppError(
          "AI_UNAVAILABLE",
          "Unable to complete AI request. Please try again.",
          502,
          err
        );
      }
    }
  };

  rawContent = await executeCall(messages);

  // Attempt 1: Safe parse and validate
  try {
    const parsed = safeParseJson(rawContent);
    const unwrapped = unwrapNestedRoot(parsed);
    return schema.parse(unwrapped);
  } catch (firstError) {
    console.warn("[AzureOpenAI] First output parse/schema validation failed. Initiating retry repair...", firstError.message);

    // Attempt 2: Append repair instruction and retry once
    const repairMessages = [
      ...messages,
      { role: "assistant", content: rawContent },
      {
        role: "user",
        content: `Your previous output could not be parsed: ${firstError.message}. Return strictly valid, raw JSON conforming to the requested schema. No markdown fences or commentary.`,
      },
    ];

    try {
      const repairedContent = await executeCall(repairMessages);
      const repairedJson = safeParseJson(repairedContent);
      const repairedUnwrapped = unwrapNestedRoot(repairedJson);
      return schema.parse(repairedUnwrapped);
    } catch (secondError) {
      console.warn("[AzureOpenAI] Second attempt also had schema issues. Attempting resilient fallback parsing...", secondError.message);

      // Attempt 3: Resilient Schema Fallback
      // If we managed to get any JSON at all, run it through the resilient schema
      try {
        let partialJson = {};
        try {
          partialJson = safeParseJson(rawContent);
        } catch {
          // ignore
        }
        const unwrapped = unwrapNestedRoot(partialJson);
        return schema.parse(unwrapped);
      } catch (fallbackError) {
        console.error("[AzureOpenAI] All parsing and recovery attempts failed:", fallbackError);
        throw new AppError(
          "AI_INVALID_OUTPUT",
          "Unable to evaluate answer structure. Please try submitting again.",
          502,
          fallbackError
        );
      }
    }
  }
}
