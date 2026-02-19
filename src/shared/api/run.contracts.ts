import { z } from 'zod';
import { SpotSchema, TourListItemSchema } from './tour.contracts';

// --- Enums ---
export const ChatSenderSchema = z.enum(['USER', 'GUIDE', 'SYSTEM']);
export const ChatTypeSchema = z.enum(['TEXT', 'AUDIO', 'IMAGE', 'MISSION']);
export const ProximityStatusSchema = z.enum(['FAR', 'CLOSE', 'ARRIVED']);

// --- Run State ---
export const RunStateSchema = z.object({
  runId: z.number(),
  tourId: z.number(),
  status: z.enum(['IN_PROGRESS', 'COMPLETED', 'ABANDONED']),
  currentSpotId: z.number().nullable(), // Null logic needs check
  progress: z.object({
    completedCount: z.number(),
    totalCount: z.number(),
    completedSpotIds: z.array(z.number()),
  }),
});

// --- Proximity & GPS ---
export const ProximityRequestSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  targetSpotId: z.number(),
});

export const ProximityResponseSchema = z.object({
  status: ProximityStatusSchema,
  distanceMeters: z.number(),
  event: z.object({
    type: z.enum(['NONE', 'GUIDE_START', 'MISSION_UNLOCK']),
    payload: z.any().optional(), // Define specific payloads later
  }).optional(),
});

// --- Chat & Guide ---
export const ChatMessageSchema = z.object({
  messageId: z.string(), // Server generated ID
  runId: z.number(),
  spotId: z.number().optional(),
  sender: ChatSenderSchema,
  type: ChatTypeSchema,
  content: z.string(), // Text or URL
  timestamp: z.string().datetime(),
});

export const ChatHistoryResponseSchema = z.array(ChatMessageSchema);

export const SendMessageRequestSchema = z.object({
  content: z.string(),
  type: ChatTypeSchema.default('TEXT'),
});

// --- Types ---
export type RunState = z.infer<typeof RunStateSchema>;
export type ProximityRequest = z.infer<typeof ProximityRequestSchema>;
export type ProximityResponse = z.infer<typeof ProximityResponseSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type SendMessageRequest = z.infer<typeof SendMessageRequestSchema>;
