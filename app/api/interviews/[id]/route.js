/**
 * @file app/api/interviews/[id]/route.js
 * @description Retrieves an interview session with its questions and submitted answers.
 * Enforces ownership verification at the SQL query level (returns 404 if not owned).
 */

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { AppError, toErrorResponse } from "@/lib/errors";

export async function GET(req, { params }) {
  try {
    const user = await getCurrentUser({ requireAuth: true });
    const { id } = await params;

    // Fetch interview enforcing user_id ownership
    const interviewRes = await query(
      `SELECT id, user_id, resume_id, job_role, interview_type, difficulty,
              total_questions, status, overall_score, report, created_at, completed_at
       FROM dbo.interviews
       WHERE id = @id AND user_id = @user_id`,
      { id, user_id: user.id }
    );

    if (interviewRes.recordset.length === 0) {
      throw new AppError("NOT_FOUND", "Interview session not found.", 404);
    }

    const interview = interviewRes.recordset[0];
    if (typeof interview.report === "string") {
      try {
        interview.report = JSON.parse(interview.report);
      } catch {
        // keep as is
      }
    }

    // Fetch questions
    const questionsRes = await query(
      `SELECT id, interview_id, question_text, topic, category, question_order, is_follow_up
       FROM dbo.questions
       WHERE interview_id = @interview_id
       ORDER BY question_order ASC`,
      { interview_id: id }
    );

    // Fetch answers
    const answersRes = await query(
      `SELECT a.id, a.question_id, a.answer_text, a.score, a.correctness,
              a.technical_depth, a.clarity, a.relevance, a.feedback, a.created_at
       FROM dbo.answers a
       JOIN dbo.questions q ON a.question_id = q.id
       WHERE q.interview_id = @interview_id`,
      { interview_id: id }
    );

    const answers = answersRes.recordset.map((ans) => ({
      ...ans,
      feedback: typeof ans.feedback === "string" ? JSON.parse(ans.feedback) : ans.feedback,
    }));

    return NextResponse.json({
      interview,
      questions: questionsRes.recordset,
      answers,
    });
  } catch (error) {
    const errRes = toErrorResponse(error);
    return NextResponse.json(errRes.body, { status: errRes.status });
  }
}
