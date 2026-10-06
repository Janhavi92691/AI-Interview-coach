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

  try {
    const pdfModule = await import("pdf-parse");

    let extractedText = "";

    // 1. pdf-parse v2+ API (PDFParse class)
    if (pdfModule.PDFParse) {
      const parser = new pdfModule.PDFParse({ data: buffer });
      const result = await parser.getText();
      extractedText = typeof result === "string" ? result : result?.text || "";
    }
    // 2. pdf-parse v1 API (default export function)
    else if (typeof pdfModule.default === "function") {
      const data = await pdfModule.default(buffer);
      extractedText = data.text || "";
    } else if (typeof pdfModule === "function") {
      const data = await pdfModule(buffer);
      extractedText = data.text || "";
    } else {
      throw new Error("Unsupported pdf-parse module format.");
    }

    const cleanText = extractedText.replace(/\r\n/g, "\n").trim();

    if (!cleanText || cleanText.length < 20) {
      throw new AppError(
        "INVALID_INPUT",
        "Could not extract sufficient text from this PDF. Please ensure it is not a scanned image or empty document.",
        400
      );
    }

    // Enforce safe upper bound
    if (cleanText.length > MAX_PDF_TEXT_LENGTH) {
      return cleanText.slice(0, MAX_PDF_TEXT_LENGTH);
    }

    return cleanText;
  } catch (err) {
    if (err instanceof AppError) throw err;
    console.error("[PDF Extraction Error]", err);
    throw new AppError(
      "INVALID_INPUT",
      "Unable to parse PDF file. Please ensure it is a valid, unencrypted PDF document.",
      400,
      err
    );
  }
}
