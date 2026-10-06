# Test Plan & Verification Matrix

| Area | Test Case | Target / Expected Result | Status |
|---|---|---|---|
| **Health** | GET `/api/health` | Returns `{ status: "ok" }` with HTTP 200 | Passed |
| **Auth** | Sign up with valid credentials | User created, hash salted with bcrypt, session cookie set | Planned (Phase 4) |
| **Auth** | Login with wrong password | Generic error "Invalid email or password" (HTTP 401) | Planned (Phase 4) |
| **Auth** | Unknown email login | Generic error "Invalid email or password" (timing-safe) | Planned (Phase 4) |
| **Auth** | Unauthenticated access to `/(app)` | Redirects to `/login?next=...` | Planned (Phase 4) |
| **Auth** | Cross-user resource access | Returns 404 (ownership check in SQL, no existence leak) | Planned (Phase 4) |
| **Interview** | Generate Technical questions | Category is 100% Technical, calibrated to chosen difficulty | Planned (Phase 2/3) |
| **Interview** | Generate Mixed questions | ~60% Technical / ~40% HR split | Planned (Phase 2/3) |
| **Interview** | Empty answer submission | Client validation blocks submission; server rejects | Planned (Phase 2/4) |
| **Interview** | Answer over 4000 characters | Validation error returned | Planned (Phase 2/4) |
| **Interview** | Re-answering already answered question | Returns 409 Conflict | Planned (Phase 4) |
| **Interview** | Completing interview twice | Idempotent: returns stored results without re-evaluating | Planned (Phase 4) |
| **Resume** | Valid text PDF upload | Stored in private blob, text extracted, AI analysis returned | Planned (Phase 5) |
| **Resume** | Fake PDF (.txt renamed to .pdf) | Magic bytes check fails -> rejected | Planned (Phase 5) |
| **Resume** | Scanned / empty PDF (<200 chars) | HTTP 422 with guidance to upload text-based resume | Planned (Phase 5) |
| **Resume** | Storage / AI failure compensation | Any uploaded blob is rolled back (no orphan files) | Planned (Phase 5) |
| **AI / Cloud** | Prompt injection in candidate answer | Evaluated purely on technical merit, manipulation ignored | Planned (Phase 3) |
| **Database** | Atomic interview creation | Interview + questions saved in a single SQL transaction | Planned (Phase 4) |
| **Database** | Serverless pause resilience | Transient connection retries with exponential backoff | Planned (Phase 4) |
| **Security** | Secrets leak check | No credentials in client bundle, Git repo, or responses | Ongoing |
