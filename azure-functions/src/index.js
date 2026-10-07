/**
 * @file azure-functions/src/index.js
 * @description Master HTTP trigger registrations for Azure Functions v4 serverless workers.
 * Provides stateless AI processing endpoints for Next.js.
 */

import { app } from "@azure/functions";
import { runStructuredPrompt } from "./chat-runner.js";
import {
  SYSTEM_PROMPT_QUESTION_GENERATION,
  SYSTEM_PROMPT_ANSWER_EVALUATION,
  SYSTEM_PROMPT_RESUME_ANALYSIS,
  SYSTEM_PROMPT_REPORT_GENERATION,
} from "./prompts.js";
import {
  generateQuestionsResponseSchema,
  evaluateAnswerResponseSchema,
  analyzeResumeResponseSchema,
  generateReportResponseSchema,
} from "./schemas.js";

// 1. Health Probe
app.http("health", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: async () => {
    return {
      status: 200,
      jsonBody: {
        status: "ok",
        service: "azure-functions-v4",
        timestamp: new Date().toISOString(),
      },
    };
  },
});

// 2. Generate Interview Questions
app.http("generateQuestions", {
  methods: ["POST"],
  authLevel: "function",
  handler: async (request, context) => {
    try {
      const body = await request.json();
      const { role, type, difficulty, count = 5, resumeText } = body;

      if (!role) {
        return { status: 400, jsonBody: { error: "Missing required parameter 'role'" } };
      }

      let userPrompt = `Role: ${role}\nType: ${type}\nDifficulty: ${difficulty}\nQuestion Count: ${count}\n`;
      if (resumeText) {
        userPrompt += `\n<resume_content>\n${resumeText}\n</resume_content>\n`;
      }

      const result = await runStructuredPrompt({
        systemPrompt: SYSTEM_PROMPT_QUESTION_GENERATION,
        userPrompt,
        schema: generateQuestionsResponseSchema,
        temperature: 0.6,
      });

      return { status: 200, jsonBody: result };
    } catch (err) {
      context.error("[generateQuestions Error]", err);
      return { status: 500, jsonBody: { error: err.message || "Failed to generate questions" } };
    }
  },
});

// 3. Evaluate Candidate Answer
app.http("evaluateAnswer", {
  methods: ["POST"],
  authLevel: "function",
  handler: async (request, context) => {
    try {
      const body = await request.json();
      const { role = "Software Engineer", difficulty = "Intermediate", question, topic = "General", category = "Technical", answer } = body;

      if (!question || answer === undefined) {
        return { status: 400, jsonBody: { error: "Missing question or answer" } };
      }

      const userPrompt = `
Role: ${role}
Difficulty: ${difficulty}
Category: ${category}
Topic: ${topic}
Question: ${question}

<candidate_answer>
${answer}
</candidate_answer>
`.trim();

      const result = await runStructuredPrompt({
        systemPrompt: SYSTEM_PROMPT_ANSWER_EVALUATION,
        userPrompt,
        schema: evaluateAnswerResponseSchema,
        temperature: 0.2,
      });

      return { status: 200, jsonBody: result };
    } catch (err) {
      context.error("[evaluateAnswer Error]", err);
      return { status: 500, jsonBody: { error: err.message || "Failed to evaluate answer" } };
    }
  },
});

// 4. Analyze Resume Content
app.http("analyzeResume", {
  methods: ["POST"],
  authLevel: "function",
  handler: async (request, context) => {
    try {
      const body = await request.json();
      const { resumeText } = body;

      if (!resumeText) {
        return { status: 400, jsonBody: { error: "Missing resumeText" } };
      }

      const userPrompt = `<resume_content>\n${resumeText}\n</resume_content>`;

      const result = await runStructuredPrompt({
        systemPrompt: SYSTEM_PROMPT_RESUME_ANALYSIS,
        userPrompt,
        schema: analyzeResumeResponseSchema,
        temperature: 0.2,
      });

      return { status: 200, jsonBody: result };
    } catch (err) {
      context.error("[analyzeResume Error]", err);
      return { status: 500, jsonBody: { error: err.message || "Failed to analyze resume" } };
    }
  },
});

// 5. Generate Comprehensive Synthesis Report
app.http("generateReport", {
  methods: ["POST"],
  authLevel: "function",
  handler: async (request, context) => {
    try {
      const body = await request.json();
      const { role = "Full Stack Engineer", difficulty = "Intermediate", questions_and_answers, overall_score } = body;

      const formattedQAs = (questions_and_answers || [])
        .map(
          (qa, idx) => `
Q${idx + 1} (${qa.category || "Technical"} - ${qa.topic || "Core"}): ${qa.question}
Answer: ${qa.answer}
Score: ${qa.score}/10
`
        )
        .join("\n---\n");

      const userPrompt = `
Job Role: ${role}
Difficulty Level: ${difficulty}
Overall Calculated Score: ${overall_score ?? "N/A"}/100

Session History:
${formattedQAs}
`.trim();

      const result = await runStructuredPrompt({
        systemPrompt: SYSTEM_PROMPT_REPORT_GENERATION,
        userPrompt,
        schema: generateReportResponseSchema,
        temperature: 0.4,
      });

      return { status: 200, jsonBody: result };
    } catch (err) {
      context.error("[generateReport Error]", err);
      return { status: 500, jsonBody: { error: err.message || "Failed to generate report" } };
    }
  },
});
