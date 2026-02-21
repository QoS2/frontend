import { useQuery } from '@tanstack/react-query';
import { httpClient } from '../../shared/api/httpClient';
import {
  SpotDetail,
  SpotDetailSchema,
  SpotGuideResponse,
  SpotGuideResponseSchema,
} from '../../shared/api/spot.contracts';
import { ApiError } from '../../shared/api/auth.contracts';

// --- API Functions ---
const fetchSpotDetail = async (spotId: number | string): Promise<SpotDetail> => {
  const response = await httpClient.get<unknown>(`/api/v1/spots/${spotId}`);
  return SpotDetailSchema.parse(response);
};

const fetchSpotGuide = async (spotId: number | string): Promise<SpotGuideResponse> => {
  const response = await httpClient.get<unknown>(`/api/v1/spots/${spotId}/guide`);
  return SpotGuideResponseSchema.parse(response);
};

// --- Hooks ---
export const useSpotDetail = (spotId: number | string) => {
  return useQuery<SpotDetail, ApiError>({
    queryKey: ['spot', spotId],
    queryFn: () => fetchSpotDetail(spotId),
    enabled: !!spotId,
  });
};

export const useSpotGuide = (spotId: number | string) => {
  return useQuery<SpotGuideResponse, ApiError>({
    queryKey: ['spot', spotId, 'guide'],
    queryFn: () => fetchSpotGuide(spotId),
    enabled: !!spotId,
  });
};
