/**
 * @file tests/resume-blob.test.mjs
 * @description Unit and integration tests for Phase 5:
 * 1. Azure Blob Storage upload, download, and deletion (private partition <userId>/<resumeId>.pdf)
 * 2. PDF text extraction error handling and size guardrails
 * 3. Resume metadata persistence and SQL ownership isolation
 */

import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { uploadResumeBlob, getResumeBlobBuffer, deleteResumeBlob, resetMemoryBlobStorage } from "../lib/blob.js";
import { extractPdfText } from "../lib/pdf.js";
import { query, resetMemoryDb } from "../lib/db.js";

// Minimal valid PDF structure with sample text stream
const SAMPLE_PDF = Buffer.from(
  "%PDF-1.4\n" +
  "1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj\n" +
  "2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj\n" +
  "3 0 obj <</Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R>> endobj\n" +
  "4 0 obj <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>> endobj\n" +
  "5 0 obj <</Length 100>> stream\n" +
  "BT\n/F1 12 Tf\n100 700 Td\n(Full Stack Engineer with 3 years experience building cloud applications in Node.js, React, and Azure.) Tj\nET\n" +
  "endstream\nendobj\n" +
  "xref\n0 6\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000261 00000 n\n0000000337 00000 n\n" +
  "trailer <</Size 6 /Root 1 0 R>>\nstartxref\n490\n%%EOF\n"
);

describe("Phase 5: Azure Blob Storage Management", () => {
  beforeEach(() => {
    resetMemoryBlobStorage();
  });

  test("uploadResumeBlob partitions under <userId>/<resumeId>.pdf", async () => {
    const userId = "u-user-777";
    const resumeId = "res-uuid-888";
    const sampleBuffer = Buffer.from("PDF_FILE_BINARY_MOCK_CONTENT");

    const blobPath = await uploadResumeBlob(userId, resumeId, sampleBuffer, "application/pdf");
    assert.equal(blobPath, `${userId}/${resumeId}.pdf`, "Path must follow <userId>/<resumeId>.pdf convention");

    const retrievedBuffer = await getResumeBlobBuffer(blobPath);
    assert.ok(retrievedBuffer.equals(sampleBuffer), "Downloaded buffer must match uploaded content exactly");
  });

  test("deleteResumeBlob removes the blob from storage", async () => {
    const userId = "u-user-999";
    const resumeId = "res-uuid-111";
    const blobPath = await uploadResumeBlob(userId, resumeId, Buffer.from("TEMP"), "application/pdf");

    const deleted = await deleteResumeBlob(blobPath);
    assert.equal(deleted, true);

    await assert.rejects(
      async () => await getResumeBlobBuffer(blobPath),
      /Resume file not found/,
      "Subsequent download must return 404"
    );
  });
});

describe("Phase 5: PDF Text Extraction & Validation", () => {
  test("extractPdfText rejects empty buffer", async () => {
    await assert.rejects(
      async () => await extractPdfText(Buffer.alloc(0)),
      /Uploaded PDF file is empty/,
      "Must reject 0-byte buffer"
    );
  });

  test("extractPdfText extracts readable text from valid PDF document", async () => {
    const text = await extractPdfText(SAMPLE_PDF);
    assert.ok(typeof text === "string", "Extracted text must be string");
    assert.ok(text.length >= 20, "Should contain extracted words");
    assert.ok(text.includes("Full Stack") || text.includes("Engineer"), "Should contain candidate qualifications");
  });
});

describe("Phase 5: Resume Database Persistence & Ownership", () => {
  beforeEach(() => {
    resetMemoryDb();
  });

  test("Resume record persists metadata and JSON analysis", async () => {
    const userId = "u-owner-01";
    const resumeId = "res-db-01";
    const analysisObj = {
      skills: ["Cloud Architecture", "Azure SQL"],
      technologies: ["Node.js", "React"],
      projects: [{ name: "Cloud App", summary: "Distributed system" }],
      education: ["B.Tech CS"],
      certifications: ["AZ-900"],
      experience: [],
    };

    const insertRes = await query(
      `INSERT INTO dbo.resumes (id, user_id, file_name, blob_path, file_size_bytes, analysis)
       VALUES (@id, @user_id, @file_name, @blob_path, @file_size_bytes, @analysis)`,
      {
        id: resumeId,
        user_id: userId,
        file_name: "janhavi_resume.pdf",
        blob_path: `${userId}/${resumeId}.pdf`,
        file_size_bytes: 1048576,
        analysis: JSON.stringify(analysisObj),
      }
    );
    assert.equal(insertRes.recordset.length, 1);

    // Fetch by owner
    const fetchRes = await query(
      "SELECT id, file_name, analysis FROM dbo.resumes WHERE id = @id AND user_id = @user_id",
      { id: resumeId, user_id: userId }
    );
    assert.equal(fetchRes.recordset.length, 1);
    assert.equal(fetchRes.recordset[0].file_name, "janhavi_resume.pdf");

    // Fetch by different user (horizontal isolation)
    const unauthorizedRes = await query(
      "SELECT id FROM dbo.resumes WHERE id = @id AND user_id = @user_id",
      { id: resumeId, user_id: "u-different-user" }
    );
    assert.equal(unauthorizedRes.recordset.length, 0, "Non-owner must not be able to view another candidate's resume");
  });
});
