/**
 * @file tests/functions-provider.test.mjs
 * @description Unit and integration tests for Phase 6 Azure Functions HTTP client provider:
 * 1. URL formatting and x-functions-key header attachment
 * 2. Zod contract validation on functions responses
 * 3. Graceful AppError mapping on serverless worker failure
 * 4. Provider switching logic in lib/ai/index.js
 */

import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  functionsGenerateQuestions,
  functionsEvaluateAnswer,
  functionsAnalyzeResume,
  functionsGenerateReport,
} from "../lib/ai/functions-client.js";
import { ai } from "../lib/ai/index.js";
import { AppError } from "../lib/errors.js";

const originalFetch = globalThis.fetch;
const originalEnv = { ...process.env };

describe("Phase 6: Azure Functions Client Provider", () => {
  beforeEach(() => {
    process.env.AZURE_FUNCTIONS_BASE_URL = "https://func-test-mock.azurewebsites.net";
    process.env.AZURE_FUNCTIONS_KEY = "test-secret-host-key-12345";
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    process.env = { ...originalEnv };
  });

  test("functionsGenerateQuestions calls Azure Function with correct URL and key", async () => {
    let capturedUrl = null;
    let capturedHeaders = null;
    let capturedBody = null;

    globalThis.fetch = async (url, options) => {
      capturedUrl = url;
      capturedHeaders = options.headers;
      capturedBody = JSON.parse(options.body);

      return {
        ok: true,
        status: 200,
        json: async () => ({
          questions: [
            { question: "Explain event loop phases in Node.js.", topic: "Node.js Event Loop", category: "Technical" },
            { question: "How do you handle scope creep during sprints?", topic: "Agile Delivery", category: "HR" },
          ],
        }),
      };
    };

    const result = await functionsGenerateQuestions({
      role: "Full Stack Engineer",
      type: "Mixed",
      difficulty: "Intermediate",
      count: 2,
    });

    assert.equal(capturedUrl, "https://func-test-mock.azurewebsites.net/api/generateQuestions");
    assert.equal(capturedHeaders["x-functions-key"], "test-secret-host-key-12345");
    assert.equal(capturedBody.role, "Full Stack Engineer");
    assert.equal(result.questions.length, 2);
    assert.equal(result.questions[0].category, "Technical");
  });

  test("functionsEvaluateAnswer parses and validates rubric schema", async () => {
    globalThis.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        correctness: 8,
        technical_depth: 7,
        clarity: 9,
        relevance: 9,
        feedback: {
          did_well: "Clear technical description.",
          missing: "Could mention libuv thread pool sizing.",
          improve: "Provide quantitative benchmarks.",
        },
        follow_up: null,
      }),
    });

    const evalResult = await functionsEvaluateAnswer({
      role: "Backend Engineer",
      difficulty: "Intermediate",
      question: "How does Node.js handle async I/O?",
      topic: "Async I/O",
      category: "Technical",
      answer: "Node.js delegates file and network I/O to libuv which utilizes OS non-blocking primitives.",
    });

    assert.equal(evalResult.correctness, 8);
    assert.equal(evalResult.technical_depth, 7);
    assert.equal(evalResult.feedback.did_well, "Clear technical description.");
  });

  test("Serverless worker failure returns safe AppError without exposing raw internals", async () => {
    globalThis.fetch = async () => ({
      ok: false,
      status: 503,
      text: async () => "Internal server error inside serverless container",
    });

    await assert.rejects(
      async () => await functionsGenerateQuestions({ role: "DevOps Engineer", count: 3 }),
      (err) => {
        assert.ok(err instanceof AppError);
        assert.equal(err.code, "AI_UNAVAILABLE");
        assert.equal(err.status, 503);
        return true;
      }
    );
  });

  test("AI Facade routes to functions when AI_PROVIDER=functions", async () => {
    process.env.AI_PROVIDER = "functions";

    let functionCalled = false;
    globalThis.fetch = async () => {
      functionCalled = true;
      return {
        ok: true,
        status: 200,
        json: async () => ({
          questions: [
            { question: "What is an Azure Application Gateway?", topic: "Networking", category: "Technical" },
          ],
        }),
      };
    };

    const res = await ai.generateQuestions({ role: "Cloud Architect", count: 1 });
    assert.equal(functionCalled, true, "Should have dispatched request to Azure Functions worker");
    assert.equal(res.questions.length, 1);
  });
});
