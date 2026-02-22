import { z } from 'zod';

// --- Enums ---
export const MissionTypeSchema = z.enum(['QUIZ', 'OX', 'PHOTO', 'TEXT_INPUT']);
export const MissionStatusSchema = z.enum(['LOCKED', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'FAILED']);

// --- Mission Step ---
export const QuizOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  imageUrl: z.string().nullable().optional(), // Removed .url() to allow empty strings
});

export const OptionsJsonSchema = z.object({
  choices: z.array(QuizOptionSchema).optional(),
  questionImageUrl: z.string().nullable().optional(),
  instruction: z.string().optional(), // Used for PHOTO/TEXT_INPUT potentially
  hintText: z.string().optional(),
});

export const MissionStepSchema = z.object({
  stepId: z.number().or(z.string()), // Accept string for mock compatibility
  missionId: z.number(),
  missionType: MissionTypeSchema,
  prompt: z.string(),
  optionsJson: OptionsJsonSchema.optional(),
  title: z.string(),
  status: MissionStatusSchema.optional().default('OPEN'),
});

// --- Submission ---
export const MissionSubmitRequestSchema = z.object({
  missionType: MissionTypeSchema,
  userInput: z.string().optional(), // For TEXT_INPUT
  photoUrl: z.string().url().optional(), // For PHOTO
  selectedOptionId: z.string().optional(), // For QUIZ/OX
});

export const MissionSubmitResponseSchema = z.object({
  attemptId: z.number(),
  isCorrect: z.boolean(),
  score: z.number(),
  feedback: z.string(),
  nextStepApi: z.string().nullable().optional(),
});


// --- Types ---
export type MissionStep = z.infer<typeof MissionStepSchema>;
export type MissionSubmitRequest = z.infer<typeof MissionSubmitRequestSchema>;
export type MissionSubmitResponse = z.infer<typeof MissionSubmitResponseSchema>;
