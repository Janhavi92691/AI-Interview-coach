/**
 * @file lib/ai/functions-client.js
 * @description HTTP client for dispatching AI requests from Next.js to Azure Functions v4 serverless workers.
 * Used when AI_PROVIDER="functions" (production architecture).
 */

import { AppError } from "../errors.js";
import {
  generateQuestionsResponseSchema,
  evaluateAnswerResponseSchema,
  analyzeResumeResponseSchema,
  generateReportResponseSchema,
} from "./schemas.js";

const DEFAULT_TIMEOUT_MS = 45000;

function getFunctionsConfig() {
  const baseUrl = (process.env.AZURE_FUNCTIONS_BASE_URL || "http://localhost:7071").replace(/\/+$/, "");
  const functionKey = process.env.AZURE_FUNCTIONS_KEY || "";
  return { baseUrl, functionKey };
}

/**
 * Generic HTTP dispatch helper to Azure Functions with authentication and timeout.
 *
 * @param {string} endpointName - e.g. "generateQuestions"
 * @param {Record<string, any>} payload
 * @returns {Promise<any>}
 */
async function callFunctionEndpoint(endpointName, payload) {
  const { baseUrl, functionKey } = getFunctionsConfig();
  const url = `${baseUrl}/api/${endpointName}`;

  const headers = {
    "Content-Type": "application/json",
  };
  if (functionKey) {
    headers["x-functions-key"] = functionKey;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[AzureFunction ${endpointName} HTTP ${response.status}]`, errorText);
      throw new AppError(
        "AI_UNAVAILABLE",
        `Serverless worker returned HTTP ${response.status}.`,
        response.status >= 500 ? 503 : response.status
      );
    }

    return await response.json();
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof AppError) throw err;

    if (err.name === "AbortError") {
      throw new AppError("AI_UNAVAILABLE", "Serverless worker timed out after 45 seconds.", 504);
    }

    console.error(`[AzureFunction ${endpointName} Network Error]`, err);
    throw new AppError("AI_UNAVAILABLE", "Failed to connect to Azure Functions worker.", 503, err);
  }
}

/**
 * Generate questions via Azure Functions worker.
 */
export async function functionsGenerateQuestions(params) {
  const raw = await callFunctionEndpoint("generateQuestions", {
    role: params.role || params.job_role,
    type: params.type || params.interview_type,
    difficulty: params.difficulty,
    count: params.count || params.total_questions || 5,
    resumeText: params.resume_text || params.resumeAnalysis,
  });

  const parsed = generateQuestionsResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new AppError("AI_INVALID_OUTPUT", "Functions worker returned unexpected question format.", 502);
  }
  return parsed.data;
}

/**
 * Evaluate answer via Azure Functions worker.
 */
export async function functionsEvaluateAnswer(params) {
  const raw = await callFunctionEndpoint("evaluateAnswer", {
    role: params.role,
    difficulty: params.difficulty,
    question: params.question,
    topic: params.topic,
    category: params.category,
    answer: params.answer,
  });

  const parsed = evaluateAnswerResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new AppError("AI_EVALUATION_FAILED", "Functions worker returned invalid evaluation rubric.", 502);
  }
  return parsed.data;
}

/**
 * Analyze resume via Azure Functions worker.
 */
export async function functionsAnalyzeResume(params) {
  const raw = await callFunctionEndpoint("analyzeResume", {
    resumeText: params.resumeText || params.resume_text,
  });

  const parsed = analyzeResumeResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new AppError("AI_RESUME_FAILED", "Functions worker returned invalid resume analysis.", 502);
  }
  return parsed.data;
}

/**
 * Generate synthesis report via Azure Functions worker.
 */
export async function functionsGenerateReport(params) {
  const raw = await callFunctionEndpoint("generateReport", {
    role: params.role || params.job_role,
    difficulty: params.difficulty,
    questions_and_answers: params.questions_and_answers || params.items,
    overall_score: params.overall_score,
  });

  const parsed = generateReportResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new AppError("AI_REPORT_FAILED", "Functions worker returned invalid report format.", 502);
  }
  return parsed.data;
}
