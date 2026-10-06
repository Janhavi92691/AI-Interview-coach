/**
 * @file lib/interview-store.js
 * @description Temporary interview session store for Phase 2 prototyping.
 * Provides module-level caching and browser localStorage synchronization so refreshes do not lose state.
 * Will be backed by Azure SQL in Phase 4.
 */

import { generateQuestions, evaluateAnswer, generateReport } from "./ai/index.js";
import { calculateAnswerScore, calculateOverallScore, calculateResultMetrics } from "./scoring.js";

const STORAGE_KEY = "aic_interviews_store_v1";

// In-memory module cache
let memoryStore = new Map();

/**
 * Loads store from browser localStorage if available
 */
function syncFromStorage() {
  if (typeof window !== "undefined") {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        for (const [id, val] of Object.entries(parsed)) {
          memoryStore.set(id, val);
        }
      }
    } catch {
      // Storage unavailable or disabled
    }
  }
}

/**
 * Persists store to browser localStorage
 */
function syncToStorage() {
  if (typeof window !== "undefined") {
    try {
      const obj = Object.fromEntries(memoryStore);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch {
      // Ignore quota or private mode issues
    }
  }
}

/**
 * Creates and initializes a new interview session.
 *
 * @param {Object} params
 * @param {string} params.role
 * @param {'Technical' | 'HR' | 'Mixed' | 'Resume-Based'} params.type
 * @param {'Beginner' | 'Intermediate' | 'Advanced'} params.difficulty
 * @param {number} params.count
 * @param {Object} [params.resumeAnalysis]
 * @returns {Promise<Object>} The initialized interview session
 */
export async function createInterviewSession({
  role = "Full Stack Developer",
  type = "Technical",
  difficulty = "Intermediate",
  count = 5,
  resumeAnalysis = null,
}) {
  syncFromStorage();

  const generated = await generateQuestions({
    role,
    type,
    difficulty,
    count,
    resumeAnalysis,
  });

  const id = `int_${Date.now()}`;
  const questions = generated.questions.map((q, idx) => ({
    id: `q_${id}_${idx + 1}`,
    questionText: q.question,
    topic: q.topic,
    category: q.category,
    questionOrder: idx + 1,
    answer: null,
  }));

  const session = {
    id,
    jobRole: role,
    interviewType: type,
    difficulty,
    totalQuestions: questions.length,
    status: "in_progress",
    overallScore: null,
    metrics: null,
    report: null,
    createdAt: new Date().toISOString(),
    completedAt: null,
    questions,
  };

  memoryStore.set(id, session);
  syncToStorage();

  return session;
}

/**
 * Retrieves an interview session by ID.
 *
 * @param {string} id
 * @returns {Object|null}
 */
export function getInterviewSession(id) {
  syncFromStorage();
  return memoryStore.get(id) || null;
}

/**
 * Evaluates and records a candidate's answer for a question.
 *
 * @param {Object} params
 * @param {string} params.interviewId
 * @param {string} params.questionId
 * @param {string} params.answerText
 * @returns {Promise<Object>} The evaluated answer object
 */
export async function submitQuestionAnswer({
  interviewId,
  questionId,
  answerText,
}) {
  syncFromStorage();
  const session = memoryStore.get(interviewId);
  if (!session) {
    throw new Error("Interview session not found");
  }

  const question = session.questions.find((q) => q.id === questionId);
  if (!question) {
    throw new Error("Question not found in this interview");
  }

  if (question.answer != null) {
    throw new Error("Question has already been answered");
  }

  const trimmed = (answerText || "").trim();
  if (trimmed.length === 0) {
    throw new Error("Answer text cannot be empty");
  }
  if (trimmed.length > 4000) {
    throw new Error("Answer text exceeds 4000 characters limit");
  }

  // 1. Call AI for rubric breakdown
  const aiEval = await evaluateAnswer({
    role: session.jobRole,
    difficulty: session.difficulty,
    question: question.questionText,
    topic: question.topic,
    category: question.category,
    answer: trimmed,
  });

  // 2. Compute answer score strictly via lib/scoring.js
  const computedScore = calculateAnswerScore({
    correctness: aiEval.correctness,
    technical_depth: aiEval.technical_depth,
    clarity: aiEval.clarity,
    relevance: aiEval.relevance,
  });

  const answerRecord = {
    id: `ans_${Date.now()}`,
    questionId,
    answerText: trimmed,
    score: computedScore,
    correctness: aiEval.correctness,
    technicalDepth: aiEval.technical_depth,
    clarity: aiEval.clarity,
    relevance: aiEval.relevance,
    feedback: aiEval.feedback,
    followUp: aiEval.follow_up || null,
    createdAt: new Date().toISOString(),
  };

  question.answer = answerRecord;
  syncToStorage();

  return answerRecord;
}

/**
 * Finalizes an interview session, calculates overall scores and generates final report.
 *
 * @param {string} interviewId
 * @returns {Promise<Object>} The completed interview session
 */
export async function completeInterviewSession(interviewId) {
  syncFromStorage();
  const session = memoryStore.get(interviewId);
  if (!session) {
    throw new Error("Interview session not found");
  }

  // If already completed, idempotent return
  if (session.status === "completed" && session.report) {
    return session;
  }

  const answered = session.questions.filter((q) => q.answer != null);
  if (answered.length < session.questions.length) {
    throw new Error("All questions must be answered before completing the interview");
  }

  const answerScores = answered.map((q) => q.answer.score);
  const rawRubrics = answered.map((q) => ({
    correctness: q.answer.correctness,
    technical_depth: q.answer.technicalDepth,
    clarity: q.answer.clarity,
    relevance: q.answer.relevance,
  }));

  // 1. Compute scores strictly through lib/scoring.js
  const overallScore = calculateOverallScore(answerScores);
  const metrics = calculateResultMetrics(rawRubrics);

  // 2. Generate comprehensive AI report
  const report = await generateReport({
    role: session.jobRole,
    type: session.interviewType,
    difficulty: session.difficulty,
    metrics: {
      overall: overallScore,
      ...metrics,
    },
    items: answered.map((q) => ({
      question: q.questionText,
      topic: q.topic,
      category: q.category,
      answer: q.answer.answerText,
      score: q.answer.score,
      feedbackSummary: q.answer.feedback.did_well,
    })),
  });

  session.status = "completed";
  session.overallScore = overallScore;
  session.metrics = metrics;
  session.report = report;
  session.completedAt = new Date().toISOString();

  syncToStorage();
  return session;
}
