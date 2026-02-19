import { useQuery } from '@tanstack/react-query';
import { API_FLAGS } from '../../shared/api/config';
import { httpClient } from '../../shared/api/httpClient';
import {
  PlaceCollectionResponse,
  PlaceCollectionResponseSchema,
  TreasureCollectionResponse,
  TreasureCollectionResponseSchema,
  PhotoSpotsResponse,
  PhotoSpotsResponseSchema,
} from '../../shared/api/collection.contracts';
import { ApiError } from '../../shared/api/auth.contracts';

import { MOCK_PLACES, MOCK_TREASURES, MOCK_PHOTO_SPOTS } from './mockData';

// --- API Functions ---
const fetchPlaceCollection = async (): Promise<PlaceCollectionResponse> => {
  if (!API_FLAGS.COLLECTION) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return PlaceCollectionResponseSchema.parse(MOCK_PLACES);
  }
  const response = await httpClient.get<unknown>('/api/v1/collections/places');
  return PlaceCollectionResponseSchema.parse(response);
};

const fetchTreasureCollection = async (): Promise<TreasureCollectionResponse> => {
  if (!API_FLAGS.COLLECTION) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return TreasureCollectionResponseSchema.parse(MOCK_TREASURES);
  }
  const response = await httpClient.get<unknown>('/api/v1/collections/treasures');
  return TreasureCollectionResponseSchema.parse(response);
};

const fetchPhotoSpots = async (): Promise<PhotoSpotsResponse> => {
   if (!API_FLAGS.COLLECTION) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return PhotoSpotsResponseSchema.parse(MOCK_PHOTO_SPOTS);
  }
  const response = await httpClient.get<unknown>('/api/v1/photo-spots');
  return PhotoSpotsResponseSchema.parse(response);
};


// --- Hooks ---
export const usePlaceCollection = () => {
  return useQuery<PlaceCollectionResponse, ApiError>({
    queryKey: ['collection', 'places'],
    queryFn: fetchPlaceCollection,
  });
};

export const useTreasureCollection = () => {
    return useQuery<TreasureCollectionResponse, ApiError>({
      queryKey: ['collection', 'treasures'],
      queryFn: fetchTreasureCollection,
    });
};

export const usePhotoSpots = () => {
    return useQuery<PhotoSpotsResponse, ApiError>({
      queryKey: ['collection', 'photo-spots'],
      queryFn: fetchPhotoSpots,
    });
};
