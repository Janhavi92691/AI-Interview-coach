# AI Interview Coach - Technical Specification

## 1. System Overview
AI Interview Coach provides intelligent, adaptive interview simulation for students and job seekers preparing for technical and behavioral interviews.

## 2. Component Split & Responsibilities
| Component | Technology | Responsibility |
|---|---|---|
| **Frontend** | React 19, Tailwind CSS, shadcn/ui | User interaction, responsive UX, dark theme, accessibility, client validation |
| **Backend API** | Next.js App Router Route Handlers | Authentication, authorization, ownership verification, business rules, DB/Blob I/O |
| **Serverless Workers** | Azure Functions (Node v4 model) | Stateless AI processing: prompt composition, Azure OpenAI invocation, schema validation |
| **Relational Database** | Azure SQL (Serverless) | Structured persistence for users, interviews, questions, answers, and resume metadata |
| **Object Storage** | Azure Blob Storage | Private PDF resume storage partitioned by user |
| **Observability** | Application Insights / Azure Monitor | Distributed request tracing, exception tracking, latency metrics |

## 3. Scoring Architecture (lib/scoring.js)
1. **Answer Score (0–10)**:
   $$\text{Score} = \text{round}(0.40 \times \text{correctness} + 0.30 \times \text{depth} + 0.15 \times \text{clarity} + 0.15 \times \text{relevance})$$
2. **Category Chip Labels**:
   - `0–3`: "Needs Work" (Red)
   - `4–5`: "Fair" (Amber)
   - `6–7`: "Good" (Blue/Purple)
   - `8–9`: "Very Good" (Emerald)
   - `10`: "Excellent" (Green)
3. **Overall Interview Score (0–100)**:
   $$\text{Overall} = \text{round}(\text{average}(\text{Answer Scores}) \times 10)$$
4. **Result Metrics**:
   - Technical Knowledge: $\text{avg}(\text{technical\_depth}) \times 10$
   - Answer Quality: $\text{avg}(\text{correctness}, \text{relevance}) \times 10$
   - Clarity: $\text{avg}(\text{clarity}) \times 10$

## 4. Security Principles
- **Defense in Depth**: Session cookies are `httpOnly`, `sameSite=lax`, and `secure` in production.
- **SQL Ownership**: Every database operation verifies `user_id = @userId` at the query level.
- **Private Blob Storage**: Resumes are stored in a private container (`resumes`) under `<userId>/<resumeId>.pdf`. Direct URLs are never exposed.
- **Zero Frontend Secrets**: Only `NEXT_PUBLIC_APP_NAME` is exposed to the browser.
