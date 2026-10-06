/**
 * @file app/api/dashboard/stats/route.js
 * @description Aggregates candidate performance metrics from Azure SQL for the dashboard overview.
 */

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { toErrorResponse } from "@/lib/errors";

export async function GET() {
  try {
    const user = await getCurrentUser({ requireAuth: true });

    // 1. Fetch user's completed and in-progress interviews
    const interviewsRes = await query(
      `SELECT id, job_role, interview_type, difficulty, total_questions,
              status, overall_score, created_at, completed_at
       FROM dbo.interviews
       WHERE user_id = @user_id
       ORDER BY created_at DESC`,
      { user_id: user.id }
    );

    const interviews = interviewsRes.recordset;
    const completed = interviews.filter((i) => i.status === "completed" && i.overall_score !== null);

    // 2. Compute aggregate metrics
    const totalInterviews = completed.length;
    const averageScore = totalInterviews > 0
      ? Math.round(completed.reduce((acc, curr) => acc + curr.overall_score, 0) / totalInterviews)
      : 0;

    // 3. Fetch answered questions count & rubric averages
    const answersRes = await query(
      `SELECT a.score, a.correctness, a.technical_depth, a.clarity, a.relevance, q.category
       FROM dbo.answers a
       JOIN dbo.questions q ON a.question_id = q.id
       JOIN dbo.interviews i ON q.interview_id = i.id
       WHERE i.user_id = @user_id`,
      { user_id: user.id }
    );

    const answers = answersRes.recordset;
    const totalQuestionsAnswered = answers.length;

    // Category breakdown
    const categoryTotals = {
      Technical: { count: 0, sum: 0 },
      HR: { count: 0, sum: 0 },
      Resume: { count: 0, sum: 0 },
    };

    for (const ans of answers) {
      if (categoryTotals[ans.category]) {
        categoryTotals[ans.category].count++;
        categoryTotals[ans.category].sum += ans.score;
      }
    }

    const categoryBreakdown = Object.entries(categoryTotals).map(([cat, val]) => ({
      category: cat,
      average: val.count > 0 ? Math.round((val.sum / val.count) * 10) : 0,
      count: val.count,
    }));

    // Recent 5 interviews
    const recentInterviews = interviews.slice(0, 5);

    return NextResponse.json({
      stats: {
        totalInterviews,
        averageScore,
        totalQuestionsAnswered,
        totalHours: Math.round((totalQuestionsAnswered * 3) / 60 * 10) / 10, // ~3 mins per question estimation
      },
      categoryBreakdown,
      recentInterviews,
    });
  } catch (error) {
    const errRes = toErrorResponse(error);
    return NextResponse.json(errRes.body, { status: errRes.status });
  }
}
