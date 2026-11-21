import { z } from "zod";

/**
 * Zod schemas for course and enrollment request validation.
 */

// ── Course Schemas ───────────────────────────────────────────────────────────

export const createCourseSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title too long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description too long"),
  pricePerMinute: z
    .number()
    .positive("Price per minute must be positive")
    .max(10, "Price per minute seems too high"),
  currency: z.string().default("USD"),
  thumbnailUrl: z.string().url("Invalid thumbnail URL").optional(),
});

export const createLessonSchema = z.object({
  title: z
    .string()
    .min(3, "Lesson title must be at least 3 characters")
    .max(200, "Lesson title too long"),
  description: z.string().max(1000).optional(),
  contentUrl: z.string().url("Invalid content URL"),
  durationSec: z
    .number()
    .int()
    .positive("Duration must be a positive integer (seconds)"),
  order: z.number().int().positive("Order must be a positive integer"),
});

// ── Enrollment Schema ────────────────────────────────────────────────────────

export const enrollSchema = z.object({
  courseId: z.string().uuid("Invalid course ID"),
});

// ── Progress & Feedback Schemas ─────────────────────────────────────────────

export const updateProgressSchema = z.object({
  lessonId: z.string().uuid("Invalid lesson ID").optional(),
  lastPosition: z.string().optional(),
  lastSeconds: z.number().int().min(0).optional(),
  minutesLearned: z.number().int().min(0).optional(),
  completed: z.boolean().optional(),
});

export const feedbackSchema = z.object({
  rating: z.number().int().min(1, "Rating must be 1 to 5").max(5, "Rating must be 1 to 5"),
  category: z.string().default("monetization"),
  comment: z.string().min(1, "Comment cannot be empty").max(1000),
});

// ── Inferred Types ───────────────────────────────────────────────────────────

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type EnrollInput = z.infer<typeof enrollSchema>;
export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;

