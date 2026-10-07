/**
 * @file app/api/interviews/[id]/complete/route.js
 * @description Finalizes an interview, calculates the overall score, generates a performance report,
 * and updates Azure SQL. Idempotent: returning stored report if already completed.
 */

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ai } from "@/lib/ai";
import { calculateOverallScore } from "@/lib/scoring";
import { AppError, toErrorResponse } from "@/lib/errors";
import { trackEvent, trackMetric } from "@/lib/telemetry";

export async function POST(req, { params }) {
  try {
    const user = await getCurrentUser({ requireAuth: true });
    const { id: interviewId } = await params;

    // 1. Fetch interview with ownership check
    const interviewRes = await query(
      `SELECT id, job_role, difficulty, status, overall_score, report, created_at
       FROM dbo.interviews
       WHERE id = @id AND user_id = @user_id`,
      { id: interviewId, user_id: user.id }
    );

    if (interviewRes.recordset.length === 0) {
      throw new AppError("NOT_FOUND", "Interview session not found.", 404);
    }

    const interview = interviewRes.recordset[0];

    // 2. IDEMPOTENT CHECK: If already completed, return existing stored report immediately
    if (interview.status === "completed" && interview.report) {
      const parsedReport = typeof interview.report === "string" ? JSON.parse(interview.report) : interview.report;
      return NextResponse.json({
        interview: {
          ...interview,
          report: parsedReport,
        },
        report: parsedReport,
        overall_score: interview.overall_score,
      });
    }

    // 3. Fetch questions and answers
    const questionsRes = await query(
      `SELECT id, question_text, topic, category, question_order
       FROM dbo.questions
       WHERE interview_id = @interview_id
       ORDER BY question_order ASC`,
      { interview_id: interviewId }
    );

    const questions = questionsRes.recordset;

    const answersRes = await query(
      `SELECT a.question_id, a.answer_text, a.score, a.correctness, a.technical_depth, a.clarity, a.relevance, a.feedback
       FROM dbo.answers a
       JOIN dbo.questions q ON a.question_id = q.id
       WHERE q.interview_id = @interview_id`,
      { interview_id: interviewId }
    );

    const answers = answersRes.recordset;

    if (answers.length === 0) {
      throw new AppError("INVALID_INPUT", "Cannot complete an interview with no answered questions.", 400);
    }

    // 4. Calculate overall score (0-100) using pure mathematical engine
    const answerScores = answers.map((a) => a.score);
    const overallScore = calculateOverallScore(answerScores);

    // 5. Generate structured synthesis report via AI facade
    const formattedQAs = questions.map((q) => {
      const ans = answers.find((a) => a.question_id === q.id);
      return {
        question: q.question_text,
        topic: q.topic,
        category: q.category,
        answer: ans ? ans.answer_text : "(No answer provided)",
        score: ans ? ans.score : 0,
      };
    });

    const report = await ai.generateReport({
      job_role: interview.job_role,
      difficulty: interview.difficulty,
      questions_and_answers: formattedQAs,
      overall_score: overallScore,
    });

    const completedAt = new Date().toISOString();

    // 6. Persist completion to Azure SQL
    await query(
      `UPDATE dbo.interviews
       SET status = 'completed',
           overall_score = @overall_score,
           report = @report,
           completed_at = @completed_at
       WHERE id = @id`,
      {
        id: interviewId,
        overall_score: overallScore,
        report: JSON.stringify(report),
        completed_at: completedAt,
      }
    );

    trackEvent("InterviewCompleted", {
      interviewId,
      userId: user.id,
      overallScore,
      jobRole: interview.job_role,
      difficulty: interview.difficulty,
    });
    trackMetric("OverallInterviewScore", overallScore, { interviewId });

    return NextResponse.json({
      interview: {
        ...interview,
        status: "completed",
        overall_score: overallScore,
        report,
        completed_at: completedAt,
      },
      report,
      overall_score: overallScore,
    });
  } catch (error) {
    const errRes = toErrorResponse(error);
    return NextResponse.json(errRes.body, { status: errRes.status });
  }
}
