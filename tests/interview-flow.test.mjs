import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createInterviewSession,
  getInterviewSession,
  submitQuestionAnswer,
  completeInterviewSession,
} from "../lib/interview-store.js";
import { calculateAnswerScore, calculateOverallScore } from "../lib/scoring.js";

test("interview-flow: full end-to-end 5-question lifecycle", async () => {
  // 1. Setup & create session
  const session = await createInterviewSession({
    role: "Full Stack Developer",
    type: "Technical",
    difficulty: "Intermediate",
    count: 5,
  });

  assert.ok(session.id);
  assert.equal(session.questions.length, 5);
  assert.equal(session.status, "in_progress");

  // 2. Validation: Empty answer should throw
  await assert.rejects(
    async () => {
      await submitQuestionAnswer({
        interviewId: session.id,
        questionId: session.questions[0].id,
        answerText: "   ",
      });
    },
    /empty/
  );

  // 3. Validation: Over 4000 characters should throw
  await assert.rejects(
    async () => {
      await submitQuestionAnswer({
        interviewId: session.id,
        questionId: session.questions[0].id,
        answerText: "a".repeat(4001),
      });
    },
    /4000/
  );

  // 4. Answer all 5 questions one by one
  for (let i = 0; i < session.questions.length; i++) {
    const q = session.questions[i];
    const answerResult = await submitQuestionAnswer({
      interviewId: session.id,
      questionId: q.id,
      answerText: `This is a comprehensive response to question ${i + 1}. We analyze the system architecture, discuss the trade-offs, and implement error boundaries and performance optimization strategies.`,
    });

    assert.ok(answerResult.score >= 0 && answerResult.score <= 10);
    assert.ok(answerResult.feedback.did_well);
    assert.ok(answerResult.feedback.missing);
    assert.ok(answerResult.feedback.improve);

    // Verify score was computed with scoring formula
    const expected = calculateAnswerScore({
      correctness: answerResult.correctness,
      technical_depth: answerResult.technicalDepth,
      clarity: answerResult.clarity,
      relevance: answerResult.relevance,
    });
    assert.equal(answerResult.score, expected);
  }

  // 5. Duplicate submit on an already-answered question should reject
  await assert.rejects(
    async () => {
      await submitQuestionAnswer({
        interviewId: session.id,
        questionId: session.questions[0].id,
        answerText: "Trying to submit again",
      });
    },
    /already been answered/
  );

  // 6. Complete interview
  const completed = await completeInterviewSession(session.id);
  assert.equal(completed.status, "completed");
  assert.ok(completed.overallScore >= 0 && completed.overallScore <= 100);
  assert.ok(completed.metrics.technicalKnowledge >= 0);
  assert.ok(completed.metrics.answerQuality >= 0);
  assert.ok(completed.metrics.clarity >= 0);
  assert.ok(completed.report.summary.length > 20);
  assert.ok(completed.report.strengths.length > 0);
  assert.ok(completed.report.recommended_topics.length > 0);

  // Verify overall score equals the lib/scoring.js formula
  const scores = completed.questions.map((q) => q.answer.score);
  assert.equal(completed.overallScore, calculateOverallScore(scores));

  // 7. Idempotency: Completing again returns the stored completed result
  const again = await completeInterviewSession(session.id);
  assert.equal(again.overallScore, completed.overallScore);
});
