/**
 * @file lib/ai/index.js
 * @description Unified facade for AI capabilities across the application.
 * Switches between 'mock', 'azure' (direct OpenAI in Phases 3–5), and 'functions' (Azure Functions in Phase 6+).
 */

import {
  mockGenerateQuestions,
  mockEvaluateAnswer,
  mockAnalyzeResume,
  mockGenerateReport,
} from "./mock.js";

const provider = (process.env.AI_PROVIDER || "mock").toLowerCase();

/**
 * Generate adaptive interview questions.
 *
 * @param {Object} params
 * @param {string} params.role
 * @param {'Technical' | 'HR' | 'Mixed' | 'Resume-Based'} params.type
 * @param {'Beginner' | 'Intermediate' | 'Advanced'} params.difficulty
 * @param {number} params.count
 * @param {Object} [params.resumeAnalysis]
 * @returns {Promise<{ questions: Array<{ question: string, topic: string, category: 'Technical' | 'HR' | 'Resume' }> }>}
 */
export async function generateQuestions(params) {
  if (provider === "mock") {
    return mockGenerateQuestions(params);
  }

  // Future phases will route to 'azure' or 'functions'
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
  if (provider === "mock") {
    return mockEvaluateAnswer(params);
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
  if (provider === "mock") {
    return mockAnalyzeResume(params);
  }

  return mockAnalyzeResume(params);
}

/**
 * Generate final holistic performance analysis and recommended study topics.
 *
 * @param {Object} params
 * @param {string} params.role
 * @param {'Technical' | 'HR' | 'Mixed' | 'Resume-Based'} params.type
 * @param {'Beginner' | 'Intermediate' | 'Advanced'} params.difficulty
 * @param {Object} params.metrics
 * @param {Array<Object>} params.items
 * @returns {Promise<{ summary: string, strengths: string[], weaknesses: string[], recommended_topics: string[] }>}
 */
export async function generateReport(params) {
  if (provider === "mock") {
    return mockGenerateReport(params);
  }

  return mockGenerateReport(params);
}
