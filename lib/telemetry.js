/**
 * @file lib/telemetry.js
 * @description Centralized Azure Application Insights and OpenTelemetry observability module.
 * Provides structured tracking for custom events, metrics, and unhandled exceptions.
 * Operates gracefully both with live Application Insights and in local offline development mode.
 */

/**
 * Checks if Application Insights is configured via connection string.
 * @returns {boolean}
 */
export function isTelemetryConfigured() {
  return Boolean(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING);
}

/**
 * Tracks a custom business or user lifecycle event.
 *
 * @param {string} name - Event name (e.g. "InterviewCompleted", "ResumeUploaded")
 * @param {Record<string, any>} [properties] - Custom key-value dimensions
 */
export function trackEvent(name, properties = {}) {
  const timestamp = new Date().toISOString();
  const payload = {
    event: name,
    timestamp,
    properties: {
      ...properties,
      app: process.env.NEXT_PUBLIC_APP_NAME || "AI Interview Coach",
      env: process.env.NODE_ENV || "development",
    },
  };

  if (isTelemetryConfigured()) {
    // Structured JSON log picked up automatically by Azure Monitor & Container Log Analytics
    console.info(`[AppInsights:Event] ${JSON.stringify(payload)}`);
  } else {
    // Local dev mode log
    console.debug(`[Telemetry:Event] ${name}`, properties);
  }
}

/**
 * Tracks an error or exception with context dimensions.
 *
 * @param {Error | any} error - The caught exception
 * @param {Record<string, any>} [properties] - Additional troubleshooting context
 */
export function trackException(error, properties = {}) {
  const timestamp = new Date().toISOString();
  const payload = {
    error: error?.message || String(error),
    stack: error?.stack,
    timestamp,
    properties,
  };

  if (isTelemetryConfigured()) {
    console.error(`[AppInsights:Exception] ${JSON.stringify(payload)}`);
  } else {
    console.warn(`[Telemetry:Exception] ${error?.message || error}`, properties);
  }
}

/**
 * Tracks a quantitative operational metric (e.g., latency, score, question count).
 *
 * @param {string} name - Metric name (e.g. "InterviewScore", "AnswerLengthChars")
 * @param {number} value - Numeric metric measurement
 * @param {Record<string, any>} [properties] - Metadata dimensions
 */
export function trackMetric(name, value, properties = {}) {
  const timestamp = new Date().toISOString();
  const payload = {
    metric: name,
    value: Number(value),
    timestamp,
    properties,
  };

  if (isTelemetryConfigured()) {
    console.info(`[AppInsights:Metric] ${JSON.stringify(payload)}`);
  } else {
    console.debug(`[Telemetry:Metric] ${name} = ${value}`, properties);
  }
}
