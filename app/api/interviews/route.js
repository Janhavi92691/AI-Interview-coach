/**
 * @file app/api/interviews/route.js
 * @description Creates new interview sessions atomically in Azure SQL and lists candidate history.
 */

import { NextResponse } from "next/server";
import { query, withTransaction } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createInterviewSchema } from "@/lib/validations";
import { ai } from "@/lib/ai";
import { AppError, toErrorResponse } from "@/lib/errors";
import { trackEvent } from "@/lib/telemetry";

export async function GET() {
  try {
    const user = await getCurrentUser({ requireAuth: true });

    const result = await query(
      `SELECT id, job_role, interview_type, difficulty, total_questions,
              status, overall_score, created_at, completed_at
       FROM dbo.interviews
       WHERE user_id = @user_id
       ORDER BY created_at DESC`,
      { user_id: user.id }
    );

    return NextResponse.json({
      interviews: result.recordset,
    });
  } catch (error) {
    const errRes = toErrorResponse(error);
    return NextResponse.json(errRes.body, { status: errRes.status });
  }
}

export async function POST(req) {
  try {
    const user = await getCurrentUser({ requireAuth: true });
    const body = await req.json();

    const validation = createInterviewSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Invalid interview configuration.";
      throw new AppError("INVALID_INPUT", firstError, 400);
    }

    const { job_role, interview_type, difficulty, total_questions, resume_id } = validation.data;

    // Optional resume text lookup if resume_id is provided
    let resumeText = null;
    if (resume_id) {
      const resumeRow = await query(
        "SELECT analysis FROM dbo.resumes WHERE id = @resume_id AND user_id = @user_id",
        { resume_id, user_id: user.id }
      );
      if (resumeRow.recordset.length > 0 && resumeRow.recordset[0].analysis) {
        resumeText = resumeRow.recordset[0].analysis;
      }
    }

    // Generate questions using AI facade (routes to Mock or Azure OpenAI)
    const { questions: generatedQuestions } = await ai.generateQuestions({
      job_role,
      interview_type,
      difficulty,
      count: total_questions,
      resume_text: resumeText,
    });

    const interviewId = crypto.randomUUID();

    // Persist interview and questions atomically inside a SQL transaction
    const savedQuestions = await withTransaction(async (tx) => {
      // 1. Insert Interview row
      await tx.query(
        `INSERT INTO dbo.interviews (id, user_id, resume_id, job_role, interview_type, difficulty, total_questions, status)
         VALUES (@id, @user_id, @resume_id, @job_role, @interview_type, @difficulty, @total_questions, 'in_progress')`,
        {
          id: interviewId,
          user_id: user.id,
          resume_id: resume_id || null,
          job_role,
          interview_type,
          difficulty,
          total_questions,
        }
      );

      // 2. Insert each Question row
      const questionsWithIds = [];
      for (let i = 0; i < generatedQuestions.length; i++) {
        const q = generatedQuestions[i];
        const questionId = crypto.randomUUID();
        const order = i + 1;

        await tx.query(
          `INSERT INTO dbo.questions (id, interview_id, question_text, topic, category, question_order, is_follow_up)
           VALUES (@id, @interview_id, @question_text, @topic, @category, @question_order, 0)`,
          {
            id: questionId,
            interview_id: interviewId,
            question_text: q.question,
            topic: q.topic,
            category: q.category,
            question_order: order,
          }
        );

        questionsWithIds.push({
          id: questionId,
          interview_id: interviewId,
          question_text: q.question,
          topic: q.topic,
          category: q.category,
          question_order: order,
        });
      }

      return questionsWithIds;
    });

    trackEvent("InterviewCreated", {
      interviewId,
      userId: user.id,
      jobRole: job_role,
      interviewType: interview_type,
      difficulty,
      questionCount: total_questions,
    });

    return NextResponse.json(
      {
        interview: {
          id: interviewId,
          user_id: user.id,
          job_role,
          interview_type,
          difficulty,
          total_questions,
          status: "in_progress",
        },
        questions: savedQuestions,
      },
      { status: 201 }
    );
  } catch (error) {
    const errRes = toErrorResponse(error);
    return NextResponse.json(errRes.body, { status: errRes.status });
  }
}
