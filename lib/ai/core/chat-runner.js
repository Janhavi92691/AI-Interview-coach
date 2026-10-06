/**
 * @file lib/ai/core/chat-runner.js
 * @description Robust completion runner for Azure OpenAI chat completions.
 * Enforces JSON mode, Zod validation, retry-once schema repair, and safe error mapping.
 */

import { getAzureOpenAIClient, getAzureDeploymentName } from "./openai-client.js";
import { AppError } from "../../errors.js";

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

  // Attempt 1: Parse and validate JSON output
  try {
    const parsed = JSON.parse(rawContent);
    return schema.parse(parsed);
  } catch (firstError) {
    console.warn("[AzureOpenAI] First output schema parse failed. Initiating retry repair...", firstError.message);

    // Attempt 2: Append repair instruction and retry once
    const repairMessages = [
      ...messages,
      { role: "assistant", content: rawContent },
      {
        role: "user",
        content: `Your previous output was invalid because: ${firstError.message}. Return corrected JSON only conforming to the exact schema specification. No prose or markdown.`,
      },
    ];

    try {
      const repairedContent = await executeCall(repairMessages);
      const repairedJson = JSON.parse(repairedContent);
      return schema.parse(repairedJson);
    } catch (secondError) {
      console.error("[AzureOpenAI] Retry repair failed:", secondError);
      throw new AppError(
        "AI_INVALID_OUTPUT",
        "Unable to generate a valid response structure. Please try again.",
        502,
        secondError
      );
    }
  }
}
