import { z } from 'zod';

// --- Domain Schemas ---

export const CoordinateSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const QuestTypeSchema = z.enum(['SELECT_IMAGE', 'FILL_BLANKS', 'MULTIPLE_CHOICE']);

export const QuestSchema = z.object({
  id: z.string(),
  type: QuestTypeSchema,
  question: z.string(),
  options: z.array(z.string()),
  answer: z.string(),
  hint: z.string().optional(),
  rewardMint: z.number().nonnegative(),
});

export const InteractionTypeSchema = z.enum(['MEDIA', 'QUEST', 'CAMERA', 'REWARD']);

export const GuideEventSchema = z.object({
  id: z.string(),
  triggerIndex: z.number().nonnegative(), // Character index in the script to trigger this event
  type: InteractionTypeSchema,
  data: z.object({
    // Media
    mediaUrl: z.string().url().optional(),
    mediaType: z.enum(['IMAGE', 'VIDEO']).optional(),
    
    // Quest
    questId: z.string().optional(),
    
    // Camera
    targetName: z.string().optional(), // What the user should take a picture of
    
    // Reward
    mintAmount: z.number().optional(),
  }).passthrough(), // Allow flexibility for future expansions
});

export const GuideContentSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  script: z.string(),
  events: z.array(GuideEventSchema), // Replaced mediaMap with unified events
  quests: z.array(QuestSchema),
  steps: z.array(z.object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
  })).optional(), // Add steps as optional for now to match mock data structure
});

export const LocationMarkerTypeSchema = z.enum(['PLACE', 'SUB_PLACE', 'PHOTO', 'TREASURE']);

export const LocationMarkerSchema = z.object({
  id: z.string().uuid(),
  type: LocationMarkerTypeSchema,
  coordinate: CoordinateSchema,
  radius: z.number().positive(),
  title: z.string(),
  description: z.string(),
  contentId: z.string().uuid().nullable(),
  thumbnailUrl: z.string().url(),
});

// --- API Request/Response Schemas ---

// GET /api/markers
export const GetMarkersResponseSchema = z.array(LocationMarkerSchema);

// GET /api/content/:id
export const GetContentResponseSchema = GuideContentSchema;

// POST /api/chat
export const ChatRequestSchema = z.object({
  message: z.string().min(1),
  contextStepId: z.string().uuid(),
  currentTextIndex: z.number().optional(), // For context awareness
});

export const ChatResponseSchema = z.object({
  reply: z.string(), // Full reply text (for fake streaming)
});

// --- Types inferred from Schemas ---
export type Coordinate = z.infer<typeof CoordinateSchema>;
export type Quest = z.infer<typeof QuestSchema>;
export type GuideContent = z.infer<typeof GuideContentSchema>;
export type LocationMarker = z.infer<typeof LocationMarkerSchema>;
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type ChatResponse = z.infer<typeof ChatResponseSchema>;
