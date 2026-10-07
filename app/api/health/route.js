/**
 * @file app/api/health/route.js
 * @description Cloud health probe endpoint for Azure App Service and Azure Monitor.
 * Uses native Web API Response.json() without requiring runtime-specific imports.
 */

import { isAzureSqlConfigured } from "../../../lib/db.js";
import { isAzureStorageConfigured } from "../../../lib/blob.js";

export async function GET() {
  return Response.json({
    status: "ok",
    app: process.env.NEXT_PUBLIC_APP_NAME || "AI Interview Coach",
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    providers: {
      ai: (process.env.AI_PROVIDER || "mock").toLowerCase(),
      database: isAzureSqlConfigured() ? "azure-sql" : "memory-fallback",
      storage: isAzureStorageConfigured() ? "azure-blob" : "memory-fallback",
    },
  });
}
