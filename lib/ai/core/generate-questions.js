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
export async function azureGenerateQuestions(rawParams = {}) {
  const role = rawParams.role || rawParams.job_role || "Software Developer";
  const type = rawParams.type || rawParams.interview_type || "Technical";
  const difficulty = rawParams.difficulty || "Intermediate";
  const count = rawParams.count || rawParams.total_questions || 5;
  const rawResume =
    rawParams.resumeAnalysis ||
    rawParams.resume_analysis ||
    rawParams.resume_text ||
    rawParams.resumeText ||
    null;

  const safeCount = [5, 10, 15].includes(Number(count)) ? Number(count) : 5;
  const safeDiff = ["Beginner", "Intermediate", "Advanced"].includes(difficulty)
    ? difficulty
    : "Intermediate";
  const safeType = ["Technical", "HR", "Mixed", "Resume-Based"].includes(type)
    ? type
    : "Technical";

  let resumeContext = "None provided.";
  if (rawResume) {
    if (typeof rawResume === "string") {
      try {
        const parsed = JSON.parse(rawResume);
        resumeContext = JSON.stringify(parsed, null, 2);
      } catch (_) {
        resumeContext = rawResume;
      }
    } else {
      resumeContext = JSON.stringify(rawResume, null, 2);
    }
  }

  let typeGuidance = "";
  if (safeType === "HR") {
    typeGuidance =
      "\n- Critical Instruction: This is an HR & Behavioral interview. All questions must test communication, leadership, conflict resolution, emotional intelligence, and teamwork using STAR scenarios. Absolutely NO coding, syntax, or technical theory questions.";
  } else if (safeType === "Technical") {
    typeGuidance =
      "\n- Critical Instruction: This is a Technical interview. Focus on algorithms, software architecture, and engineering fundamentals for this specific role.";
  } else if (safeType === "Resume-Based") {
    typeGuidance = `
- Critical Instruction: This is a 100% personalized RESUME-BASED interview for this specific candidate.
  * Every single question must be in the 'Resume' category and directly cross-examine their actual projects, listed technologies, and work experience provided in <resume_analysis>.
  * Explicitly mention their real project names, architectures, tools, and technical decisions from their resume in the questions (e.g. "In your project [Project Name], you utilized [Tech/Database]. How did you handle [specific architectural challenge]?", "Your resume highlights experience with [Skill/Tool]. Describe a scenario where you used it to solve a complex issue.").
  * Do NOT ask generic textbook questions. Every question must be custom-tailored to THIS candidate's background.`;
  }

  // Session salt to ensure non-repeating questions across attempts
  const sessionSeed = Math.random().toString(36).substring(2, 8);

  const userPrompt = `Generate exactly ${safeCount} unique, non-repeating questions for this interview:
- Candidate Target Role: <job_role>${role.slice(0, 100)}</job_role>
- Interview Type: ${safeType}
- Target Difficulty: ${safeDiff}
- Candidate Resume Analysis:
<resume_analysis>
${resumeContext}
</resume_analysis>${typeGuidance}
- Diversity Seed: ${sessionSeed} (Ensure questions are distinct from standard defaults and specifically personalized).

Output raw JSON strictly matching the requested schema.`;

  return callChatWithRetry({
    systemPrompt: SYSTEM_PROMPTS.GENERATE_QUESTIONS,
    userPrompt,
    schema: generateQuestionsResponseSchema,
    temperature: 0.8,
  });
}
