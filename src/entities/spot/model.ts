import { useQuery } from '@tanstack/react-query';
import { API_FLAGS } from '../../shared/api/config';
import { httpClient } from '../../shared/api/httpClient';
import {
  SpotDetail,
  SpotDetailSchema,
  GuideSegment,
  SpotGuideResponseSchema,
} from '../../shared/api/spot.contracts';
import { ApiError } from '../../shared/api/auth.contracts';

// --- Mock Data ---
const MOCK_SPOT_DETAIL: SpotDetail = {
  id: 1,
  name: 'Gwanghwamun Gate',
  description: 'The main gate of Gyeongbokgung Palace, featuring 3 arched gates.',
  imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Gwanghwamun_Gate_2022.jpg/1200px-Gwanghwamun_Gate_2022.jpg',
  type: 'HISTORICAL',
  location: { lat: 37.5759, lng: 126.9768 },
  estimatedTimeMinutes: 15,
};

const MOCK_SPOT_GUIDE: GuideSegment[] = [
  {
    segmentId: 'seg_1',
    spotId: 1,
    title: 'The Gate of Light',
    content: 'Gwanghwamun means "May the light of enlightenment cover the world".',
    order: 1,
  },
  {
    segmentId: 'seg_2',
    spotId: 1,
    title: 'Haitai Statues',
    content: 'Look at the mythical creatures guarding the gate. They protect against fire.',
    order: 2,
  },
];

// --- API Functions ---
const fetchSpotDetail = async (spotId: number | string): Promise<SpotDetail> => {
  if (!API_FLAGS.TOUR) { // Using TOUR flag for now or add SPOT flag
    await new Promise((resolve) => setTimeout(resolve, 300));
    // Mock always returns data, id is just for confirmation
    const numericId = typeof spotId === 'string' ? parseInt(spotId.replace(/\D/g, '').slice(0, 5)) || 1 : spotId;
    return SpotDetailSchema.parse({ ...MOCK_SPOT_DETAIL, id: numericId });
  }
  const response = await httpClient.get<unknown>(`/api/v1/spots/${spotId}`);
  return SpotDetailSchema.parse(response);
};

const fetchSpotGuide = async (spotId: number | string): Promise<GuideSegment[]> => {
  if (!API_FLAGS.TOUR) {
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
  return useQuery<GuideSegment[], ApiError>({
    queryKey: ['spot', spotId, 'guide'],
    queryFn: () => fetchSpotGuide(spotId),
    enabled: !!spotId,
  });
};
