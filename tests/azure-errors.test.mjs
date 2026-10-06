import { test } from "node:test";
import assert from "node:assert/strict";
import { getAzureOpenAIClient } from "../lib/ai/core/openai-client.js";
import { AppError } from "../lib/errors.js";

test("azure-errors: missing environment variables produces safe AppError", () => {
  // Save previous env
  const origEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const origKey = process.env.AZURE_OPENAI_API_KEY;

  delete process.env.AZURE_OPENAI_ENDPOINT;
  delete process.env.AZURE_OPENAI_API_KEY;

  assert.throws(
    () => {
      getAzureOpenAIClient();
    },
    (err) => {
      assert.ok(err instanceof AppError);
      assert.equal(err.code, "AI_UNAVAILABLE");
      assert.equal(err.status, 502);
      // Ensure no raw secret is exposed
      assert.doesNotMatch(err.message, /key=[a-zA-Z0-9]+/);
      return true;
    }
  );

  // Restore env
  if (origEndpoint) process.env.AZURE_OPENAI_ENDPOINT = origEndpoint;
  if (origKey) process.env.AZURE_OPENAI_API_KEY = origKey;
});
