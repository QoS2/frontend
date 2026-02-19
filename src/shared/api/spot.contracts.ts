import { z } from 'zod';
import { ApiErrorSchema } from './auth.contracts';

// --- Enums ---
export const SpotTypeSchema = z.enum(['HISTORICAL', 'CULTURAL', 'NATURE', 'MODERN']);
export const MissionTypeSchema = z.enum(['QUIZ', 'PHOTO', 'TEXT', 'QR']);

// --- Spot Detail ---
export const SpotDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  imageUrl: z.string().url(),
  type: SpotTypeSchema,
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  // Additional info for guide
  audioguideUrl: z.string().url().nullable().optional(),
  estimatedTimeMinutes: z.number().optional(),
});

// --- Spot Guide Segment ---
// When user arrives, they might get a specific guide segment (e.g. "Look at this statue...")
export const GuideSegmentSchema = z.object({
  segmentId: z.string(),
  spotId: z.number(),
  title: z.string(),
  content: z.string(), // Text description
  audioUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  order: z.number(),
});

export const SpotGuideResponseSchema = z.array(GuideSegmentSchema);


// --- Types ---
export type SpotDetail = z.infer<typeof SpotDetailSchema>;
export type GuideSegment = z.infer<typeof GuideSegmentSchema>;
