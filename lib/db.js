/**
 * @file lib/db.js
 * @description Azure SQL Database connection pool and query interface.
 * Implements:
 * 1. Singleton connection pool on globalThis (handles serverless invocations & Next.js hot reload).
 * 2. Exponential backoff retry for Azure SQL Serverless cold-starts (Error 40613).
 * 3. 100% Parameterized queries via request.input() to prevent SQL injection.
 * 4. Atomic transaction support.
 * 5. Seamless dev/offline mock database fallback when Azure SQL credentials are not yet configured.
 */

import sql from "mssql";
import { AppError } from "./errors.js";

const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 2000;
const SERVERLESS_PAUSE_ERROR_CODE = 40613;

/**
 * Checks if all required Azure SQL environment variables are present.
 * @returns {boolean}
 */
export function isAzureSqlConfigured() {
  return Boolean(
    process.env.AZURE_SQL_SERVER &&
    process.env.AZURE_SQL_DATABASE &&
    process.env.AZURE_SQL_USER &&
    process.env.AZURE_SQL_PASSWORD
  );
}

/**
 * Builds Azure SQL connection configuration from environment variables.
 * @returns {import("mssql").config}
 */
function getMssqlConfig() {
  return {
    server: process.env.AZURE_SQL_SERVER,
    database: process.env.AZURE_SQL_DATABASE,
    user: process.env.AZURE_SQL_USER,
    password: process.env.AZURE_SQL_PASSWORD,
    port: parseInt(process.env.AZURE_SQL_PORT || "1433", 10),
    options: {
      encrypt: true, // Required for Azure SQL
      trustServerCertificate: false,
      connectTimeout: 30000,
      requestTimeout: 30000,
    },
    pool: {
      min: 0,
      max: 10,
      idleTimeoutMillis: 30000,
    },
  };
}

/**
 * Obtains or creates the singleton MSSQL ConnectionPool.
 * Handles transient serverless auto-pause (Error 40613) with exponential backoff.
 * @returns {Promise<import("mssql").ConnectionPool>}
 */
export async function getPool() {
  if (globalThis._mssqlPool && globalThis._mssqlPool.connected) {
    return globalThis._mssqlPool;
  }

  const config = getMssqlConfig();
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      if (globalThis._mssqlPool) {
        try {
          await globalThis._mssqlPool.close();
        } catch {
          // ignore close error on stale pool
        }
      }

      const pool = new sql.ConnectionPool(config);
      await pool.connect();
      globalThis._mssqlPool = pool;
      return pool;
    } catch (err) {
      attempt++;
      const isServerlessPause = err.number === SERVERLESS_PAUSE_ERROR_CODE || err.code === "ESOCKET";
      console.warn(`[AzureSQL] Connection attempt ${attempt} failed: ${err.message}`);

      if (isServerlessPause && attempt < MAX_RETRIES) {
        const delay = BASE_BACKOFF_MS * Math.pow(2, attempt - 1);
        console.info(`[AzureSQL] Serverless instance may be resuming. Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else if (attempt >= MAX_RETRIES) {
        throw new AppError("DB_ERROR", "Database connection failed after multiple retry attempts.", 503, err);
      } else {
        throw new AppError("DB_ERROR", "Failed to connect to database.", 500, err);
      }
    }
  }

  throw new AppError("DB_ERROR", "Unable to establish database connection.", 503);
}

// ============================================================================
// OFFLINE / DEV IN-MEMORY DATABASE FALLBACK
// Enables local testing & UI flows before the user provisions Azure SQL in portal
// ============================================================================

const memoryDb = {
  users: new Map(), // id -> user
  usersByEmail: new Map(), // email -> user
  resumes: new Map(),
  interviews: new Map(),
  questions: new Map(),
  answers: new Map(),
};

/**
 * Internal helper to run parameterized queries against the active database
 * (Azure SQL or in-memory fallback).
 *
 * @param {string} sqlText - T-SQL query string
 * @param {Record<string, any>} [params] - Key-value parameter map (e.g. { userId: "..." })
 * @returns {Promise<{ recordset: any[], rowsAffected: number[] }>}
 */
export async function query(sqlText, params = {}) {
  if (isAzureSqlConfigured()) {
    const pool = await getPool();
    const request = pool.request();

    for (const [key, val] of Object.entries(params)) {
      request.input(key, val);
    }

    try {
      const result = await request.query(sqlText);
      return {
        recordset: result.recordset || [],
        rowsAffected: result.rowsAffected || [0],
      };
    } catch (err) {
      console.error("[AzureSQL Query Error]", err);
      throw new AppError("DB_ERROR", "Database query execution failed.", 500, err);
    }
  }

  // Fallback Dev Memory Engine
  return executeMemoryQuery(sqlText, params);
}

/**
 * Executes a callback within a managed SQL transaction.
 * Automatically commits on completion and rolls back on failure.
 *
 * @param {(txRequest: import("mssql").Request | any) => Promise<any>} callback
 * @returns {Promise<any>}
 */
export async function withTransaction(callback) {
  if (isAzureSqlConfigured()) {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      const request = new sql.Request(transaction);
      const result = await callback(request);
      await transaction.commit();
      return result;
    } catch (err) {
      try {
        await transaction.rollback();
      } catch {
        // ignore rollback errors
      }
      throw err;
    }
  }

  // Memory fallback doesn't require distributed locks
  return callback({
    query: (text, params) => query(text, params),
  });
}

/**
 * Lightweight mock SQL engine for local test runs and offline demonstration.
 * Parses the essential schema queries used by the app.
 */
function executeMemoryQuery(sqlText, params = {}) {
  const normalized = sqlText.trim().replace(/\s+/g, " ");

  // 1. INSERT dbo.users
  if (normalized.includes("INSERT INTO dbo.users")) {
    const id = params.id || crypto.randomUUID();
    const user = {
      id,
      name: params.name,
      email: params.email?.toLowerCase(),
      password_hash: params.password_hash,
      created_at: new Date().toISOString(),
    };
    memoryDb.users.set(id, user);
    memoryDb.usersByEmail.set(user.email, user);
    return { recordset: [{ id: user.id }], rowsAffected: [1] };
  }

  // 2. SELECT dbo.users by email
  if (normalized.includes("FROM dbo.users") && normalized.includes("email = @email")) {
    const email = params.email?.toLowerCase();
    const user = memoryDb.usersByEmail.get(email);
    return { recordset: user ? [user] : [], rowsAffected: [user ? 1 : 0] };
  }

  // 3. SELECT dbo.users by id
  if (normalized.includes("FROM dbo.users") && normalized.includes("id = @id")) {
    const user = memoryDb.users.get(params.id);
    return { recordset: user ? [user] : [], rowsAffected: [user ? 1 : 0] };
  }

  // 4. INSERT dbo.interviews
  if (normalized.includes("INSERT INTO dbo.interviews")) {
    const id = params.id || crypto.randomUUID();
    const interview = {
      id,
      user_id: params.user_id,
      resume_id: params.resume_id || null,
      job_role: params.job_role,
      interview_type: params.interview_type,
      difficulty: params.difficulty,
      total_questions: Number(params.total_questions),
      status: "in_progress",
      overall_score: null,
      report: null,
      created_at: new Date().toISOString(),
      completed_at: null,
    };
    memoryDb.interviews.set(id, interview);
    return { recordset: [{ id }], rowsAffected: [1] };
  }

  // 5. INSERT dbo.questions
  if (normalized.includes("INSERT INTO dbo.questions")) {
    const id = params.id || crypto.randomUUID();
    const question = {
      id,
      interview_id: params.interview_id,
      question_text: params.question_text,
      topic: params.topic,
      category: params.category,
      question_order: Number(params.question_order),
      is_follow_up: Boolean(params.is_follow_up),
      parent_question_id: params.parent_question_id || null,
    };
    memoryDb.questions.set(id, question);
    return { recordset: [{ id }], rowsAffected: [1] };
  }

  // 6. SELECT dbo.interviews list by user_id
  if (normalized.includes("FROM dbo.interviews") && normalized.includes("user_id = @user_id") && !normalized.includes("id = @id")) {
    const list = Array.from(memoryDb.interviews.values())
      .filter((i) => i.user_id === params.user_id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { recordset: list, rowsAffected: [list.length] };
  }

  // 7. SELECT dbo.interviews single by id and user_id
  if (normalized.includes("FROM dbo.interviews") && normalized.includes("id = @id")) {
    const interview = memoryDb.interviews.get(params.id);
    if (!interview || (params.user_id && interview.user_id !== params.user_id)) {
      return { recordset: [], rowsAffected: [0] };
    }
    return { recordset: [interview], rowsAffected: [1] };
  }

  // 8. SELECT dbo.questions by interview_id
  if (normalized.includes("FROM dbo.questions") && normalized.includes("interview_id = @interview_id")) {
    const list = Array.from(memoryDb.questions.values())
      .filter((q) => q.interview_id === params.interview_id)
      .sort((a, b) => a.question_order - b.question_order);
    return { recordset: list, rowsAffected: [list.length] };
  }

  // 9. INSERT dbo.answers
  if (normalized.includes("INSERT INTO dbo.answers")) {
    const id = params.id || crypto.randomUUID();
    const answer = {
      id,
      question_id: params.question_id,
      answer_text: params.answer_text,
      score: Number(params.score),
      correctness: Number(params.correctness),
      technical_depth: Number(params.technical_depth),
      clarity: Number(params.clarity),
      relevance: Number(params.relevance),
      feedback: typeof params.feedback === "string" ? params.feedback : JSON.stringify(params.feedback),
      created_at: new Date().toISOString(),
    };
    memoryDb.answers.set(id, answer);
    return { recordset: [{ id }], rowsAffected: [1] };
  }

  // 10. SELECT dbo.answers by question_id or interview questions
  if (normalized.includes("FROM dbo.answers") && normalized.includes("question_id = @question_id")) {
    const answer = Array.from(memoryDb.answers.values()).find((a) => a.question_id === params.question_id);
    return { recordset: answer ? [answer] : [], rowsAffected: [answer ? 1 : 0] };
  }

  if (normalized.includes("FROM dbo.answers") && normalized.includes("question_id IN")) {
    // Return answers for questions of an interview
    const questionIds = Array.from(memoryDb.questions.values())
      .filter((q) => q.interview_id === params.interview_id)
      .map((q) => q.id);
    const answers = Array.from(memoryDb.answers.values()).filter((a) => questionIds.includes(a.question_id));
    return { recordset: answers, rowsAffected: [answers.length] };
  }

  // 11. UPDATE dbo.interviews status & report
  if (normalized.includes("UPDATE dbo.interviews")) {
    const interview = memoryDb.interviews.get(params.id);
    if (interview) {
      if (params.status !== undefined) interview.status = params.status;
      if (params.overall_score !== undefined) interview.overall_score = Number(params.overall_score);
      if (params.report !== undefined) interview.report = params.report;
      if (params.completed_at !== undefined) interview.completed_at = params.completed_at;
      return { recordset: [interview], rowsAffected: [1] };
    }
    return { recordset: [], rowsAffected: [0] };
  }

  // Default empty result
  return { recordset: [], rowsAffected: [0] };
}

/**
 * Resets the in-memory database store (primarily for unit tests).
 */
export function resetMemoryDb() {
  memoryDb.users.clear();
  memoryDb.usersByEmail.clear();
  memoryDb.resumes.clear();
  memoryDb.interviews.clear();
  memoryDb.questions.clear();
  memoryDb.answers.clear();
}
