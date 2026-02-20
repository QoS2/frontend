import { useQuery } from '@tanstack/react-query';
import { API_FLAGS } from '../../shared/api/config';
import { httpClient } from '../../shared/api/httpClient';
import {
  SpotDetail,
  SpotDetailSchema,
  SpotGuideResponse,
  SpotGuideResponseSchema,
} from '../../shared/api/spot.contracts';
import { ApiError } from '../../shared/api/auth.contracts';

import { MOCK_SPOT_DETAIL, MOCK_SPOT_GUIDE } from './mockData';

// --- API Functions ---
const fetchSpotDetail = async (spotId: number | string): Promise<SpotDetail> => {
  if (!API_FLAGS.SPOT) { 
    await new Promise((resolve) => setTimeout(resolve, 300));
    // Mock always returns data, id is just for confirmation
    const numericId = typeof spotId === 'string' ? parseInt(spotId.replace(/\D/g, '').slice(0, 5)) || 1 : spotId;
    return SpotDetailSchema.parse({ ...MOCK_SPOT_DETAIL, spotId: numericId });
  }
  const response = await httpClient.get<unknown>(`/api/v1/spots/${spotId}`);
  return SpotDetailSchema.parse(response);
};

const fetchSpotGuide = async (spotId: number | string): Promise<SpotGuideResponse> => {
  if (!API_FLAGS.SPOT) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return SpotGuideResponseSchema.parse(MOCK_SPOT_GUIDE);
  }
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
