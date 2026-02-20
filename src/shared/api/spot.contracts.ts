import { z } from 'zod';
import { ApiErrorSchema } from './auth.contracts';

import { SpotTypeSchema } from './tour.contracts';
import { MissionTypeSchema } from './mission.contracts';

// --- Enums ---
// --- Spot Detail ---
export const SpotDetailSchema = z.object({
  spotId: z.number(),
  type: SpotTypeSchema,
  title: z.string(),
  titleKr: z.string().optional(),
  description: z.string(),
  pronunciationUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url(),
  lat: z.number(),
  lng: z.number(),
  address: z.string().optional(),
});

// --- Spot Guide Segment ---
export const GuideStepAssetSchema = z.object({
  id: z.number(),
  type: z.enum(['IMAGE', 'AUDIO', 'VIDEO']),
  url: z.string().url(),
  meta: z.any().nullable().optional(),
});

export const GuideSegmentSchema = z.object({
  id: z.number(),
  segIdx: z.number(),
  text: z.string(),
  triggerKey: z.string().nullable().optional(),
  assets: z.array(GuideStepAssetSchema).optional(),
  delayMs: z.number().optional(),
});

export const SpotGuideResponseSchema = z.object({
  stepId: z.number(),
  stepTitle: z.string(),
  nextAction: z.enum(['NEXT', 'MISSION_CHOICE']).nullable().optional(),
  segments: z.array(GuideSegmentSchema),
});

// --- Types ---
export type SpotDetail = z.infer<typeof SpotDetailSchema>;
export type GuideSegment = z.infer<typeof GuideSegmentSchema>;
export type SpotGuideResponse = z.infer<typeof SpotGuideResponseSchema>;
