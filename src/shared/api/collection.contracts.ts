import { z } from 'zod';
import { ApiErrorSchema } from './auth.contracts';

// --- Shared Schemas ---
export const CollectionItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  acquiredAt: z.string().datetime(), // ISO Date string
});

export type CollectionItem = z.infer<typeof CollectionItemSchema>;

// --- Place Collection ---
export const PlaceCollectionResponseSchema = z.object({
  items: z.array(CollectionItemSchema),
  totalCount: z.number(),
});

export type PlaceCollectionResponse = z.infer<typeof PlaceCollectionResponseSchema>;

// --- Treasure Collection ---
export const TreasureCollectionResponseSchema = z.object({
  items: z.array(CollectionItemSchema),
  totalCount: z.number(),
});

export type TreasureCollectionResponse = z.infer<typeof TreasureCollectionResponseSchema>;

// --- Photo Spots ---
export const PhotoSpotSchema = z.object({
  id: z.string(),
  spotId: z.number(),
  title: z.string(),
  description: z.string(),
  exampleImageUrl: z.string().url(),
  isCompleted: z.boolean(),
  mySubmissionUrl: z.string().url().nullable().optional(),
});

export type PhotoSpot = z.infer<typeof PhotoSpotSchema>;

export const PhotoSpotsResponseSchema = z.object({
  items: z.array(PhotoSpotSchema),
});

export type PhotoSpotsResponse = z.infer<typeof PhotoSpotsResponseSchema>;

// --- File Upload ---
export const FileUploadResponseSchema = z.object({
  url: z.string().url(),
  fileId: z.string(),
});

export type FileUploadResponse = z.infer<typeof FileUploadResponseSchema>;

export const FileUploadErrorSchema = ApiErrorSchema;
