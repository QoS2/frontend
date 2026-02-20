import { z } from 'zod';

// --- Enums ---
export const AccessStatusSchema = z.enum(['LOCKED', 'UNLOCKED']);
export const SpotTypeSchema = z.enum(['MAIN', 'SUB', 'PHOTO', 'TREASURE']);
export const RunStatusSchema = z.enum(['IN_PROGRESS', 'COMPLETED', 'ABANDONED']); // Add verified values
export const RunModeSchema = z.enum(['START', 'CONTINUE']);

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
  externalKey: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  thumbnailUrl: z.string().nullable().optional(),
  estimatedDurationMin: z.number().optional(),
  accessStatus: AccessStatusSchema.optional().default('UNLOCKED'),
  tags: z.array(TagSchema).optional().default([]),
  counts: TourCountsSchema.optional().default({ main: 0, sub: 0, photo: 0, treasure: 0, missions: 0 }),
});
export const TourListResponseSchema = z.array(TourListItemSchema);

// 4.2 Tour Detail
export const TourDetailSchema = z.object({
  tourId: z.number(),
  title: z.string(),
  description: z.string().nullable().optional().default(''),
  tags: z.array(TagSchema).optional().default([]),
  counts: TourCountsSchema.optional().default({ main: 0, sub: 0, photo: 0, treasure: 0, missions: 0 }),
  info: z.object({
    entrance_fee: z.record(z.string(), z.number()).nullable().optional(), // adult: 3000 etc.
    available_hours: z.array(z.object({
      day: z.string(),
      open: z.string(),
      close: z.string(),
    })).nullable().optional(),
    estimated_duration_min: z.number().nullable().optional().default(0),
  }).nullable().optional().default({ estimated_duration_min: 0 }),
  goodToKnow: z.array(z.string()).nullable().optional().default([]),
  startSpot: SpotSchema,
  mapSpots: z.array(SpotSchema).optional().default([]),
  access: z.object({
    status: AccessStatusSchema,
    hasAccess: z.boolean(),
  }).optional().default({ status: 'UNLOCKED', hasAccess: true }),
  thumbnails: z.array(z.string()).nullable().optional().default([]),
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
    secondaryButton: z.string().nullable().optional(),
    moreActions: z.array(z.string()).nullable().optional().default([]),
  }).nullable().optional(),
});

// 4.4 Run Response
export const RunResponseSchema = z.object({
  runId: z.number(),
  tourId: z.number(),
  status: RunStatusSchema,
  mode: z.enum(['START', 'CONTINUE']).optional(), // Optional in response?
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
