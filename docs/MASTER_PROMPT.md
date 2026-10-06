# AI Interview Coach - Master Specification & Prompt

## 0. Role and Operating Principles
- Senior full-stack engineer and cloud architect building AI Interview Coach for a college Cloud Computing submission with live demo and viva.
- Every piece must be simple enough to explain in a viva.
- Every Azure service has a real, active purpose in the running app (no decorative services, no fake integrations).
- Work one phase at a time.
- At the end of every phase:
  1. What changed (files created/edited, plain language)
  2. How to run and test it (exact commands, expected result)
  3. Human checklist (Azure resources, keys, manual actions)
  4. Viva notes (5 short bullets explaining what this phase does and why)

## 1. Product Summary
A cloud-based web app where a student practices technical and HR interviews with an AI interviewer.
- Tagline: "Practice Smarter. Interview Better."
- Subheading: "Your AI-powered personal interviewer for technical and HR interview preparation."

## 2. Locked Tech Stack
- Framework: Next.js (latest stable, App Router), React, JavaScript/JSX only (no TypeScript; JSDoc comments).
- Styling/UI: Tailwind CSS, shadcn/ui, lucide-react icons, Recharts, sonner (toasts).
- Backend: Next.js Route Handlers (`app/api/**/route.js`) on Node.js runtime.
- AI: Azure OpenAI / Azure AI Foundry chat model via `openai` package (`AzureOpenAI` client).
- Serverless: Azure Functions (Node.js, v4 programming model, HTTP triggers).
- Database: Azure SQL Database via `mssql` package (parameterized queries only, no ORM).
- File Storage: Azure Blob Storage via `@azure/storage-blob` (private container).
- Auth: Custom, explainable: `bcryptjs` + `jose` (signed JWT in an httpOnly cookie).
- Validation: `zod` (request bodies and AI outputs).
- PDF text: `pdf-parse` (server-side only).
- Hosting: Azure App Service (Linux, Node LTS).
- Monitoring: Application Insights / Azure Monitor via `@azure/monitor-opentelemetry`.
- VCS / CI: Git + GitHub + GitHub Actions.

## 3. Architecture
- Browser (React UI) -> Next.js on Azure App Service
- Next.js owns: auth, validation, ownership checks, business logic, scoring, SQL database queries, Blob Storage access, PDF text extraction.
- Azure Functions own: building prompts, calling Azure OpenAI, validating/repairing JSON, returning structured results. Stateless, no DB access.
- Application Insights: requests, errors, latency, dependencies across web and functions.

## 4. AI Provider Switch
- `mock`: deterministic fake data for local UI development (Phases 1-2).
- `azure`: Next.js calls Azure OpenAI directly (Phases 3-5; temporary).
- `functions`: Next.js calls Azure Functions over HTTP (Phase 6+; production default).
