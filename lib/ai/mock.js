import {
  generateQuestionsResponseSchema,
  evaluateAnswerResponseSchema,
  analyzeResumeResponseSchema,
  generateReportResponseSchema,
} from "./schemas.js";

/**
 * Question bank for mock question generation
 */
const QUESTION_BANK = {
  Technical: {
    Beginner: [
      { question: "What is the difference between let, const, and var in modern JavaScript?", topic: "JavaScript Fundamentals" },
      { question: "How does the HTTP request-response cycle work between browser and web server?", topic: "Web Networking" },
      { question: "What is the difference between synchronous and asynchronous code execution in Node.js?", topic: "Node.js Asynchrony" },
      { question: "What is the primary key constraint in relational databases, and why is it required?", topic: "SQL Basics" },
      { question: "What are React props and how do they differ from internal component state?", topic: "React Basics" },
      { question: "What is Git branching and how does merging work in standard collaborative workflows?", topic: "Git & Version Control" },
      { question: "Explain the difference between GET and POST HTTP methods.", topic: "RESTful APIs" },
      { question: "What is the role of CSS box model (margin, border, padding, content)?", topic: "CSS Fundamentals" },
      { question: "What does SQL JOIN do, and what is the difference between INNER and LEFT JOIN?", topic: "SQL Queries" },
      { question: "What is JSON and why has it largely replaced XML in web APIs?", topic: "Data Serialization" },
      { question: "What is the purpose of npm and package.json in Node.js projects?", topic: "Node.js Tooling" },
      { question: "How do browser cookies differ from localStorage in terms of security and size?", topic: "Browser Storage" },
      { question: "What is an array vs a hash map (object / dictionary) in terms of lookup complexity?", topic: "Data Structures" },
      { question: "What is semantic HTML and why does it matter for accessibility and SEO?", topic: "HTML & Accessibility" },
      { question: "What is cross-origin resource sharing (CORS) and why do browsers enforce it?", topic: "Web Security" },
    ],
    Intermediate: [
      { question: "Explain how React's Virtual DOM reconciliation works and why stable keys prevent UI re-mounting bugs.", topic: "React Reconciliation" },
      { question: "What strategies would you employ to handle connection pool exhaustion in a serverless Node.js backend connecting to Azure SQL?", topic: "DB Connection Pooling" },
      { question: "How do you protect an authentication system against Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF)?", topic: "Authentication Security" },
      { question: "Describe the trade-offs between Client-Side Rendering (CSR), Server-Side Rendering (SSR), and Static Generation (SSG).", topic: "Rendering Paradigms" },
      { question: "How do indexes (B-Tree vs Hash) improve query performance in relational databases, and what are the write trade-offs?", topic: "Database Indexing" },
      { question: "What is the event loop in Node.js, and how does it differentiate between the microtask queue and macrotask queue?", topic: "Node.js Event Loop" },
      { question: "Explain ACID properties in database transactions and how isolation levels prevent dirty reads.", topic: "Transaction Isolation" },
      { question: "What is optimistic vs pessimistic locking in concurrent web applications, and when should you choose each?", topic: "Concurrency Control" },
      { question: "How does pagination strategy (offset-based vs cursor-based/keyset) affect performance on tables with millions of rows?", topic: "API Pagination" },
      { question: "What is the difference between horizontal and vertical scaling for cloud-hosted web backends?", topic: "Cloud Architecture" },
      { question: "How would you design an in-memory rate limiter using sliding window log or token bucket algorithms?", topic: "API Rate Limiting" },
      { question: "Explain how Docker containerization differs from hardware virtualization (Hypervisors).", topic: "Containerization" },
      { question: "What are idempotent HTTP operations, and why is PUT/DELETE expected to be idempotent while POST is not?", topic: "REST Architecture" },
      { question: "How do signed JSON Web Tokens (JWT) verify tamper-proof payloads without storing active session state in a database?", topic: "JWT Cryptography" },
      { question: "What is tail recursion and how does the call stack behave under deep recursive iterations?", topic: "Computer Science Theory" },
    ],
    Advanced: [
      { question: "How would you architect a distributed caching layer with Redis to prevent cache stampedes, penetration, and avalanche under peak traffic?", topic: "Distributed Caching" },
      { question: "Analyze the CAP theorem trade-offs when designing a globally distributed multi-region database on Azure.", topic: "Distributed Consensus" },
      { question: "How would you diagnose and resolve a severe memory leak and event loop blocking scenario in a production Node.js service?", topic: "Node.js Profiling & V8" },
      { question: "Design an end-to-end resilient event-driven architecture using Azure Service Bus or Kafka with outbox pattern guarantees.", topic: "Event-Driven Architecture" },
      { question: "Explain how database write-ahead logging (WAL) and checkpointing ensure durability and crash recovery.", topic: "Storage Engine Internals" },
      { question: "How would you design a rate limiter distributed across multiple stateless container instances without creating a Redis bottleneck?", topic: "Distributed Rate Limiting" },
      { question: "Discuss zero-downtime database schema migration strategies when executing backward-incompatible column deprecations.", topic: "Continuous Deployment" },
      { question: "Compare row-level locking vs multi-version concurrency control (MVCC) in high-throughput transactional engines.", topic: "Storage Engines" },
      { question: "How does TLS 1.3 handshake negotiate cryptographic cipher suites and eliminate round-trip latency compared to TLS 1.2?", topic: "Network Cryptography" },
      { question: "Design a fault-tolerant idempotency key mechanism for high-frequency payment processing APIs.", topic: "Distributed Transactions" },
      { question: "How do you mitigate noisy-neighbor CPU throttling and cold starts in serverless consumption compute tiers?", topic: "Cloud Virtualization" },
      { question: "Discuss the architectural trade-offs between CQRS with event sourcing vs normalized relational storage.", topic: "System Design" },
      { question: "How does React 19 Server Components stream serialized flight payload chunks over HTTP before hydrating client boundaries?", topic: "React Server Components" },
      { question: "Explain how B-tree rebalancing operations (splits and merges) impact latencies during high-volume batch inserts.", topic: "Database Algorithms" },
      { question: "How would you architect a distributed tracing pipeline across hybrid cloud microservices adhering to W3C Trace Context?", topic: "Distributed Observability" },
    ],
  },
  HR: {
    Beginner: [
      { question: "Tell me about yourself, your educational background, and why you are interested in this job role.", topic: "Professional Introduction" },
      { question: "What are your greatest technical strengths and what is one area you are currently striving to improve?", topic: "Self-Awareness & Growth" },
      { question: "Describe a project you worked on where you had to quickly learn a technology you had never used before.", topic: "Adaptability & Learning" },
      { question: "How do you organize and prioritize your academic and project deadlines when multiple assignments compete for your time?", topic: "Time Management" },
      { question: "Why do you want to work as a developer in cloud computing and modern full-stack engineering?", topic: "Career Motivation" },
      { question: "Tell me about a time you received constructive feedback on your code or project work and how you responded.", topic: "Feedback Acceptance" },
      { question: "How do you communicate complex technical concepts to non-technical team members or project stakeholders?", topic: "Communication" },
      { question: "Where do you see your technical career developing over the next 2 to 3 years?", topic: "Long-term Vision" },
      { question: "Describe a situation where a teammate was not pulling their weight on a group deliverable. How did you handle it?", topic: "Teamwork & Collaboration" },
      { question: "What motivates you to continue coding and learning when debugging a particularly stubborn bug?", topic: "Resilience & Passion" },
    ],
    Intermediate: [
      { question: "Describe a time you experienced a major technical disagreement with a team member about architecture. How was it resolved?", topic: "Conflict Resolution" },
      { question: "Tell me about a production incident or severe bug you were responsible for. How did you remediate it and what safeguards did you put in place?", topic: "Ownership & Accountability" },
      { question: "How do you balance delivering features rapidly to meet a sprint deadline against maintaining high code quality and test coverage?", topic: "Technical Debt & Pragmatism" },
      { question: "Describe a situation where project requirements changed drastically midway through development. How did you adapt your architecture?", topic: "Agility & Change Management" },
      { question: "Tell me about a time you had to advocate for code refactoring or infrastructure investment to non-technical leadership.", topic: "Influence & Communication" },
      { question: "How do you mentor junior peers or collaborate effectively in an asynchronous code-review environment?", topic: "Mentorship & Code Reviews" },
      { question: "Describe a situation where you had to deliver under ambiguous requirements without a clear product specification.", topic: "Navigating Ambiguity" },
      { question: "Tell me about a goal you set for yourself that you failed to achieve. What were the key lessons learned?", topic: "Self-Reflection & Resilience" },
    ],
    Advanced: [
      { question: "How do you foster an engineering culture of psychological safety, blameless post-mortems, and high technical standards?", topic: "Engineering Leadership" },
      { question: "Describe a high-stakes scenario where you had to push back on executive leadership regarding unrealistic timelines or critical security flaws.", topic: "Principled Conviction" },
      { question: "How do you evaluate and communicate architectural risk when deciding between building in-house vs adopting third-party managed cloud solutions?", topic: "Strategic Decision Making" },
      { question: "Tell me about a time you led cross-functional alignment between engineering, security, and product teams on a critical breaking change.", topic: "Cross-Functional Leadership" },
      { question: "How do you prevent engineering burnout within high-velocity delivery teams while maintaining consistent operational excellence?", topic: "Team Health & Sustainability" },
    ],
  },
};

/**
 * Mock implementation of generateQuestions
 */
export async function mockGenerateQuestions({
  role = "Software Developer",
  type = "Technical",
  difficulty = "Intermediate",
  count = 5,
  resumeAnalysis = null,
}) {
  const diff = ["Beginner", "Intermediate", "Advanced"].includes(difficulty) ? difficulty : "Intermediate";
  const numQuestions = [5, 10, 15].includes(Number(count)) ? Number(count) : 5;

  let questions = [];

  if (type === "Technical") {
    const pool = QUESTION_BANK.Technical[diff] || QUESTION_BANK.Technical.Intermediate;
    questions = pool.slice(0, numQuestions).map((q) => ({
      question: q.question,
      topic: q.topic,
      category: "Technical",
    }));
  } else if (type === "HR") {
    const pool = QUESTION_BANK.HR[diff] || QUESTION_BANK.HR.Intermediate;
    questions = pool.slice(0, numQuestions).map((q) => ({
      question: q.question,
      topic: q.topic,
      category: "HR",
    }));
  } else if (type === "Mixed") {
    // 60% Technical, 40% HR
    const techCount = Math.round(numQuestions * 0.6);
    const hrCount = numQuestions - techCount;

    const techPool = QUESTION_BANK.Technical[diff] || QUESTION_BANK.Technical.Intermediate;
    const hrPool = QUESTION_BANK.HR[diff] || QUESTION_BANK.HR.Intermediate;

    const techItems = techPool.slice(0, techCount).map((q) => ({
      question: q.question,
      topic: q.topic,
      category: "Technical",
    }));

    const hrItems = hrPool.slice(0, hrCount).map((q) => ({
      question: q.question,
      topic: q.topic,
      category: "HR",
    }));

    questions = [...techItems, ...hrItems];
  } else if (type === "Resume-Based") {
    // At least 70% Resume category questions referencing specific projects/skills, rest Technical
    const resumeCount = Math.max(1, Math.round(numQuestions * 0.7));
    const techCount = numQuestions - resumeCount;

    const projects = resumeAnalysis?.projects || [];
    const technologies = resumeAnalysis?.technologies || ["Full Stack", "Cloud Services"];
    const skills = resumeAnalysis?.skills || ["System Design"];

    const resumeQuestions = [];

    // Project 1 question
    if (projects.length > 0) {
      resumeQuestions.push({
        question: `In your resume, you highlighted '${projects[0].name}'. Could you explain the technical architecture, key challenges you solved, and how you ensured scalability?`,
        topic: `Project Deep-Dive: ${projects[0].name.slice(0, 30)}`,
        category: "Resume",
      });
    } else {
      resumeQuestions.push({
        question: "Based on the technical projects listed on your resume, which system are you most proud of architecting and why?",
        topic: "Resume Projects Overview",
        category: "Resume",
      });
    }

    // Technology questions
    for (let i = 1; i < resumeCount; i++) {
      const tech = technologies[i % technologies.length] || "modern cloud frameworks";
      const skill = skills[i % skills.length] || "system design";
      resumeQuestions.push({
        question: `Your resume lists proficiency in '${tech}'. In what context have you applied it, and how does it integrate with your experience in '${skill}'?`,
        topic: `Applied Experience: ${tech}`,
        category: "Resume",
      });
    }

    const techPool = QUESTION_BANK.Technical[diff] || QUESTION_BANK.Technical.Intermediate;
    const techItems = techPool.slice(0, techCount).map((q) => ({
      question: q.question,
      topic: q.topic,
      category: "Technical",
    }));

    questions = [...resumeQuestions, ...techItems];
  }

  // Ensure exactly count questions
  while (questions.length < numQuestions) {
    questions.push({
      question: `How do you approach testing, performance monitoring, and fault recovery when deploying code in a ${role} environment?`,
      topic: "System Reliability",
      category: "Technical",
    });
  }

  const result = { questions: questions.slice(0, numQuestions) };
  return generateQuestionsResponseSchema.parse(result);
}

/**
 * Mock implementation of evaluateAnswer
 */
export async function mockEvaluateAnswer({
  role = "Software Developer",
  difficulty = "Intermediate",
  question = "",
  topic = "",
  category = "Technical",
  answer = "",
}) {
  const cleanAnswer = (answer || "").trim();
  const len = cleanAnswer.length;

  let correctness = 7;
  let technicalDepth = 7;
  let clarity = 8;
  let relevance = 8;
  let didWell = "Good structural articulation that addresses the core premise of the question.";
  let missing = "Could discuss edge cases and operational trade-offs in deeper technical detail.";
  let improve = "Incorporate concrete production metrics, specific algorithmic Big-O nuances, or design failure modes.";

  if (len < 30) {
    // Very brief or near blank answer
    correctness = 2;
    technicalDepth = 2;
    clarity = 4;
    relevance = 3;
    didWell = "Acknowledged the question topic.";
    missing = "The answer was extremely brief and lacked essential explanation, rationale, or supporting details.";
    improve = "Elaborate with at least 2–3 structured paragraphs explaining the 'how' and 'why' behind the solution.";
  } else if (cleanAnswer.toLowerCase().includes("ignore") && cleanAnswer.toLowerCase().includes("10/10")) {
    // Prompt injection sample
    correctness = 1;
    technicalDepth = 1;
    clarity = 5;
    relevance = 1;
    didWell = "Used valid syntax.";
    missing = "No technical or behavioural substance was provided to answer the specific interview question.";
    improve = "Focus strictly on answering the engineering challenge with technical rigor rather than meta prompts.";
  } else if (len > 300) {
    // Rich, detailed answer
    correctness = 9;
    technicalDepth = 9;
    clarity = 9;
    relevance = 9;
    didWell = "Excellent depth covering key mechanics, architectural trade-offs, and practical operational concerns.";
    missing = "Minor details regarding non-standard configurations or rare edge cases.";
    improve = "Continue pairing technical assertions with concrete benchmark numbers or personal project experiences.";
  }

  const output = {
    correctness,
    technical_depth: technicalDepth,
    clarity,
    relevance,
    feedback: {
      did_well: didWell,
      missing,
      improve,
    },
    follow_up:
      difficulty === "Advanced"
        ? `How would your proposed approach hold up if the system experienced a 10x traffic spike with 99.99% availability SLAs?`
        : null,
  };

  return evaluateAnswerResponseSchema.parse(output);
}

/**
 * Mock implementation of analyzeResume
 */
export async function mockAnalyzeResume({ resumeText = "" }) {
  const text = (resumeText || "").toLowerCase();

  const skills = ["Cloud Architecture", "Database Performance", "API Design", "Full Stack Development"];
  const technologies = ["Next.js", "React", "Node.js", "Azure SQL", "Azure Functions", "Tailwind CSS"];

  if (text.includes("docker")) technologies.push("Docker");
  if (text.includes("python")) technologies.push("Python");
  if (text.includes("java")) technologies.push("Java");

  const output = {
    skills,
    technologies,
    projects: [
      {
        name: "Cloud-Native Interview System",
        summary: "Architected distributed web application with decoupled serverless workers and private object storage.",
      },
      {
        name: "Real-Time Telemetry Pipeline",
        summary: "Built an end-to-end monitoring solution with Application Insights and distributed tracing.",
      },
    ],
    education: ["B.Tech in Computer Science & Engineering (Expected 2027)"],
    certifications: ["Microsoft Certified: Azure Fundamentals (AZ-900)"],
    experience: [
      {
        title: "Software Engineering Intern",
        organization: "Campus Tech Labs",
        summary: "Developed microservices and benchmarked query performance under concurrent database pooling conditions.",
      },
    ],
  };

  return analyzeResumeResponseSchema.parse(output);
}

/**
 * Mock implementation of generateReport
 */
export async function mockGenerateReport({
  role = "Full Stack Developer",
  type = "Technical",
  difficulty = "Intermediate",
  metrics = { overall: 80, technicalKnowledge: 80, answerQuality: 80, clarity: 80 },
  items = [],
}) {
  const overall = Number(metrics?.overall) || 75;

  let summary = `Candidate demonstrated consistent proficiency across ${role} core domains. Responses reflected clear structural problem-solving and strong conceptual foundations, with opportunities to deepen quantitative trade-offs in edge scenarios.`;

  if (overall >= 85) {
    summary = `Outstanding performance demonstrating mature engineering insight for a ${difficulty}-level ${role}. Answers were precise, well-reasoned, and addressed both architectural design principles and operational failure modes with exceptional clarity.`;
  } else if (overall < 60) {
    summary = `Candidate demonstrated emerging knowledge for the ${role} position, but responses exhibited noticeable gaps in technical depth and concrete implementation examples. Targeted study of core frameworks and data structures is strongly recommended.`;
  }

  const strengths = [
    `Strong command of core ${role} architectural patterns and design best practices.`,
    "Clear, structured communication when breaking down multi-part technical challenges.",
    "Proactive awareness of security standards and data integrity considerations.",
  ];

  const weaknesses = [
    "Could incorporate more quantitative metrics (p99 latency, RPS, memory footprints) in design answers.",
    "Occasional omission of failure recovery scenarios during high-concurrency operations.",
  ];

  const recommendedTopics = [
    "Distributed Systems: Consensus Protocols & Idempotency",
    "Database Tuning: B-Tree Index Optimization & Connection Pool Sizing",
    "Modern Web Security: Content Security Policy & Secure Cookie Architectures",
    "Cloud Architecture: Serverless Auto-pause, Cold-Starts & Retry Policies",
  ];

  const output = {
    summary,
    strengths,
    weaknesses,
    recommended_topics: recommendedTopics,
  };

  return generateReportResponseSchema.parse(output);
}
