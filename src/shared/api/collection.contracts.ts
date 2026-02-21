import { z } from 'zod';
import { ApiErrorSchema } from './auth.contracts';

// --- Place Collection ---

export const PlaceCollectionItemSchema = z.object({
  spotId: z.number(),
  tourId: z.number(),
  tourTitle: z.string(),
  type: z.enum(['MAIN', 'SUB']),
  title: z.string(),
  description: z.string().nullable().optional(),
  thumbnailUrl: z.string().url().nullable().optional(),
  collectedAt: z.string().datetime().nullable().optional(),
  orderIndex: z.number(),
  collected: z.boolean(),
});
export type PlaceCollectionItem = z.infer<typeof PlaceCollectionItemSchema>;

export const PlaceCollectionResponseSchema = z.object({
  totalCollected: z.number(),
  totalAvailable: z.number(),
  items: z.array(PlaceCollectionItemSchema),
});
export type PlaceCollectionResponse = z.infer<typeof PlaceCollectionResponseSchema>;


// --- Treasure Collection ---

export const TreasureCollectionItemSchema = z.object({
  spotId: z.number(),
  tourId: z.number(),
  tourTitle: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  thumbnailUrl: z.string().url().nullable().optional(),
  gotAt: z.string().datetime().nullable().optional(),
  orderIndex: z.number(),
  collected: z.boolean(),
});
export type TreasureCollectionItem = z.infer<typeof TreasureCollectionItemSchema>;

export const TreasureCollectionResponseSchema = z.object({
  totalCollected: z.number(),
  totalAvailable: z.number(),
  items: z.array(TreasureCollectionItemSchema),
});
export type TreasureCollectionResponse = z.infer<typeof TreasureCollectionResponseSchema>;


// --- Photo Spots ---

export const SamplePhotoSchema = z.object({
  id: z.number(),
  url: z.string().url(),
  submittedBy: z.string().nullable().optional(),
  mintedAt: z.string().nullable().optional(),
});

export const PhotoSpotItemSchema = z.object({
  spotId: z.number(),
  tourId: z.number(),
  tourTitle: z.string(),
  title: z.string(),
  description: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  thumbnailUrl: z.string().url().nullable().optional(),
  userPhotoCount: z.number(),
  samplePhotos: z.array(SamplePhotoSchema).optional().default([]),
  collected: z.boolean(),
});
export type PhotoSpotItem = z.infer<typeof PhotoSpotItemSchema>;

// API returns a list (array) of photo spots directly or wrapped?
// API.md says: GET /api/v1/collections/photo-spots -> List<PhotoSpotCollectionResponse>
// Let's assume it returns an array of items directly based on typical REST patterns or if wrapped.
// API.md example shows a JSON array or object? Usually list.
// If it creates a wrapper:
export const PhotoSpotsResponseSchema = z.array(PhotoSpotItemSchema);
export type PhotoSpotsResponse = z.infer<typeof PhotoSpotsResponseSchema>;


// --- File Upload ---

export const FileUploadResponseSchema = z.object({
  url: z.string().url(),
});
export type FileUploadResponse = z.infer<typeof FileUploadResponseSchema>;

export const FileUploadErrorSchema = ApiErrorSchema;
