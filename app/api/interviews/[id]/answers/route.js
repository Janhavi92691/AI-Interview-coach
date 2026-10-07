/**
 * @file app/api/interviews/[id]/answers/route.js
 * @description Submits and evaluates a candidate's answer for a specific interview question.
 * Enforces ownership, conflict detection (prevent re-answering), and rubric scoring.
 */

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { submitAnswerSchema } from "@/lib/validations";
import { ai } from "@/lib/ai";
import { calculateAnswerScore } from "@/lib/scoring";
import { AppError, toErrorResponse } from "@/lib/errors";
import { trackEvent, trackMetric } from "@/lib/telemetry";

export async function POST(req, { params }) {
  try {
    const user = await getCurrentUser({ requireAuth: true });
    const { id: interviewId } = await params;
    const body = await req.json();

    const validation = submitAnswerSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Invalid answer submission.";
      throw new AppError("INVALID_INPUT", firstError, 400);
    }

    const { question_id, answer_text } = validation.data;

    // 1. Verify interview exists and is owned by the current user
    const interviewRes = await query(
      `SELECT id, difficulty, status FROM dbo.interviews WHERE id = @id AND user_id = @user_id`,
      { id: interviewId, user_id: user.id }
    );

    if (interviewRes.recordset.length === 0) {
      throw new AppError("NOT_FOUND", "Interview session not found.", 404);
    }

    const interview = interviewRes.recordset[0];
    if (interview.status !== "in_progress") {
      throw new AppError("INVALID_INPUT", "Cannot submit answers to a completed interview.", 400);
    }

    // 2. Verify question belongs to this interview
    const questionRes = await query(
      `SELECT id, question_text, topic, category FROM dbo.questions
       WHERE id = @id AND interview_id = @interview_id`,
      { id: question_id, interview_id: interviewId }
    );

    if (questionRes.recordset.length === 0) {
      throw new AppError("NOT_FOUND", "Question not found in this interview session.", 404);
    }

    const question = questionRes.recordset[0];

    // 3. Check for conflict: question already answered
    const existingAnswer = await query(
      `SELECT id FROM dbo.answers WHERE question_id = @question_id`,
      { question_id }
    );

    if (existingAnswer.recordset.length > 0) {
      throw new AppError("INVALID_INPUT", "This question has already been answered.", 409);
    }

    // 4. AI Evaluation
    const evaluation = await ai.evaluateAnswer({
      question: question.question_text,
      answer: answer_text,
      difficulty: interview.difficulty,
    });

    // 5. Calculate weighted rubric score (0-10) using pure mathematical engine
    const calculatedScore = calculateAnswerScore(
      evaluation.correctness,
      evaluation.technical_depth,
      evaluation.clarity,
      evaluation.relevance
    );

    const answerId = crypto.randomUUID();

    // 6. Insert answer into Azure SQL
    await query(
      `INSERT INTO dbo.answers (id, question_id, answer_text, score, correctness, technical_depth, clarity, relevance, feedback)
       VALUES (@id, @question_id, @answer_text, @score, @correctness, @technical_depth, @clarity, @relevance, @feedback)`,
      {
        id: answerId,
        question_id,
        answer_text,
        score: calculatedScore,
        correctness: evaluation.correctness,
        technical_depth: evaluation.technical_depth,
        clarity: evaluation.clarity,
        relevance: evaluation.relevance,
        feedback: JSON.stringify(evaluation.feedback),
      }
    );

    trackEvent("AnswerSubmitted", {
      interviewId,
      questionId,
      score: calculatedScore,
      userId: user.id,
    });
    trackMetric("AnswerScore", calculatedScore, { interviewId });

    return NextResponse.json(
      {
        answer: {
          id: answerId,
          question_id,
          answer_text,
          score: calculatedScore,
          correctness: evaluation.correctness,
          technical_depth: evaluation.technical_depth,
          clarity: evaluation.clarity,
          relevance: evaluation.relevance,
          feedback: evaluation.feedback,
          follow_up: evaluation.follow_up || null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const errRes = toErrorResponse(error);
    return NextResponse.json(errRes.body, { status: errRes.status });
  }
}
