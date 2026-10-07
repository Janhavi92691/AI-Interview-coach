/**
 * @file scripts/e2e-live-verify.mjs
 * @description Phase 9 End-to-End Live Verification Script.
 * Verifies live Cloud Health Probe, Authentication lifecycle, Session Cookies,
 * Interview Creation, Question Answering, Scoring, Completion, and Dashboard APIs.
 *
 * Usage:
 *   node scripts/e2e-live-verify.mjs [BASE_URL]
 * Default BASE_URL: process.env.LIVE_APP_URL or "http://localhost:3000"
 */

const BASE_URL = (process.argv[2] || process.env.LIVE_APP_URL || "http://localhost:3000").replace(/\/$/, "");

console.log("=====================================================");
console.log(`🌐 CLOUD END-TO-END VERIFICATION: ${BASE_URL}`);
console.log("=====================================================\n");

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`✅ PASSED: ${message}`);
  passed++;
}

async function runVerification() {
  // 1. Health Probe Verification
  console.log("--- Step 1: Probing /api/health ---");
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  assert(healthRes.status === 200, `Health check returned HTTP 200 (Got ${healthRes.status})`);
  const healthData = await healthRes.json();
  assert(healthData.status === "ok", "Health payload status is 'ok'");
  assert(Boolean(healthData.telemetry?.aiProvider), `AI Provider detected: ${healthData.telemetry?.aiProvider}`);
  console.log("Health Payload:", JSON.stringify(healthData, null, 2));

  // 2. Authentication Lifecycle: Signup
  console.log("\n--- Step 2: User Registration (/api/auth/signup) ---");
  const uniqueSuffix = Date.now();
  const testEmail = `candidate_${uniqueSuffix}@example.com`;
  const testPassword = "StrongPassword@123!";
  const testName = `Candidate ${uniqueSuffix}`;

  const signupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: testName,
      email: testEmail,
      password: testPassword,
    }),
  });

  assert(signupRes.status === 201, `Candidate signup returned HTTP 201 (Got ${signupRes.status})`);
  const rawSetCookie = signupRes.headers.get("set-cookie") || "";
  assert(rawSetCookie.includes("aic_session"), "Signup returned HttpOnly aic_session cookie");

  // Extract session cookie for subsequent authenticated calls
  const sessionCookie = rawSetCookie.split(";")[0];
  const authHeaders = {
    "Content-Type": "application/json",
    Cookie: sessionCookie,
  };

  // 3. Current User Verification
  console.log("\n--- Step 3: Verify Session (/api/auth/me) ---");
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, { headers: authHeaders });
  assert(meRes.status === 200, `Session verification returned HTTP 200`);
  const meData = await meRes.json();
  assert(meData.user?.email === testEmail, `Session belongs to ${testEmail}`);

  // 4. Create Interview Session
  console.log("\n--- Step 4: Create Interview Session (/api/interviews) ---");
  const createIntRes = await fetch(`${BASE_URL}/api/interviews`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      jobRole: "Full Stack Developer",
      interviewType: "Technical",
      difficulty: "Intermediate",
      targetQuestionCount: 3,
    }),
  });

  assert(createIntRes.status === 201, `Create interview returned HTTP 201 (Got ${createIntRes.status})`);
  const interviewPayload = await createIntRes.json();
  const interview = interviewPayload.interview;
  assert(Boolean(interview?.id), `Interview created with ID: ${interview?.id}`);
  assert(Array.isArray(interview.questions) && interview.questions.length > 0, "Interview contains generated questions");
  console.log(`Generated ${interview.questions.length} questions for role: ${interview.role}`);

  // 5. Submit Answers to Interview Questions
  console.log("\n--- Step 5: Submit Answers & Receive AI Evaluation ---");
  const question = interview.questions[0];
  const answerRes = await fetch(`${BASE_URL}/api/interviews/${interview.id}/answers`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      questionId: question.id,
      answer: "In Next.js, Server Components render on the server without shipping client JavaScript, whereas Client Components enable interactive hooks like useState.",
    }),
  });

  assert(answerRes.status === 200, `Answer submission returned HTTP 200 (Got ${answerRes.status})`);
  const answerPayload = await answerRes.json();
  assert(typeof answerPayload.evaluation?.score === "number", `Evaluation received with score: ${answerPayload.evaluation?.score}`);
  assert(Boolean(answerPayload.evaluation?.feedback?.did_well), "Rubric feedback contains 'did_well' note");

  // 6. Complete Interview & Generate Final Report
  console.log("\n--- Step 6: Complete Interview (/api/interviews/[id]/complete) ---");
  const completeRes = await fetch(`${BASE_URL}/api/interviews/${interview.id}/complete`, {
    method: "POST",
    headers: authHeaders,
  });

  assert(completeRes.status === 200, `Complete interview returned HTTP 200 (Got ${completeRes.status})`);
  const completePayload = await completeRes.json();
  assert(completePayload.interview?.status === "completed", "Interview status updated to 'completed'");
  assert(typeof completePayload.interview?.overall_score === "number", `Calculated overall score: ${completePayload.interview?.overall_score}`);
  assert(Boolean(completePayload.interview?.report?.summary), "Executive summary present in completion report");

  // 7. Verify Dashboard Analytics & History
  console.log("\n--- Step 7: Candidate Dashboard Analytics (/api/dashboard/stats) ---");
  const statsRes = await fetch(`${BASE_URL}/api/dashboard/stats`, { headers: authHeaders });
  assert(statsRes.status === 200, "Dashboard stats returned HTTP 200");
  const statsPayload = await statsRes.json();
  assert(statsPayload.stats?.totalInterviews >= 1, `Total interviews count: ${statsPayload.stats?.totalInterviews}`);
  assert(Array.isArray(statsPayload.recentInterviews) && statsPayload.recentInterviews.length >= 1, "Recent interviews history contains completed interview");

  // 8. Logout
  console.log("\n--- Step 8: User Logout (/api/auth/logout) ---");
  const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
    method: "POST",
    headers: authHeaders,
  });
  assert(logoutRes.status === 200, "Logout returned HTTP 200");

  console.log("\n=====================================================");
  console.log(`🎉 ALL ${passed}/${total} LIVE E2E VERIFICATION STEPS PASSED!`);
  console.log("=====================================================\n");
}

runVerification().catch((err) => {
  console.error("\n❌ E2E Verification failed:", err.message);
  process.exit(1);
});
