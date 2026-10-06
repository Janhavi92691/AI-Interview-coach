// Mock data for Phase 1 UI prototyping and testing

export const mockUser = {
  id: "usr_mock_001",
  name: "Janhavi Adagale",
  email: "janhavi@example.com",
  memberSince: "October 2026",
};

export const mockDashboardStats = {
  totalInterviews: 12,
  avgScore: 78,
  bestScore: 92,
  techAvg: 81,
  hrAvg: 74,
  performanceHistory: [
    { id: "int_01", date: "Sep 28", role: "Frontend Dev", score: 65 },
    { id: "int_02", date: "Sep 30", role: "Software Eng", score: 70 },
    { id: "int_03", date: "Oct 01", role: "Full Stack", score: 72 },
    { id: "int_04", date: "Oct 02", role: "Cloud Eng", score: 68 },
    { id: "int_05", date: "Oct 03", role: "Java Developer", score: 79 },
    { id: "int_06", date: "Oct 03", role: "Full Stack", score: 82 },
    { id: "int_07", date: "Oct 04", role: "AI/ML Engineer", score: 76 },
    { id: "int_08", date: "Oct 04", role: "Backend Dev", score: 84 },
    { id: "int_09", date: "Oct 05", role: "Cloud Eng", score: 88 },
    { id: "int_10", date: "Oct 06", role: "Full Stack", score: 92 },
  ],
  categoryPerformance: [
    { category: "Technical", score: 81, fullMark: 100 },
    { category: "HR / Behavioral", score: 74, fullMark: 100 },
    { category: "Resume Experience", score: 79, fullMark: 100 },
  ],
  strongestTopics: [
    { topic: "System Design", score: 9.1, count: 4 },
    { topic: "SQL & Query Optimization", score: 8.8, count: 6 },
    { topic: "React Architecture", score: 8.4, count: 5 },
  ],
  weakestTopics: [
    { topic: "Distributed Consensus", score: 5.2, count: 2 },
    { topic: "Behavioral Conflict Resolution", score: 5.8, count: 3 },
    { topic: "Asymptotic Complexity (Big-O)", score: 6.1, count: 4 },
  ],
  recentInterviews: [
    {
      id: "int_mock_10",
      jobRole: "Full Stack Developer",
      interviewType: "Technical",
      difficulty: "Intermediate",
      overallScore: 92,
      totalQuestions: 5,
      status: "completed",
      createdAt: "2026-10-06T11:30:00Z",
    },
    {
      id: "int_mock_09",
      jobRole: "Cloud Engineer",
      interviewType: "Resume-Based",
      difficulty: "Advanced",
      overallScore: 88,
      totalQuestions: 10,
      status: "completed",
      createdAt: "2026-10-05T15:20:00Z",
    },
    {
      id: "int_mock_08",
      jobRole: "Backend Developer",
      interviewType: "Technical",
      difficulty: "Intermediate",
      overallScore: 84,
      totalQuestions: 5,
      status: "completed",
      createdAt: "2026-10-04T18:45:00Z",
    },
    {
      id: "int_mock_07",
      jobRole: "AI/ML Engineer",
      interviewType: "Mixed",
      difficulty: "Intermediate",
      overallScore: 76,
      totalQuestions: 5,
      status: "completed",
      createdAt: "2026-10-04T09:15:00Z",
    },
    {
      id: "int_mock_06",
      jobRole: "Software Developer",
      interviewType: "HR",
      difficulty: "Beginner",
      overallScore: null,
      totalQuestions: 5,
      status: "in_progress",
      createdAt: "2026-10-03T14:00:00Z",
    },
  ],
};

export const mockResumes = [
  {
    id: "res_mock_001",
    fileName: "Janhavi_Adagale_Resume_2026.pdf",
    fileSizeBytes: 245760,
    createdAt: "2026-10-02T10:00:00Z",
    analysis: {
      skills: ["Cloud Architecture", "Database Design", "API Development", "Full Stack Development"],
      technologies: ["Next.js", "React", "Node.js", "Azure Functions", "Azure SQL", "Tailwind CSS", "Docker", "Git"],
      projects: [
        {
          name: "AI Interview Coach",
          summary: "Built a cloud-native interview prep platform using Next.js App Router, Azure SQL, and Azure OpenAI serverless workers.",
        },
        {
          name: "Microservices Telemetry Pipeline",
          summary: "Implemented distributed tracing with Application Insights and OpenTelemetry across decoupled Node.js services.",
        },
      ],
      education: ["B.Tech in Computer Engineering (Expected 2027)"],
      certifications: ["Microsoft Certified: Azure Fundamentals (AZ-900)"],
      experience: [
        {
          title: "Cloud Computing Research Intern",
          organization: "Campus Tech Labs",
          summary: "Benchmarked serverless function latency and relational database connection pooling patterns under cold-start conditions.",
        },
      ],
    },
  },
];

export const mockActiveInterview = {
  id: "int_mock_live",
  jobRole: "Full Stack Developer",
  interviewType: "Technical",
  difficulty: "Intermediate",
  totalQuestions: 5,
  status: "in_progress",
  questions: [
    {
      id: "q_1",
      questionText: "Explain how React's Virtual DOM reconciliation algorithm works and why keys are important when rendering lists.",
      topic: "React Internals & DOM",
      category: "Technical",
      questionOrder: 1,
      answer: {
        id: "a_1",
        answerText: "The Virtual DOM is an in-memory representation of the real DOM. When state changes, React creates a new VDOM tree and diffs it with the previous one. Keys allow React to uniquely identify elements across renders, preventing unnecessary DOM re-creation and preserving component state.",
        score: 9,
        correctness: 9,
        technicalDepth: 9,
        clarity: 8,
        relevance: 10,
        feedback: {
          did_well: "Accurately described the reconciliation diffing algorithm and the exact role of keys in stable identity matching.",
          missing: "Could mention the O(n) heuristic diffing algorithm vs traditional O(n^3) tree diffing.",
          improve: "Provide a concrete bug scenario that happens when using array index as a key during list item reordering.",
        },
      },
    },
    {
      id: "q_2",
      questionText: "What strategies would you employ to handle connection pool exhaustion in a serverless Node.js backend connecting to a relational database like Azure SQL?",
      topic: "Cloud Architecture & DB Pooling",
      category: "Technical",
      questionOrder: 2,
      answer: null,
    },
    {
      id: "q_3",
      questionText: "How do you secure HTTP cookies for session authentication, and what are the specific protections against XSS and CSRF?",
      topic: "Web Security & Auth",
      category: "Technical",
      questionOrder: 3,
      answer: null,
    },
    {
      id: "q_4",
      questionText: "Describe the trade-offs between Client-Side Rendering (CSR), Server-Side Rendering (SSR), and Static Site Generation (SSG) in Next.js.",
      topic: "Next.js Rendering Paradigms",
      category: "Technical",
      questionOrder: 4,
      answer: null,
    },
    {
      id: "q_5",
      questionText: "Tell me about a time you had to debug a difficult performance bottleneck or memory leak under a tight deadline.",
      topic: "Problem Solving & Behavioral",
      category: "HR",
      questionOrder: 5,
      answer: null,
    },
  ],
};

export const mockInterviewResult = {
  id: "int_mock_10",
  jobRole: "Full Stack Developer",
  interviewType: "Technical",
  difficulty: "Intermediate",
  overallScore: 84,
  metrics: {
    technicalKnowledge: 85,
    answerQuality: 82,
    clarity: 86,
  },
  report: {
    summary:
      "Demonstrated strong fundamentals in modern web frameworks, cloud database architectures, and distributed systems. Responses showed clear structural articulation and practical problem-solving ability, with minor gaps in discussing edge cases and complexity heuristics.",
    strengths: [
      "Precise explanation of React Virtual DOM diffing heuristics and reconciliation semantics.",
      "Thorough understanding of serverless connection pooling and transient retry logic on Azure SQL.",
      "Clear articulation of cookie security flags (httpOnly, sameSite, secure) against XSS and CSRF.",
    ],
    weaknesses: [
      "Omitted time complexity trade-offs when explaining tree diffing algorithms.",
      "Could incorporate more concrete production metrics (p99 latency, RPS) in architectural answers.",
    ],
    recommended_topics: [
      "Heuristic Diffing Algorithms & Fiber Architecture in React",
      "Azure SQL Serverless Auto-pause & Retry Best Practices",
      "OAuth 2.0 / OpenID Connect vs Stateless Signed JWT Sessions",
      "Database Indexing: B-Tree vs Clustered Index Performance",
    ],
  },
  questions: [
    {
      id: "q_res_1",
      questionText: "Explain how React's Virtual DOM reconciliation algorithm works and why keys are important.",
      topic: "React Internals",
      category: "Technical",
      questionOrder: 1,
      answer: {
        answerText: "React diffs the previous and next Virtual DOM trees to compute minimal real DOM mutations. Keys give elements stable identities across renders.",
        score: 9,
        correctness: 9,
        technicalDepth: 9,
        clarity: 8,
        relevance: 10,
        feedback: {
          did_well: "Accurate diffing description and good emphasis on DOM mutation minimization.",
          missing: "Details on why array indexes cause issues when mutating order.",
          improve: "Mention Fiber work loop scheduling and priority lane concepts.",
        },
      },
    },
    {
      id: "q_res_2",
      questionText: "What strategies would you employ to handle connection pool exhaustion in Azure SQL?",
      topic: "Database Architecture",
      category: "Technical",
      questionOrder: 2,
      answer: {
        answerText: "Reuse a shared global pool across hot reloads in serverless environments, configure bounded max connection sizes, and wrap executions in retry policies with exponential backoff.",
        score: 8,
        correctness: 9,
        technicalDepth: 8,
        clarity: 8,
        relevance: 8,
        feedback: {
          did_well: "Identified the globalThis connection cache pattern and transient backoff.",
          missing: "Connection proxies such as Azure SQL Database Hyperscale or external connection multiplexers.",
          improve: "Quote specific transient error codes like 40613 for viva rigor.",
        },
      },
    },
  ],
};
