import { z } from 'zod';
import { MissionTypeSchema } from './spot.contracts';

// --- Enums ---
export const MissionStatusSchema = z.enum(['LOCKED', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'FAILED']);

// --- Mission Step ---
// A mission can have multiple steps or just one.
export const QuizOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  isCorrect: z.boolean().optional(), // Frontend shouldn't ideally see this, but for Mock/MVP
});

export const MissionStepSchema = z.object({
  stepId: z.string(),
  title: z.string(),
  description: z.string(),
  type: MissionTypeSchema,
  status: MissionStatusSchema,
  // Type specific fields
  quiz: z.object({
    question: z.string(),
    options: z.array(QuizOptionSchema),
  }).optional(),
  photo: z.object({
    targetDescription: z.string(),
    exampleImageUrl: z.string().url().optional(),
  }).optional(),
  rewardId: z.string().optional(),
});

// --- Submission ---
export const MissionSubmitRequestSchema = z.object({
  type: MissionTypeSchema,
  answer: z.string().optional(), // For QUIZ/TEXT
  photoUrl: z.string().optional(), // For PHOTO
});

export const MissionSubmitResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  reward: z.object({
    xp: z.number(),
    badgeUrl: z.string().optional(),
  }).optional(),
  nextStepId: z.string().nullable().optional(),
});


// --- Types ---
export type MissionStep = z.infer<typeof MissionStepSchema>;
export type MissionSubmitRequest = z.infer<typeof MissionSubmitRequestSchema>;
export type MissionSubmitResponse = z.infer<typeof MissionSubmitResponseSchema>;
