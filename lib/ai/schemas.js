import { z } from "zod";

/**
 * Resilient rubric score parser: converts floats, numbers, or numeric strings
 * into an integer between 0 and 10, with fallback to 7.
 */
const rubricScoreSchema = z
  .union([z.number(), z.string()])
  .transform((val) => {
    const num = Number(val);
    if (isNaN(num)) return 7;
    return Math.min(10, Math.max(0, Math.round(num)));
  });

/**
 * Normalizes question categories to standard values.
 */
const normalizeCategory = z.any().transform((val) => {
  const str = String(val || "").toLowerCase();
  if (str.includes("hr") || str.includes("behav") || str.includes("situat")) return "HR";
  if (str.includes("resum") || str.includes("proj") || str.includes("exp")) return "Resume";
  return "Technical";
});

/**
 * Zod schema for generated interview questions.
 */
export const questionItemSchema = z.object({
  question: z.any().transform((v) => (typeof v === "string" && v.trim() ? v.trim() : "Explain this concept in detail.")),
  topic: z.any().transform((v) => (typeof v === "string" && v.trim() ? v.trim() : "General")),
  category: normalizeCategory,
});

export const generateQuestionsResponseSchema = z.object({
  questions: z.array(questionItemSchema).min(1),
});

/**
 * Resilient feedback schema: handles objects with strings of any length,
 * missing keys, nulls, or a single feedback string.
 */
export const feedbackSchema = z
  .union([
    z.object({
      did_well: z.any().optional().nullable(),
      missing: z.any().optional().nullable(),
      improve: z.any().optional().nullable(),
    }),
    z.string(),
    z.any(),
  ])
  .transform((val) => {
    if (typeof val === "string") {
      return {
        did_well: val.trim() || "Answer addressed the core requirements well.",
        missing: "No major omissions identified.",
        improve: "Continue providing concrete implementation details and edge cases.",
      };
    }
    const cleanStr = (s, fallback) => {
      if (typeof s === "string" && s.trim().length > 0) return s.trim();
      return fallback;
    };
    return {
      did_well: cleanStr(val?.did_well, "Answer addressed the core requirements well."),
      missing: cleanStr(val?.missing, "No major omissions identified."),
      improve: cleanStr(val?.improve, "Continue practicing real-world scenarios and edge cases."),
    };
  });

/**
 * Zod schema for answer rubric evaluation.
 */
export const evaluateAnswerResponseSchema = z.object({
  correctness: rubricScoreSchema.default(7),
  technical_depth: rubricScoreSchema.default(7),
  clarity: rubricScoreSchema.default(7),
  relevance: rubricScoreSchema.default(7),
  feedback: feedbackSchema.default({
    did_well: "Answer addressed the core requirements.",
    missing: "No major omissions identified.",
    improve: "Provide more real-world examples and trade-offs.",
  }),
  follow_up: z
    .any()
    .optional()
    .nullable()
    .transform((val) => (typeof val === "string" && val.trim() ? val.trim() : null)),
});

/**
 * Resilient string list parser.
 */
const stringListSchema = z.any().transform((val) => {
  if (Array.isArray(val)) {
    return val.map((s) => String(s || "").trim()).filter(Boolean);
  }
  if (typeof val === "string" && val.trim()) {
    return val.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
  }
  return [];
});

/**
 * Zod schema for structured resume analysis.
 */
export const projectAnalysisSchema = z.object({
  name: z.any().transform((v) => String(v || "Project").trim() || "Project"),
  summary: z.any().transform((v) => String(v || "").trim() || "Project contribution"),
});

export const experienceAnalysisSchema = z.object({
  title: z.any().transform((v) => String(v || "Role").trim() || "Role"),
  organization: z.any().transform((v) => String(v || "Organization").trim() || "Organization"),
  summary: z.any().transform((v) => String(v || "").trim() || "Professional experience"),
});

export const analyzeResumeResponseSchema = z.object({
  skills: stringListSchema,
  technologies: stringListSchema,
  projects: z.array(projectAnalysisSchema).default([]),
  education: stringListSchema,
  certifications: stringListSchema,
  experience: z.array(experienceAnalysisSchema).default([]),
});

/**
 * Zod schema for comprehensive interview report.
 */
const stringArraySchema = (fallback) =>
  z.any().transform((val) => {
    if (Array.isArray(val)) {
      const filtered = val.map((s) => String(s || "").trim()).filter(Boolean);
      return filtered.length > 0 ? filtered : [fallback];
    }
    if (typeof val === "string" && val.trim()) {
      return [val.trim()];
    }
    return [fallback];
  });

export const generateReportResponseSchema = z.object({
  summary: z.any().transform((v) => (typeof v === "string" && v.trim() ? v.trim() : "Performance evaluation completed successfully.")),
  strengths: stringArraySchema("Demonstrated solid conceptual foundation and structured problem solving."),
  weaknesses: stringArraySchema("Could expand on architectural edge cases and scalability considerations."),
  recommended_topics: stringArraySchema("System Design, Performance Optimization, Edge Case Handling"),
});
