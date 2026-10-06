/**
 * @file lib/validations.js
 * @description Zod request validation schemas for authentication and interview APIs.
 */

import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters"),
  email: z.string().trim().email("Invalid email address").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const createInterviewSchema = z.object({
  job_role: z.string().trim().min(2, "Job role is required").max(100),
  interview_type: z.enum(["Technical", "HR", "Mixed", "Resume-Based"]),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  total_questions: z.coerce.number().int().min(1).max(15).default(5),
  resume_id: z.string().uuid().optional().nullable(),
});

export const submitAnswerSchema = z.object({
  question_id: z.string().min(1, "Question ID is required"),
  answer_text: z.string().trim().min(1, "Answer cannot be empty").max(10000, "Answer exceeds 10,000 characters"),
});
