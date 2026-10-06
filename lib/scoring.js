/**
 * @file lib/scoring.js
 * @description Pure scoring engine for AI Interview Coach.
 * All formulas, rubric label mappings, and aggregate metric calculations are centralized here.
 */

/**
 * Computes an individual answer's score on a 0–10 scale.
 * Formula: round(0.40 * correctness + 0.30 * technical_depth + 0.15 * clarity + 0.15 * relevance)
 *
 * @param {Object} rubric
 * @param {number} rubric.correctness - 0 to 10
 * @param {number} rubric.technical_depth - 0 to 10
 * @param {number} rubric.clarity - 0 to 10
 * @param {number} rubric.relevance - 0 to 10
 * @returns {number} Integer score between 0 and 10
 */
export function calculateAnswerScore({
  correctness = 0,
  technical_depth = 0,
  clarity = 0,
  relevance = 0,
}) {
  const c = Math.max(0, Math.min(10, Number(correctness) || 0));
  const d = Math.max(0, Math.min(10, Number(technical_depth) || 0));
  const cl = Math.max(0, Math.min(10, Number(clarity) || 0));
  const r = Math.max(0, Math.min(10, Number(relevance) || 0));

  const weighted = 0.40 * c + 0.30 * d + 0.15 * cl + 0.15 * r;
  return Math.max(0, Math.min(10, Math.round(weighted)));
}

/**
 * Maps a 0–10 score to a user-facing qualitative label and styling token.
 * 0–3: "Needs Work"
 * 4–5: "Fair"
 * 6–7: "Good"
 * 8–9: "Very Good"
 * 10: "Excellent"
 *
 * @param {number} score - 0 to 10
 * @returns {{ label: string, color: string }}
 */
export function getScoreLabel(score) {
  const s = Math.round(score);
  if (s >= 10) return { label: "Excellent", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" };
  if (s >= 8) return { label: "Very Good", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" };
  if (s >= 6) return { label: "Good", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" };
  if (s >= 4) return { label: "Fair", color: "bg-amber-500/15 text-amber-400 border-amber-500/30" };
  return { label: "Needs Work", color: "bg-red-500/15 text-red-400 border-red-500/30" };
}

/**
 * Computes overall interview score on a 0–100 scale.
 * Formula: round(average(answer scores) * 10)
 *
 * @param {number[]} answerScores - Array of individual 0-10 answer scores
 * @returns {number} Score between 0 and 100
 */
export function calculateOverallScore(answerScores = []) {
  if (!Array.isArray(answerScores) || answerScores.length === 0) return 0;
  const sum = answerScores.reduce((acc, curr) => acc + (Number(curr) || 0), 0);
  const avg = sum / answerScores.length;
  return Math.max(0, Math.min(100, Math.round(avg * 10)));
}

/**
 * Computes high-level report metrics (%) across all answered questions.
 * Technical Knowledge = avg(technical_depth) * 10
 * Answer Quality = avg(correctness, relevance) * 10
 * Clarity = avg(clarity) * 10
 *
 * @param {Array<{ correctness: number, technical_depth: number, clarity: number, relevance: number }>} answers
 * @returns {{ technicalKnowledge: number, answerQuality: number, clarity: number }}
 */
export function calculateResultMetrics(answers = []) {
  if (!Array.isArray(answers) || answers.length === 0) {
    return { technicalKnowledge: 0, answerQuality: 0, clarity: 0 };
  }

  const n = answers.length;
  let totalDepth = 0;
  let totalQuality = 0;
  let totalClarity = 0;

  for (const a of answers) {
    const c = Number(a.correctness) || 0;
    const d = Number(a.technical_depth) || 0;
    const cl = Number(a.clarity) || 0;
    const r = Number(a.relevance) || 0;

    totalDepth += d;
    totalQuality += (c + r) / 2;
    totalClarity += cl;
  }

  return {
    technicalKnowledge: Math.max(0, Math.min(100, Math.round((totalDepth / n) * 10))),
    answerQuality: Math.max(0, Math.min(100, Math.round((totalQuality / n) * 10))),
    clarity: Math.max(0, Math.min(100, Math.round((totalClarity / n) * 10))),
  };
}

/**
 * Returns color classes based on a 0–100 overall score.
 * >= 80 green, 60–79 amber, < 60 red.
 *
 * @param {number} score
 * @returns {{ text: string, bg: string, border: string, label: string }}
 */
export function getScoreColorTokens(score) {
  if (score >= 80) {
    return {
      text: "text-emerald-400",
      bg: "bg-emerald-500/15",
      border: "border-emerald-500/30",
      label: "Strong Performance",
    };
  }
  if (score >= 60) {
    return {
      text: "text-amber-400",
      bg: "bg-amber-500/15",
      border: "border-amber-500/30",
      label: "Proficient",
    };
  }
  return {
    text: "text-red-400",
    bg: "bg-red-500/15",
    border: "border-red-500/30",
    label: "Needs Work",
  };
}
