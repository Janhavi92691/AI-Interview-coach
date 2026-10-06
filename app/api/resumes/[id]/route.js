/**
 * @file app/api/resumes/[id]/route.js
 * @description Retrieves or deletes a candidate resume with strict SQL ownership checks and Blob deletion.
 */

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { deleteResumeBlob } from "@/lib/blob";
import { AppError, toErrorResponse } from "@/lib/errors";

export async function GET(req, { params }) {
  try {
    const user = await getCurrentUser({ requireAuth: true });
    const { id } = await params;

    const result = await query(
      `SELECT id, file_name, blob_path, file_size_bytes, analysis, created_at
       FROM dbo.resumes
       WHERE id = @id AND user_id = @user_id`,
      { id, user_id: user.id }
    );

    if (result.recordset.length === 0) {
      throw new AppError("NOT_FOUND", "Resume not found.", 404);
    }

    const r = result.recordset[0];
    return NextResponse.json({
      resume: {
        id: r.id,
        fileName: r.file_name,
        blobPath: r.blob_path,
        fileSizeBytes: r.file_size_bytes,
        analysis: typeof r.analysis === "string" ? JSON.parse(r.analysis) : r.analysis,
        createdAt: r.created_at,
      },
    });
  } catch (error) {
    const errRes = toErrorResponse(error);
    return NextResponse.json(errRes.body, { status: errRes.status });
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = await getCurrentUser({ requireAuth: true });
    const { id } = await params;

    const result = await query(
      `SELECT id, blob_path FROM dbo.resumes WHERE id = @id AND user_id = @user_id`,
      { id, user_id: user.id }
    );

    if (result.recordset.length === 0) {
      throw new AppError("NOT_FOUND", "Resume not found.", 404);
    }

    const { blob_path } = result.recordset[0];

    // 1. Delete from Azure Blob Storage
    await deleteResumeBlob(blob_path);

    // 2. Delete from Azure SQL
    await query(`DELETE FROM dbo.resumes WHERE id = @id AND user_id = @user_id`, {
      id,
      user_id: user.id,
    });

    return NextResponse.json({
      success: true,
      message: "Resume deleted successfully.",
    });
  } catch (error) {
    const errRes = toErrorResponse(error);
    return NextResponse.json(errRes.body, { status: errRes.status });
  }
}
