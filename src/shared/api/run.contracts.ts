import { z } from 'zod';
import { SpotSchema, TourListItemSchema } from './tour.contracts';

// --- Enums ---
export const ProximityEventSchema = z.enum(['PROXIMITY', 'TREASURE_FOUND', 'PHOTO_SPOT_FOUND']);
export const ContentTypeSchema = z.enum(['GUIDE', 'TREASURE_ALARM', 'PHOTO_ALARM']);
export const ChatRoleSchema = z.enum(['USER', 'GUIDE', 'SYSTEM']);
export const ChatSourceSchema = z.enum(['USER', 'SCRIPT', 'LLM']);
export const ActionTypeSchema = z.enum(['AUTO_NEXT', 'NEXT', 'MISSION_CHOICE']);

// --- Run State ---
export const RunStateSchema = z.object({
  runId: z.number(),
  tourId: z.number(),
  status: z.enum(['IN_PROGRESS', 'COMPLETED', 'ABANDONED']),
  mode: z.enum(['START', 'CONTINUE']).optional(),
  currentSpotId: z.number().nullable().optional(),
  progress: z.object({
    completedCount: z.number(),
    totalCount: z.number(),
    completedSpotIds: z.array(z.number()),
  }),
  startSpot: z.object({
    spotId: z.number(),
    title: z.string(),
    lat: z.number(),
    lng: z.number(),
    radiusM: z.number(),
  }).optional(),
});

// --- Chat & Guide ---
export const AssetSchema = z.object({
  id: z.number(),
  type: z.enum(['IMAGE', 'AUDIO', 'VIDEO']),
  url: z.string().url(),
  meta: z.any().nullable().optional(),
});

export const ActionSchema = z.object({
  type: ActionTypeSchema,
  nextApi: z.string().nullable().optional(),
  stepId: z.number().optional(), // Only for MISSION_CHOICE
});

export const ChatTurnSchema = z.object({
  turnId: z.number(),
  role: ChatRoleSchema,
  source: ChatSourceSchema,
  text: z.string(),
  assets: z.array(AssetSchema).optional(),
  delayMs: z.number().nullable().optional(),
  action: ActionSchema.nullable().optional(),
  createdAt: z.string().datetime().optional(),
});

// --- Proximity & GPS ---
export const ProximityRequestSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export const ProximityContextSchema = z.object({
  refType: z.enum(['SPOT']),
  refId: z.number(),
  placeName: z.string(),
  spotType: z.enum(['MAIN', 'SUB', 'PHOTO', 'TREASURE']),
});

export const ProximityResponseSchema = z.object({
  event: ProximityEventSchema,
  contentType: ContentTypeSchema,
  sessionId: z.number().nullable(),
  context: ProximityContextSchema,
  message: ChatTurnSchema.nullable().optional(),
});

// --- Chat Session & History ---
export const ChatSessionResponseSchema = z.object({
  sessionId: z.number(),
  status: z.enum(['ACTIVE', 'COMPLETED']),
  lastTurnId: z.number().optional(),
});

export const ChatHistoryResponseSchema = z.object({
  sessionId: z.number(),
  status: z.enum(['ACTIVE', 'COMPLETED']),
  nextScriptApi: z.string().nullable().optional(),
  hasNextScript: z.boolean(),
  turns: z.array(ChatTurnSchema),
});

export const ChatMessageRequestSchema = z.object({
  text: z.string(),
});

export const ChatMessageResponseSchema = z.object({
  userTurnId: z.number(),
  userText: z.string(),
  aiTurnId: z.number(),
  aiText: z.string(),
  nextScriptApi: z.string().nullable().optional(),
  hasNextScript: z.boolean(),
});

// --- Next Spot ---
export const NextSpotResponseSchema = z.object({
  runId: z.number(),
  status: z.string(),
  hasNextSpot: z.boolean(),
  nextSpot: z.object({
    spotId: z.number(),
    spotType: z.string(),
    title: z.string(),
    lat: z.number(),
    lng: z.number(),
    radiusM: z.number(),
    orderIndex: z.number(),
  }).nullable().optional(),
  progress: z.any().optional(),
});

// --- Types ---
export type RunState = z.infer<typeof RunStateSchema>;
export type ProximityRequest = z.infer<typeof ProximityRequestSchema>;
export type ProximityResponse = z.infer<typeof ProximityResponseSchema>;
export type ChatTurn = z.infer<typeof ChatTurnSchema>;
export type ChatSessionResponse = z.infer<typeof ChatSessionResponseSchema>;
export type ChatHistoryResponse = z.infer<typeof ChatHistoryResponseSchema>;
export type ChatMessageRequest = z.infer<typeof ChatMessageRequestSchema>;
export type ChatMessageResponse = z.infer<typeof ChatMessageResponseSchema>;
export type NextSpotResponse = z.infer<typeof NextSpotResponseSchema>;
