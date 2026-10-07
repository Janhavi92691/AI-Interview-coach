/**
 * @file instrumentation.js
 * @description Next.js server startup hook for OpenTelemetry and Azure Application Insights.
 * Initializes distributed tracing when APPLICATIONINSIGHTS_CONNECTION_STRING is present.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
    if (connectionString) {
      try {
        const { useAzureMonitor: setupAzureMonitor } = await import("@azure/monitor-opentelemetry");
        setupAzureMonitor();
        console.log("[Observability] Azure Monitor OpenTelemetry initialized successfully.");
      } catch (err) {
        console.warn("[Observability] Failed to initialize Azure Monitor OpenTelemetry:", err.message);
      }
    }
  }
}
