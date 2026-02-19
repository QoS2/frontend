import { z } from 'zod';

// --- Enums ---
export const AccessStatusSchema = z.enum(['LOCKED', 'UNLOCKED']);
export const SpotTypeSchema = z.enum(['MAIN', 'SUB', 'PHOTO', 'TREASURE']);
export const RunStatusSchema = z.enum(['IN_PROGRESS', 'COMPLETED', 'ABANDONED']); // Add verified values
export const RunModeSchema = z.enum(['START', 'RESUME']);

// --- Common Sub-schemas ---
export const TagSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
});

export const TourCountsSchema = z.object({
  main: z.number(),
  sub: z.number(),
  photo: z.number(),
  treasure: z.number(),
  missions: z.number(),
});

export const SpotSchema = z.object({
  spotId: z.number(),
  type: SpotTypeSchema.optional().default('MAIN'), // Optional in some contexts
  title: z.string(),
  lat: z.number(),
  lng: z.number(),
  radiusM: z.number().optional(), // radiusM might be missing in some listings
  thumbnailUrl: z.string().nullable().optional(),
  isHighlight: z.boolean().optional(),
});

// --- API Response Schemas ---

// 4.1 Tour List Item
export const TourListItemSchema = z.object({
  id: z.number(),
  externalKey: z.string(),
  title: z.string(),
  description: z.string(),
  thumbnailUrl: z.string().url(),
  estimatedDurationMin: z.number(),
  accessStatus: AccessStatusSchema,
  tags: z.array(TagSchema),
  counts: TourCountsSchema,
});
export const TourListResponseSchema = z.array(TourListItemSchema);

// 4.2 Tour Detail
export const TourDetailSchema = z.object({
  tourId: z.number(),
  title: z.string(),
  description: z.string(),
  tags: z.array(TagSchema),
  counts: TourCountsSchema,
  info: z.object({
    entrance_fee: z.record(z.string(), z.number()).optional(), // adult: 3000 etc.
    available_hours: z.array(z.object({
      day: z.string(),
      open: z.string(),
      close: z.string(),
    })).optional(),
    estimated_duration_min: z.number(),
  }),
  goodToKnow: z.array(z.string()).optional(),
  startSpot: SpotSchema,
  mapSpots: z.array(SpotSchema),
  access: z.object({
    status: AccessStatusSchema,
    hasAccess: z.boolean(),
  }),
  thumbnails: z.array(z.string().url()),
  currentRun: z.object({
    runId: z.number(),
    status: RunStatusSchema,
    startedAt: z.string().datetime().optional(), // ISO string
    progress: z.object({
      completedCount: z.number(),
      totalCount: z.number(),
      completedSpotIds: z.array(z.number()),
    }),
  }).nullable().optional(), // Nullable if no run exists
  actions: z.object({
    primaryButton: z.string(), // CONSTANT check needed?
    secondaryButton: z.string().optional(),
    moreActions: z.array(z.string()).optional(),
  }).optional(),
});

// 4.4 Run Response
export const RunResponseSchema = z.object({
  runId: z.number(),
  tourId: z.number(),
  status: RunStatusSchema,
  mode: z.enum(['START', 'RESUME']).optional(), // Optional in response?
  progress: z.object({
    completedCount: z.number(),
    totalCount: z.number(),
    completedSpotIds: z.array(z.number()),
  }),
  startSpot: SpotSchema,
});

// --- Payload Schemas ---
export const RunActionSchema = z.object({
  mode: RunModeSchema,
});

// --- Types ---
export type AccessStatus = z.infer<typeof AccessStatusSchema>;
export type TourListItem = z.infer<typeof TourListItemSchema>;
export type TourDetail = z.infer<typeof TourDetailSchema>;
export type RunResponse = z.infer<typeof RunResponseSchema>;
export type Spot = z.infer<typeof SpotSchema>;
