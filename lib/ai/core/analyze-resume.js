/**
 * @file lib/ai/core/analyze-resume.js
 * @description Extracts structured technical skills, frameworks, and projects from resume text using Azure OpenAI.
 */

import { SYSTEM_PROMPTS } from "./prompts.js";
import { callChatWithRetry } from "./chat-runner.js";
import { analyzeResumeResponseSchema } from "../schemas.js";

/**
 * @param {Object} params
 * @param {string} params.resumeText
 * @returns {Promise<{ skills: string[], technologies: string[], projects: Array<{ name: string, summary: string }>, education: string[], certifications: string[], experience: Array<{ title: string, organization: string, summary: string }> }>}
 */
export async function azureAnalyzeResume({ resumeText = "" }) {
  const cappedText = (resumeText || "").slice(0, 20000);

  const userPrompt = `Extract structured technical information from the provided candidate resume:
<resume>
${cappedText}
</resume>

Return valid raw JSON matching the requested schema.`;

  return callChatWithRetry({
    systemPrompt: SYSTEM_PROMPTS.ANALYZE_RESUME,
    userPrompt,
    schema: analyzeResumeResponseSchema,
    temperature: 0.0,
  });
}
