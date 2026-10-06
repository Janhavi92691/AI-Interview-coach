/**
 * @file lib/ai/core/generate-report.js
 * @description Generates holistic performance summary, strengths, and study recommendations using Azure OpenAI.
 */

import { SYSTEM_PROMPTS } from "./prompts.js";
import { callChatWithRetry } from "./chat-runner.js";
import { generateReportResponseSchema } from "../schemas.js";

/**
 * @param {Object} params
 * @param {string} params.role
 * @param {'Technical' | 'HR' | 'Mixed' | 'Resume-Based'} params.type
 * @param {'Beginner' | 'Intermediate' | 'Advanced'} params.difficulty
 * @param {Object} params.metrics
 * @param {Array<Object>} params.items
 * @returns {Promise<{ summary: string, strengths: string[], weaknesses: string[], recommended_topics: string[] }>}
 */
export async function azureGenerateReport({
  role = "Full Stack Developer",
  type = "Technical",
  difficulty = "Intermediate",
  metrics = { overall: 80, technicalKnowledge: 80, answerQuality: 80, clarity: 80 },
  items = [],
}) {
  const userPrompt = `Synthesize an end-of-interview report for this completed mock interview:
- Candidate Role: <job_role>${role.slice(0, 100)}</job_role>
- Interview Type: ${type}
- Difficulty Level: ${difficulty}
- Summary Metrics:
  - Overall Score: ${metrics.overall}/100
  - Technical Depth: ${metrics.technicalKnowledge}%
  - Answer Quality: ${metrics.answerQuality}%
  - Communication Clarity: ${metrics.clarity}%

Itemized Question and Answer History:
${JSON.stringify(items, null, 2)}

Provide a concise performance summary (3–5 sentences), 3–5 strengths, 2–4 weaknesses, and 4–6 recommended study topics. Return valid raw JSON.`;

  return callChatWithRetry({
    systemPrompt: SYSTEM_PROMPTS.GENERATE_REPORT,
    userPrompt,
    schema: generateReportResponseSchema,
    temperature: 0.4,
  });
}
