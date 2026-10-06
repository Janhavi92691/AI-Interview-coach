/**
 * @file lib/ai/core/evaluate-answer.js
 * @description Evaluates candidate responses against rubric dimensions using Azure OpenAI.
 */

import { SYSTEM_PROMPTS } from "./prompts.js";
import { callChatWithRetry } from "./chat-runner.js";
import { evaluateAnswerResponseSchema } from "../schemas.js";

/**
 * @param {Object} params
 * @param {string} params.role
 * @param {'Beginner' | 'Intermediate' | 'Advanced'} params.difficulty
 * @param {string} params.question
 * @param {string} params.topic
 * @param {'Technical' | 'HR' | 'Resume'} params.category
 * @param {string} params.answer
 * @returns {Promise<{ correctness: number, technical_depth: number, clarity: number, relevance: number, feedback: { did_well: string, missing: string, improve: string }, follow_up?: string | null }>}
 */
export async function azureEvaluateAnswer({
  role = "Software Developer",
  difficulty = "Intermediate",
  question = "",
  topic = "",
  category = "Technical",
  answer = "",
}) {
  const cappedAnswer = (answer || "").slice(0, 4000);

  const userPrompt = `Evaluate the candidate's answer for this interview context:
- Target Job Role: <job_role>${role.slice(0, 100)}</job_role>
- Declared Difficulty: ${difficulty}
- Question Category: ${category}
- Question Topic: ${topic}
- Question Prompt: ${question}

Candidate Response:
<candidate_answer>
${cappedAnswer}
</candidate_answer>

Score correctness, technical_depth, clarity, and relevance from 0 to 10 each based on the rubric, and supply specific feedback.`;

  return callChatWithRetry({
    systemPrompt: SYSTEM_PROMPTS.EVALUATE_ANSWER,
    userPrompt,
    schema: evaluateAnswerResponseSchema,
    temperature: 0.2,
  });
}
