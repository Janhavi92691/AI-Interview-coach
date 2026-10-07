import { z } from "zod";

export const questionItemSchema = z.object({
  question: z.string().min(10).max(1000),
  topic: z.string().min(2).max(100),
  category: z.enum(["Technical", "HR", "Resume"]),
});

export const generateQuestionsResponseSchema = z.object({
  questions: z.array(questionItemSchema).min(1),
});

export const feedbackSchema = z.object({
  did_well: z.string().min(5),
  missing: z.string().min(5),
  improve: z.string().min(5),
});

export const evaluateAnswerResponseSchema = z.object({
  correctness: z.number().int().min(0).max(10),
  technical_depth: z.number().int().min(0).max(10),
  clarity: z.number().int().min(0).max(10),
  relevance: z.number().int().min(0).max(10),
  feedback: feedbackSchema,
  follow_up: z.string().nullable().optional(),
});

export const projectAnalysisSchema = z.object({
  name: z.string().min(1),
  summary: z.string().min(1),
});

export const experienceAnalysisSchema = z.object({
  title: z.string().min(1),
  organization: z.string().min(1),
  summary: z.string().min(1),
});

export const analyzeResumeResponseSchema = z.object({
  skills: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  projects: z.array(projectAnalysisSchema).default([]),
  education: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
  experience: z.array(experienceAnalysisSchema).default([]),
});

export const generateReportResponseSchema = z.object({
  summary: z.string().min(20),
  strengths: z.array(z.string()).min(1),
  weaknesses: z.array(z.string()).min(1),
  recommended_topics: z.array(z.string()).min(1),
});
