/**
 * @file app/api/resumes/upload/route.js
 * @description Uploads candidate resume PDF, extracts text, analyzes skills/projects with AI,
 * stores the PDF in private Azure Blob Storage, and persists metadata in Azure SQL.
 */

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { uploadResumeBlob } from "@/lib/blob";
import { extractPdfText } from "@/lib/pdf";
import { query } from "@/lib/db";
import { ai } from "@/lib/ai";
import { AppError, toErrorResponse } from "@/lib/errors";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req) {
  try {
    const user = await getCurrentUser({ requireAuth: true });

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      throw new AppError("INVALID_INPUT", "No resume file was uploaded.", 400);
    }

    // Validate mime type and file extension
    const fileName = file.name || "resume.pdf";
    const isPdf = file.type === "application/pdf" || fileName.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      throw new AppError("INVALID_INPUT", "Only PDF documents (.pdf) are supported.", 400);
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new AppError("INVALID_INPUT", "Resume file size exceeds the 5MB limit.", 400);
    }

    // Convert file to Node.js Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Extract plain text from PDF
    const resumeText = await extractPdfText(buffer);

    // 2. Perform AI structural analysis (skills, technologies, projects)
    const analysis = await ai.analyzeResume({ resumeText });

    const resumeId = crypto.randomUUID();

    // 3. Upload to private Azure Blob Storage partitioned by <userId>/<resumeId>.pdf
    const blobPath = await uploadResumeBlob(user.id, resumeId, buffer, "application/pdf");

    const createdAt = new Date().toISOString();

    // 4. Save metadata and analysis to Azure SQL
    await query(
      `INSERT INTO dbo.resumes (id, user_id, file_name, blob_path, file_size_bytes, analysis, created_at)
       VALUES (@id, @user_id, @file_name, @blob_path, @file_size_bytes, @analysis, @created_at)`,
      {
        id: resumeId,
        user_id: user.id,
        file_name: fileName,
        blob_path: blobPath,
        file_size_bytes: file.size,
        analysis: JSON.stringify(analysis),
        created_at: createdAt,
      }
    );

    return NextResponse.json(
      {
        resume: {
          id: resumeId,
          fileName,
          fileSizeBytes: file.size,
          blobPath,
          analysis,
          createdAt,
        },
        message: "Resume uploaded and analyzed successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    const errRes = toErrorResponse(error);
    return NextResponse.json(errRes.body, { status: errRes.status });
  }
}
