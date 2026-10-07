/**
 * @file tests/health.test.mjs
 * @description Cloud health check probe verification test.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { GET } from "../app/api/health/route.js";

describe("Phase 7: Cloud Health Probe", () => {
  test("GET /api/health returns HTTP 200 with ok status and cloud provider telemetry", async () => {
    const res = await GET();
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.status, "ok");
    assert.ok(typeof body.uptimeSeconds === "number");
    assert.ok(typeof body.timestamp === "string");
    assert.ok(body.providers);
    assert.ok(body.providers.ai);
    assert.ok(body.providers.database);
    assert.ok(body.providers.storage);
  });
});
