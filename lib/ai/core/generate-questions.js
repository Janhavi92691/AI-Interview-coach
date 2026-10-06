/**
 * @file lib/ai/core/generate-questions.js
 * @description Generates adaptive interview questions using Azure OpenAI.
 */

import { SYSTEM_PROMPTS } from "./prompts.js";
import { callChatWithRetry } from "./chat-runner.js";
import { generateQuestionsResponseSchema } from "../schemas.js";

/**
 * @param {Object} params
 * @param {string} params.role
 * @param {'Technical' | 'HR' | 'Mixed' | 'Resume-Based'} params.type
 * @param {'Beginner' | 'Intermediate' | 'Advanced'} params.difficulty
 * @param {number} params.count
 * @param {Object} [params.resumeAnalysis]
 * @returns {Promise<{ questions: Array<{ question: string, topic: string, category: 'Technical' | 'HR' | 'Resume' }> }>}
 */
export async function azureGenerateQuestions({
  role = "Software Developer",
  type = "Technical",
  difficulty = "Intermediate",
  count = 5,
  resumeAnalysis = null,
}) {
  const safeCount = [5, 10, 15].includes(Number(count)) ? Number(count) : 5;
  const safeDiff = ["Beginner", "Intermediate", "Advanced"].includes(difficulty) ? difficulty : "Intermediate";
  const safeType = ["Technical", "HR", "Mixed", "Resume-Based"].includes(type) ? type : "Technical";

  let resumeContext = "None provided.";
  if (resumeAnalysis) {
    resumeContext = JSON.stringify(resumeAnalysis);
  }

  const userPrompt = `Generate exactly ${safeCount} questions for the following interview configuration:
- Target Role: <job_role>${role.slice(0, 100)}</job_role>
- Interview Type: ${safeType}
- Target Difficulty: ${safeDiff}
- Candidate Resume Analysis: <resume_analysis>${resumeContext}</resume_analysis>

Output raw JSON strictly matching the requested schema.`;

  return callChatWithRetry({
    systemPrompt: SYSTEM_PROMPTS.GENERATE_QUESTIONS,
    userPrompt,
    schema: generateQuestionsResponseSchema,
    temperature: 0.7,
  });
}
