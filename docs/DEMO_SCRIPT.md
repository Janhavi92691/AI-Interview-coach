# Live Demo & Viva Presentation Script

## 1. Demo Walkthrough Sequence (5–7 minutes)

### Step 1: Landing Page & Problem Statement (1 min)
- **Action**: Open the deployed web app URL (`https://app-interview-coach-...azurewebsites.net`).
- **Talking points**:
  - Introduce the tagline: *"Practice Smarter. Interview Better."*
  - Explain that students face anxiety and lack personalized feedback for technical interviews.
  - Highlight the architecture: Next.js frontend hosted on Azure App Service, serverless processing on Azure Functions, Azure SQL for structured relational data, and private Azure Blob Storage for resumes.

### Step 2: Authentication & User Dashboard (1 min)
- **Action**: Log in with a demo account or sign up a new account.
- **Talking points**:
  - Session is managed via secure, `httpOnly` signed JWT cookies (HS256 via `jose`).
  - Passwords hashed with `bcryptjs` (salt rounds 12).
  - Walk through dashboard analytics: completed interviews count, average score, strongest vs weakest topics.

### Step 3: Standard Technical Interview Flow (2 mins)
- **Action**: Click "Start New Interview", choose *Full Stack Developer*, *Technical*, *Intermediate*, *5 Questions*.
- **Talking points**:
  - Azure Functions worker calls Azure OpenAI with calibrated prompts and strict Zod schema validation.
  - Answer Question 1 (e.g. explain React Virtual DOM).
  - Submit answer: showcase instant evaluation with 4-metric scoring (Correctness, Depth, Clarity, Relevance) and actionable constructive feedback.

### Step 4: Resume-Based Interview (1.5 mins)
- **Action**: Navigate to "Resume", upload a sample PDF resume. Show extracted skills and projects.
- **Action**: Click "Start Resume-Based Interview".
- **Talking points**:
  - PDF text is extracted server-side, uploaded to private Azure Blob Storage (`resumes` container) under `<userId>/<resumeId>.pdf`.
  - Questions dynamically cite specific candidate projects and technologies listed in the uploaded resume.

### Step 5: Final Performance Report & Results (1 min)
- **Action**: Complete the interview and navigate to Results page.
- **Talking points**:
  - Show the animated overall score ring (0-100), AI summary, strengths, improvement areas, and recommended study topics.
  - Show per-question expandable breakdown.

---

## 2. Cloud Architecture & Telemetry Showcase (Viva section)
Open the **Azure Portal** to show the real cloud services backing the application:
1. **Application Insights -> Live Metrics**:
   - Send an answer in the app; point to the live request stream, CPU/memory telemetry, and active dependency calls.
2. **Transaction Search / End-to-End Traces**:
   - Inspect a single `/api/interviews` POST call showing the trace from App Service -> Azure Function -> Azure OpenAI.
3. **Application Insights -> Failures & Performance**:
   - Show how failed dependencies or transient timeouts are caught, retried, and tracked.
4. **Azure SQL Query Editor**:
   - Show parameterized rows in `dbo.interviews`, `dbo.questions`, and `dbo.answers`.
5. **Azure Blob Storage Explorer**:
   - Show private `<userId>/<resumeId>.pdf` blob paths in the `resumes` container.
