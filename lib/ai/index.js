/**
 * @file lib/ai/index.js
 * @description Unified facade for AI capabilities across the application.
 * Switches dynamically between:
 * - 'mock': deterministic mock provider for local development & UI testing
 * - 'azure': direct Azure OpenAI client (Phases 3–5)
 * - 'functions': decoupled Azure Functions v4 serverless workers over HTTP (Phase 6+ production default)
 */

import {
  mockGenerateQuestions,
  mockEvaluateAnswer,
  mockAnalyzeResume,
  mockGenerateReport,
} from "./mock.js";

import { azureGenerateQuestions } from "./core/generate-questions.js";
import { azureEvaluateAnswer } from "./core/evaluate-answer.js";
import { azureAnalyzeResume } from "./core/analyze-resume.js";
import { azureGenerateReport } from "./core/generate-report.js";

import {
  functionsGenerateQuestions,
  functionsEvaluateAnswer,
  functionsAnalyzeResume,
  functionsGenerateReport,
} from "./functions-client.js";

function getProvider() {
  return (process.env.AI_PROVIDER || "mock").toLowerCase();
}

/**
 * Generate adaptive interview questions.
 *
 * @param {Object} params
 * @param {string} params.role
 * @param {'Technical' | 'HR' | 'Mixed' | 'Resume-Based'} params.type
 * @param {'Beginner' | 'Intermediate' | 'Advanced'} params.difficulty
 * @param {number} params.count
 * @param {string} [params.resumeText]
 * @param {Object} [params.resumeAnalysis]
 * @returns {Promise<{ questions: Array<{ question: string, topic: string, category: 'Technical' | 'HR' | 'Resume' }> }>}
 */
export async function generateQuestions(params) {
  const provider = getProvider();
  if (provider === "functions") {
    return functionsGenerateQuestions(params);
  }
  if (provider === "azure") {
    return azureGenerateQuestions(params);
  }
  return mockGenerateQuestions(params);
}

/**
 * Evaluate candidate's answer against rubric criteria.
 *
 * @param {Object} params
 * @param {string} params.role
 * @param {'Beginner' | 'Intermediate' | 'Advanced'} params.difficulty
 * @param {string} params.question
 * @param {string} params.topic
 * @param {'Technical' | 'HR' | 'Resume'} params.category
 * @param {string} params.answer
 * @returns {Promise<{ correctness: number, technical_depth: number, clarity: number, relevance: number, feedback: { did_well: string, missing: string, improve: string }, follow_up?: string | null }>}
 */
export async function evaluateAnswer(params) {
  const provider = getProvider();
  if (provider === "functions") {
    return functionsEvaluateAnswer(params);
  }
  if (provider === "azure") {
    return azureEvaluateAnswer(params);
  }
  return mockEvaluateAnswer(params);
}

/**
 * Extract skills, projects, and structural insights from raw resume text.
 *
 * @param {Object} params
 * @param {string} params.resumeText
 * @returns {Promise<{ skills: string[], technologies: string[], projects: Array<{ name: string, summary: string }>, education: string[], certifications: string[], experience: Array<{ title: string, organization: string, summary: string }> }>}
 */
export async function analyzeResume(params) {
  const provider = getProvider();
  if (provider === "functions") {
    return functionsAnalyzeResume(params);
  }
  if (provider === "azure") {
    return azureAnalyzeResume(params);
  }
  return mockAnalyzeResume(params);
}

/**
 * Generate final holistic performance analysis and recommended study topics.
 *
 * @param {Object} params
 * @param {string} params.role
 * @param {'Technical' | 'HR' | 'Mixed' | 'Resume-Based'} [params.type]
 * @param {'Beginner' | 'Intermediate' | 'Advanced'} params.difficulty
 * @param {Object} [params.metrics]
 * @param {Array<Object>} [params.questions_and_answers]
 * @param {Array<Object>} [params.items]
 * @param {number} [params.overall_score]
 * @returns {Promise<{ summary: string, strengths: string[], weaknesses: string[], recommended_topics: string[] }>}
 */
export async function generateReport(params) {
  const provider = getProvider();
  if (provider === "functions") {
    return functionsGenerateReport(params);
  }
  if (provider === "azure") {
    return azureGenerateReport(params);
  }
  return mockGenerateReport(params);
}

export const ai = {
  generateQuestions,
  evaluateAnswer,
  analyzeResume,
  generateReport,
};
