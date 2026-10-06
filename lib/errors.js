/**
 * @file lib/errors.js
 * @description Standardized application errors with safe, user-facing error messages.
 * Never exposes Azure keys, stack traces, or internal error bodies to clients.
 */

export const SAFE_ERROR_MESSAGES = {
  AI_UNAVAILABLE: "Unable to generate the interview at the moment. Please try again.",
  AI_INVALID_OUTPUT: "Unable to parse AI response. Please try again.",
  AI_EVALUATION_FAILED: "Unable to evaluate your answer. Please try again.",
  AI_RESUME_FAILED: "Unable to analyze resume. Please try again.",
  AI_REPORT_FAILED: "Unable to generate the final report. Please try again.",
  DB_ERROR: "We couldn't save your interview. Please try again.",
  AUTH_INVALID_CREDENTIALS: "Invalid email or password.",
  AUTH_DUPLICATE_EMAIL: "An account with this email already exists.",
  UNAUTHORIZED: "You must be logged in to access this resource.",
  FORBIDDEN: "You do not have permission to access this resource.",
  NOT_FOUND: "The requested resource was not found.",
  INVALID_INPUT: "Invalid request payload. Please check your inputs.",
  UPLOAD_FAILED: "Resume upload failed. Please check the file and try again.",
  RATE_LIMITED: "Too many requests. Please slow down and try again shortly.",
};

export class AppError extends Error {
  /**
   * @param {keyof typeof SAFE_ERROR_MESSAGES} code
   * @param {string} [customMessage]
   * @param {number} [status]
   * @param {any} [cause]
   */
  constructor(code, customMessage, status = 500, cause = null) {
    const safeMessage = customMessage || SAFE_ERROR_MESSAGES[code] || "An unexpected error occurred. Please try again.";
    super(safeMessage);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.cause = cause;
  }
}

/**
 * Converts any caught error into a safe JSON response structure.
 * Internal server errors log the real error server-side while masking specifics from the client.
 *
 * @param {any} error
 * @returns {{ body: { error: { code: string, message: string } }, status: number }}
 */
export function toErrorResponse(error) {
  if (error instanceof AppError) {
    if (error.status >= 500) {
      console.error(`[AppError ${error.code}] ${error.message}`, error.cause || "");
    }
    return {
      body: {
        error: {
          code: error.code,
          message: error.message,
        },
      },
      status: error.status,
    };
  }

  // Unhandled / third-party / system error
  console.error("[UnhandledError]", error);
  return {
    body: {
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred. Please try again.",
      },
    },
    status: 500,
  };
}
