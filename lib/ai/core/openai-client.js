/**
 * @file lib/ai/core/openai-client.js
 * @description Official Azure OpenAI client singleton using the openai npm package.
 * Credentials are read exclusively from server-side environment variables.
 */

import { AzureOpenAI } from "openai";
import { AppError } from "../../errors.js";

let cachedClient = null;

/**
 * Returns a configured AzureOpenAI client instance.
 * Throws AppError('AI_UNAVAILABLE') if required environment variables are absent.
 *
 * @returns {AzureOpenAI}
 */
export function getAzureOpenAIClient() {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-08-01-preview";

  if (!endpoint || !apiKey) {
    throw new AppError(
      "AI_UNAVAILABLE",
      "Azure OpenAI is not configured. Please verify AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY.",
      502
    );
  }

  if (!cachedClient) {
    cachedClient = new AzureOpenAI({
      endpoint,
      apiKey,
      apiVersion,
      timeout: 30000, // 30s timeout per call
    });
  }

  return cachedClient;
}

/**
 * Returns the configured deployment name.
 *
 * @returns {string}
 */
export function getAzureDeploymentName() {
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  if (!deployment) {
    throw new AppError(
      "AI_UNAVAILABLE",
      "Azure OpenAI deployment is not configured. Please set AZURE_OPENAI_DEPLOYMENT.",
      502
    );
  }
  return deployment;
}
