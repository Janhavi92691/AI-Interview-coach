import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calculateAnswerScore,
  getScoreLabel,
  calculateOverallScore,
  calculateResultMetrics,
  getScoreColorTokens,
} from "../lib/scoring.js";

test("calculateAnswerScore - boundary values", () => {
  assert.equal(
    calculateAnswerScore({ correctness: 10, technical_depth: 10, clarity: 10, relevance: 10 }),
    10,
    "Full score should yield 10"
  );
  assert.equal(
    calculateAnswerScore({ correctness: 0, technical_depth: 0, clarity: 0, relevance: 0 }),
    0,
    "Zero across the board should yield 0"
  );
});

test("calculateAnswerScore - weighting verification", () => {
  // Correctness weight = 40%
  assert.equal(
    calculateAnswerScore({ correctness: 10, technical_depth: 0, clarity: 0, relevance: 0 }),
    4
  );

  // Technical depth weight = 30%
  assert.equal(
    calculateAnswerScore({ correctness: 0, technical_depth: 10, clarity: 0, relevance: 0 }),
    3
  );

  // Clarity (15%) + Relevance (15%) = 30%
  assert.equal(
    calculateAnswerScore({ correctness: 0, technical_depth: 0, clarity: 10, relevance: 10 }),
    3
  );

  // Realistic mixture: 0.4*8 + 0.3*7 + 0.15*9 + 0.15*8 = 3.2 + 2.1 + 1.35 + 1.2 = 7.85 -> 8
  assert.equal(
    calculateAnswerScore({ correctness: 8, technical_depth: 7, clarity: 9, relevance: 8 }),
    8
  );
});

test("getScoreLabel - category chip mappings", () => {
  assert.equal(getScoreLabel(10).label, "Excellent");
  assert.equal(getScoreLabel(9).label, "Very Good");
  assert.equal(getScoreLabel(8).label, "Very Good");
  assert.equal(getScoreLabel(7).label, "Good");
  assert.equal(getScoreLabel(6).label, "Good");
  assert.equal(getScoreLabel(5).label, "Fair");
  assert.equal(getScoreLabel(4).label, "Fair");
  assert.equal(getScoreLabel(3).label, "Needs Work");
  assert.equal(getScoreLabel(0).label, "Needs Work");
});

test("calculateOverallScore - averages and scaling", () => {
  assert.equal(calculateOverallScore([]), 0);
  assert.equal(calculateOverallScore([10, 10, 10, 10, 10]), 100);
  assert.equal(calculateOverallScore([8, 8, 8, 8, 8]), 80);
  // Average 7.6 -> 76
  assert.equal(calculateOverallScore([7, 8, 7, 8, 9]), 78);
});

test("calculateResultMetrics - multi-dimensional breakdown", () => {
  const sampleAnswers = [
    { correctness: 9, technical_depth: 8, clarity: 7, relevance: 9 },
    { correctness: 7, technical_depth: 8, clarity: 9, relevance: 9 },
  ];

  const metrics = calculateResultMetrics(sampleAnswers);
  // Avg technical depth: (8+8)/2 * 10 = 80
  assert.equal(metrics.technicalKnowledge, 80);
  // Avg quality: (9+9)/2 = 9 for first, (7+9)/2 = 8 for second -> avg 8.5 * 10 = 85
  assert.equal(metrics.answerQuality, 85);
  // Avg clarity: (7+9)/2 * 10 = 80
  assert.equal(metrics.clarity, 80);
});

test("getScoreColorTokens - threshold styling", () => {
  assert.match(getScoreColorTokens(92).text, /emerald/);
  assert.match(getScoreColorTokens(75).text, /amber/);
  assert.match(getScoreColorTokens(45).text, /red/);
});
