/**
 * @file lib/pdf.js
 * @description Server-side PDF text extraction engine.
 * Safely extracts textual content from uploaded PDF buffers with size and length guardrails.
 */

import { AppError } from "./errors.js";

const MAX_PDF_TEXT_LENGTH = 50000; // Cap at 50,000 characters to prevent excessive tokens

/**
 * Extracts raw textual content from a PDF Buffer.
 *
 * @param {Buffer | Uint8Array} buffer
 * @returns {Promise<string>}
 */
export async function extractPdfText(buffer) {
  if (!buffer || buffer.length === 0) {
    throw new AppError("INVALID_INPUT", "Uploaded PDF file is empty.", 400);
  }

  // Ensure standard Node.js Buffer
  const safeBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);

  let extractedText = "";

  try {
    const pdfModule = await import("pdf-parse");

    // 1. pdf-parse v2+ API (PDFParse class)
    if (pdfModule.PDFParse) {
      const parser = new pdfModule.PDFParse({ data: safeBuffer });
      try {
        const result = await parser.getText();
        extractedText = typeof result === "string" ? result : result?.text || "";
      } finally {
        if (typeof parser.destroy === "function") {
          try {
            await parser.destroy();
          } catch {
            // ignore cleanup errors
          }
        }
      }
    }
    // 2. pdf-parse v1 API (default export function)
    else if (typeof pdfModule.default === "function") {
      const data = await pdfModule.default(safeBuffer);
      extractedText = data.text || "";
    } else if (typeof pdfModule === "function") {
      const data = await pdfModule(safeBuffer);
      extractedText = data.text || "";
    }
  } catch (parseErr) {
    console.warn("[PDF Parser Warning] Primary parser failed, attempting stream recovery:", parseErr.message);

    // Fallback: Extract plain text blocks from uncompressed PDF streams
    try {
      const rawString = safeBuffer.toString("latin1");
      const textMatches = [];
      const streamRegex = /\(([^)]+)\)\s*Tj/g;
      let match;
      while ((match = streamRegex.exec(rawString)) !== null) {
        if (match[1] && match[1].length > 1) {
          textMatches.push(match[1]);
        }
      }
      if (textMatches.length > 5) {
        extractedText = textMatches.join(" ");
      }
    } catch {
      // Fallback failed, will throw below
    }
  }

  const cleanText = (extractedText || "").replace(/\r\n/g, "\n").trim();

  if (!cleanText || cleanText.length < 20) {
    throw new AppError(
      "INVALID_INPUT",
      "Could not extract sufficient text from this PDF. Please ensure it is a digital text document (not a scanned image or photo).",
      400
    );
  }

  // Enforce safe upper bound
  if (cleanText.length > MAX_PDF_TEXT_LENGTH) {
    return cleanText.slice(0, MAX_PDF_TEXT_LENGTH);
  }

  return cleanText;
}
