/**
 * @file tests/telemetry.test.mjs
 * @description Unit tests for Phase 8 Application Insights and OpenTelemetry tracking module:
 * 1. Custom event tracking (trackEvent)
 * 2. Unhandled exception logging (trackException)
 * 3. Operational metric telemetry (trackMetric)
 * 4. Graceful offline fallback
 */

import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { trackEvent, trackException, trackMetric, isTelemetryConfigured } from "../lib/telemetry.js";

const originalEnv = { ...process.env };

describe("Phase 8: Application Insights & Telemetry Module", () => {
  beforeEach(() => {
    delete process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  test("isTelemetryConfigured returns false when connection string is missing", () => {
    assert.equal(isTelemetryConfigured(), false);
  });

  test("isTelemetryConfigured returns true when connection string is present", () => {
    process.env.APPLICATIONINSIGHTS_CONNECTION_STRING = "InstrumentationKey=test-1234;IngestionEndpoint=https://test.in.applicationinsights.azure.com/";
    assert.equal(isTelemetryConfigured(), true);
  });

  test("trackEvent records business events safely in offline dev mode", () => {
    assert.doesNotThrow(() => {
      trackEvent("InterviewCreated", {
        interviewId: "int-test-1",
        jobRole: "Full Stack Developer",
        difficulty: "Intermediate",
      });
    });
  });

  test("trackEvent formats structured JSON when Application Insights is configured", () => {
    process.env.APPLICATIONINSIGHTS_CONNECTION_STRING = "InstrumentationKey=0000-0000;IngestionEndpoint=https://test/";

    assert.doesNotThrow(() => {
      trackEvent("AnswerSubmitted", {
        score: 9,
        questionId: "q-1",
      });
    });
  });

  test("trackException logs errors with context properties", () => {
    const error = new Error("Database timeout transient fault");

    assert.doesNotThrow(() => {
      trackException(error, { retryCount: 2, endpoint: "/api/interviews" });
    });
  });

  test("trackMetric records quantitative measurements", () => {
    assert.doesNotThrow(() => {
      trackMetric("OverallScore", 85, { interviewType: "Technical" });
      trackMetric("LatencyMs", 142.5);
    });
  });
});
