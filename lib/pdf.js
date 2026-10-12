/**
 * @file lib/pdf.js
 * @description Modern server-side PDF text extraction engine using unpdf (PDF.js standard).
 * Supports complex fonts, encrypted font streams, multi-column resumes, and strict guardrails.
 */

import { AppError } from "./errors.js";

const MAX_PDF_TEXT_LENGTH = 50000; // Cap at 50,000 characters to prevent excessive tokens

/**
 * Extracts raw textual content from a PDF Buffer or Uint8Array.
 *
 * @param {Buffer | Uint8Array} buffer
 * @returns {Promise<string>}
 */
export async function extractPdfText(buffer) {
  if (!buffer || buffer.length === 0) {
    throw new AppError("INVALID_INPUT", "Uploaded PDF file is empty.", 400);
  }

  // Convert Buffer to pure Uint8Array (unpdf strictly forbids Buffer instances)
  const uint8Data = Uint8Array.from(buffer);

  let extractedText = "";

  try {
    const { extractText } = await import("unpdf");
    const result = await extractText(uint8Data);
    if (result && Array.isArray(result.text)) {
      extractedText = result.text.join("\n\n");
    } else if (typeof result?.text === "string") {
      extractedText = result.text;
    }
  } catch (primaryErr) {
    console.warn("[unpdf Extraction Warning] Primary extractor failed, attempting raw stream recovery:", primaryErr.message);

    // Fallback: Extract plain text blocks from uncompressed PDF streams
    try {
      const rawString = Buffer.from(uint8Data).toString("latin1");
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
      // Fallback failed
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
