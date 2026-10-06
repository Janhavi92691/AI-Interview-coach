/**
 * @file app/api/resumes/route.js
 * @description Retrieves all uploaded resumes for the currently authenticated user.
 */

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { toErrorResponse } from "@/lib/errors";

export async function GET() {
  try {
    const user = await getCurrentUser({ requireAuth: true });

    const result = await query(
      `SELECT id, file_name, blob_path, file_size_bytes, analysis, created_at
       FROM dbo.resumes
       WHERE user_id = @user_id
       ORDER BY created_at DESC`,
      { user_id: user.id }
    );

    const resumes = result.recordset.map((r) => ({
      id: r.id,
      fileName: r.file_name,
      blobPath: r.blob_path,
      fileSizeBytes: r.file_size_bytes,
      analysis: typeof r.analysis === "string" ? JSON.parse(r.analysis) : r.analysis,
      createdAt: r.created_at,
    }));

    return NextResponse.json({ resumes });
  } catch (error) {
    const errRes = toErrorResponse(error);
    return NextResponse.json(errRes.body, { status: errRes.status });
  }
}
