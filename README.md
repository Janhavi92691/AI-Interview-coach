# AI Interview Coach

> **Practice Smarter. Interview Better.**  
> *Your AI-powered personal interviewer for technical and HR interview preparation.*

[![Next.js](https://img.shields.io/badge/Next.js-16_App_Router-black)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS_v4-38B2AC)](https://tailwindcss.com/)
[![Azure Cloud](https://img.shields.io/badge/Azure-Cloud_Native-0078D4)](https://azure.microsoft.com/)

---

## 1. Project Overview
**AI Interview Coach** is a cloud-based web application engineered for college students and job seekers to practice technical and behavioral interviews with an AI interviewer. It provides real-time scoring, actionable rubric feedback, resume parsing, and longitudinal performance analytics.

Built for a **College Cloud Computing Submission**, live demonstration, and technical viva examination.

---

## 2. Cloud Architecture

```
Browser (React 19 / shadcn/ui)
   │  HTTPS, httpOnly signed JWT cookie session
   ▼
Azure App Service (Next.js App Router on Node.js LTS)
   ├── Route Handlers: auth, session security, business logic, scoring
   ├── Azure SQL Database (Serverless)   ← users, interviews, questions, answers, resumes
   ├── Azure Blob Storage                ← private container for PDF resumes (<userId>/<resumeId>.pdf)
   └── HTTP Request (server-to-server, Function key)
        ▼
   Azure Functions (Serverless AI Workers)
        ├── generateInterviewQuestions
        ├── evaluateAnswer
        ├── analyzeResume
        └── generateInterviewReport
             ▼
        Azure OpenAI / Azure AI Foundry (gpt-4o-mini / gpt-4o)

Application Insights / Azure Monitor ← Distributed tracing across App Service & Function App
```

---

## 3. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js (App Router, JavaScript/JSX) | Full-stack architecture, SSR/SSG, Route Handlers |
| **Styling & UI** | Tailwind CSS + shadcn/ui + Lucide | Dark-navy-first SaaS theme with accessible components |
| **Charts & Toasts** | Recharts + Sonner | Visual progress metrics and non-blocking notifications |
| **Database** | Azure SQL Database (T-SQL via `mssql`) | Parameterized relational data, resilient retry logic |
| **Serverless AI** | Azure Functions (v4 model, Node.js) | Pure, stateless AI generation and evaluation workers |
| **AI Engine** | Azure OpenAI / Azure AI Foundry | Calibrated GPT chat completions with JSON schema validation |
| **File Storage** | Azure Blob Storage (`@azure/storage-blob`) | Secure, private PDF resume storage |
| **Authentication** | `bcryptjs` + `jose` (JWT) | Simple, explainable cookie-based sessions |
| **Monitoring** | Application Insights (`@azure/monitor-opentelemetry`) | Real-time live metrics and dependency failure tracking |

---

## 4. Getting Started Locally

### Prerequisites
- Node.js LTS (v20 or v22)
- Git

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd "AI interview coach"
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

For Phase 0 / local UI work, the mock AI provider is enabled by default:
```env
NEXT_PUBLIC_APP_NAME="AI Interview Coach"
AUTH_SECRET="your-32-character-secret"
APP_BASE_URL="http://localhost:3000"
AI_PROVIDER="mock"
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.  
Test the health endpoint at [http://localhost:3000/api/health](http://localhost:3000/api/health).

---

## 5. Implementation Roadmap
- [x] **Phase 0: Project Scaffold & Tooling** (Next.js, Tailwind v4, shadcn/ui, docs, health endpoint)
- [ ] **Phase 1: UI Shell & Screens with Mock Data**
- [ ] **Phase 2: Adaptive Interview Logic & Scoring Engine**
- [ ] **Phase 3: Azure OpenAI Direct Integration**
- [ ] **Phase 4: Azure SQL Database, Authentication & Persistence**
- [ ] **Phase 5: Resume Processing & Private Blob Storage Pipeline**
- [ ] **Phase 6: Serverless Azure Functions Architecture**
- [ ] **Phase 7: Azure App Service & Production CI/CD Deployment**
- [ ] **Phase 8: Application Insights Telemetry & Distributed Tracing**
- [ ] **Phase 9: Security Hardening, Verification Matrix & Polish**
