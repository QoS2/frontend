import { useQuery } from '@tanstack/react-query';
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

// --- API Functions ---
const fetchPlaceCollection = async (tourId?: number): Promise<PlaceCollectionResponse> => {
  const endpoint = tourId ? `/api/v1/collections/places?tourId=${tourId}` : '/api/v1/collections/places';
  const response = await httpClient.get<unknown>(endpoint);
  return PlaceCollectionResponseSchema.parse(response);
};

const fetchTreasureCollection = async (tourId?: number): Promise<TreasureCollectionResponse> => {
  const endpoint = tourId ? `/api/v1/collections/treasures?tourId=${tourId}` : '/api/v1/collections/treasures';
  const response = await httpClient.get<unknown>(endpoint);
  return TreasureCollectionResponseSchema.parse(response);
};

const fetchPhotoSpots = async (tourId?: number): Promise<PhotoSpotsResponse> => {
  const endpoint = tourId ? `/api/v1/photo-spots?tourId=${tourId}` : '/api/v1/photo-spots';
  const response = await httpClient.get<unknown>(endpoint);
  return PhotoSpotsResponseSchema.parse(response);
};


// --- Hooks ---
export const usePlaceCollection = (tourId?: number) => {
  return useQuery<PlaceCollectionResponse, ApiError>({
    queryKey: ['collection', 'places', tourId],
    queryFn: () => fetchPlaceCollection(tourId),
  });
};

export const useTreasureCollection = (tourId?: number) => {
    return useQuery<TreasureCollectionResponse, ApiError>({
      queryKey: ['collection', 'treasures', tourId],
      queryFn: () => fetchTreasureCollection(tourId),
    });
};

export const usePhotoSpots = (tourId?: number) => {
    return useQuery<PhotoSpotsResponse, ApiError>({
      queryKey: ['collection', 'photo-spots', tourId],
      queryFn: () => fetchPhotoSpots(tourId),
    });
};
