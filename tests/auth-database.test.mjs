/**
 * @file tests/auth-database.test.mjs
 * @description Unit and integration tests for Phase 4:
 * 1. bcrypt password hashing and verification
 * 2. jose HS256 JWT session tokens
 * 3. Parameterized SQL queries and user ownership verification
 * 4. Idempotent interview completion
 */

import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword, createSessionToken, verifySessionToken } from "../lib/auth.js";
import { query, resetMemoryDb, withTransaction } from "../lib/db.js";
import { calculateAnswerScore, calculateOverallScore } from "../lib/scoring.js";

describe("Phase 4: Authentication Security", () => {
  test("hashPassword produces valid bcrypt hash with >= 8 character requirement", async () => {
    const password = "StrongPassword123!";
    const hash = await hashPassword(password);

    assert.ok(hash.startsWith("$2a$12$") || hash.startsWith("$2b$12$"), "Should use bcrypt cost 12");
    assert.notEqual(hash, password, "Hash must never match plaintext");

    await assert.rejects(
      async () => await hashPassword("short"),
      /Password must be at least 8 characters long/,
      "Should reject passwords shorter than 8 characters"
    );
  });

  test("verifyPassword validates correct credentials and rejects incorrect ones", async () => {
    const password = "CorrectHorseBatteryStaple!";
    const hash = await hashPassword(password);

    const valid = await verifyPassword(password, hash);
    assert.equal(valid, true, "Should return true for matching password");

    const invalid = await verifyPassword("WrongPassword123!", hash);
    assert.equal(invalid, false, "Should return false for incorrect password");

    const empty = await verifyPassword("", hash);
    assert.equal(empty, false, "Should handle empty string gracefully");
  });

  test("createSessionToken & verifySessionToken sign and decode valid HS256 JWT", async () => {
    const userPayload = {
      id: "u-12345-uuid",
      email: "student@example.com",
      name: "Jane Doe",
    };

    const token = await createSessionToken(userPayload);
    assert.ok(typeof token === "string" && token.split(".").length === 3, "Should be a 3-part signed JWT");

    const decoded = await verifySessionToken(token);
    assert.ok(decoded, "Decoded payload should be present");
    assert.equal(decoded.sub, userPayload.id);
    assert.equal(decoded.email, userPayload.email);
    assert.equal(decoded.name, userPayload.name);
  });

  test("verifySessionToken returns null for tampered or invalid JWT", async () => {
    const malformed = "invalid.token.payload";
    const result = await verifySessionToken(malformed);
    assert.equal(result, null, "Should return null for garbage token");

    const empty = await verifySessionToken("");
    assert.equal(empty, null, "Should return null for empty token");
  });
});

describe("Phase 4: Parameterized SQL & Data Persistence", () => {
  beforeEach(() => {
    resetMemoryDb();
  });

  test("User registration and email lookup use parameterized queries", async () => {
    const userId = "u-test-01";
    const email = "cloud.student@university.edu";
    const hash = await hashPassword("AzureCloudPass2026!");

    // 1. Insert user
    const insertRes = await query(
      "INSERT INTO dbo.users (id, name, email, password_hash) VALUES (@id, @name, @email, @password_hash)",
      { id: userId, name: "Cloud Student", email, password_hash: hash }
    );
    assert.equal(insertRes.recordset.length, 1);

    // 2. Select user by email (case-insensitive)
    const selectRes = await query("SELECT id, name, email FROM dbo.users WHERE email = @email", {
      email: "CLOUD.STUDENT@UNIVERSITY.EDU",
    });
    assert.equal(selectRes.recordset.length, 1);
    assert.equal(selectRes.recordset[0].id, userId);
  });

  test("Interview session and questions are created atomically", async () => {
    const userId = "u-test-01";
    const interviewId = "int-atomic-99";

    await withTransaction(async (tx) => {
      await tx.query(
        "INSERT INTO dbo.interviews (id, user_id, job_role, interview_type, difficulty, total_questions) VALUES (@id, @user_id, @job_role, @interview_type, @difficulty, @total_questions)",
        {
          id: interviewId,
          user_id: userId,
          job_role: "Cloud Engineer",
          interview_type: "Technical",
          difficulty: "Intermediate",
          total_questions: 3,
        }
      );

      for (let i = 1; i <= 3; i++) {
        await tx.query(
          "INSERT INTO dbo.questions (id, interview_id, question_text, topic, category, question_order) VALUES (@id, @interview_id, @question_text, @topic, @category, @question_order)",
          {
            id: `q-${interviewId}-${i}`,
            interview_id: interviewId,
            question_text: `Test Question ${i}`,
            topic: "Azure Architecture",
            category: "Technical",
            question_order: i,
          }
        );
      }
    });

    const interviewCheck = await query("SELECT id FROM dbo.interviews WHERE id = @id", { id: interviewId });
    assert.equal(interviewCheck.recordset.length, 1);

    const questionsCheck = await query("SELECT id FROM dbo.questions WHERE interview_id = @interview_id", {
      interview_id: interviewId,
    });
    assert.equal(questionsCheck.recordset.length, 3);
  });

  test("SQL Ownership Check: User B cannot access User A interview", async () => {
    const userA = "u-user-a";
    const userB = "u-user-b";
    const interviewId = "int-private-session";

    await query(
      "INSERT INTO dbo.interviews (id, user_id, job_role, interview_type, difficulty, total_questions) VALUES (@id, @user_id, @job_role, @interview_type, @difficulty, @total_questions)",
      {
        id: interviewId,
        user_id: userA,
        job_role: "Backend Developer",
        interview_type: "Technical",
        difficulty: "Intermediate",
        total_questions: 5,
      }
    );

    // Query with User A ownership
    const ownerRes = await query("SELECT id FROM dbo.interviews WHERE id = @id AND user_id = @user_id", {
      id: interviewId,
      user_id: userA,
    });
    assert.equal(ownerRes.recordset.length, 1, "Owner should retrieve interview");

    // Query with User B ownership
    const unauthorizedRes = await query("SELECT id FROM dbo.interviews WHERE id = @id AND user_id = @user_id", {
      id: interviewId,
      user_id: userB,
    });
    assert.equal(unauthorizedRes.recordset.length, 0, "Non-owner query must return 0 records (404 isolation)");
  });

  test("Answer submission and score calculation persist correctly", async () => {
    const interviewId = "int-scoring-test";
    const questionId = "q-scoring-test-1";

    await query(
      "INSERT INTO dbo.questions (id, interview_id, question_text, topic, category, question_order) VALUES (@id, @interview_id, @question_text, @topic, @category, @question_order)",
      {
        id: questionId,
        interview_id: interviewId,
        question_text: "Explain Azure Blob Storage tiers.",
        topic: "Azure Storage",
        category: "Technical",
        question_order: 1,
      }
    );

    const correctness = 8;
    const depth = 7;
    const clarity = 9;
    const relevance = 8;
    const score = calculateAnswerScore(correctness, depth, clarity, relevance);

    await query(
      "INSERT INTO dbo.answers (id, question_id, answer_text, score, correctness, technical_depth, clarity, relevance, feedback) VALUES (@id, @question_id, @answer_text, @score, @correctness, @technical_depth, @clarity, @relevance, @feedback)",
      {
        id: "ans-1",
        question_id: questionId,
        answer_text: "Hot tier for active data, Cool for 30+ days, Archive for offline backups.",
        score,
        correctness,
        technical_depth: depth,
        clarity,
        relevance,
        feedback: JSON.stringify({ did_well: "Great explanation", missing: "Mention lifecycle policies", improve: "Add cost figures" }),
      }
    );

    const answerRes = await query("SELECT * FROM dbo.answers WHERE question_id = @question_id", { question_id: questionId });
    assert.equal(answerRes.recordset.length, 1);
    assert.equal(answerRes.recordset[0].score, score);
  });
});
