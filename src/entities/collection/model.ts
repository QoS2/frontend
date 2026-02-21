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
const fetchPlaceCollection = async (): Promise<PlaceCollectionResponse> => {
  const response = await httpClient.get<unknown>('/api/v1/collections/places');
  return PlaceCollectionResponseSchema.parse(response);
};

const fetchTreasureCollection = async (): Promise<TreasureCollectionResponse> => {
  const response = await httpClient.get<unknown>('/api/v1/collections/treasures');
  return TreasureCollectionResponseSchema.parse(response);
};

const fetchPhotoSpots = async (): Promise<PhotoSpotsResponse> => {
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
