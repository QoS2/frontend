import { useQuery } from '@tanstack/react-query';
import { httpClient } from '../../shared/api/httpClient';
import { API_FLAGS } from '../../shared/api/config';
import { MOCK_SPOT_GUIDE } from '../spot/mockData';
import { SpotGuideResponse, SpotGuideResponseSchema } from '../../shared/api/spot.contracts';

const fetchGuideContent = async (contentId: string): Promise<SpotGuideResponse> => {
  if (!API_FLAGS.GUIDE) {
     await new Promise((resolve) => setTimeout(resolve, 500));
     return SpotGuideResponseSchema.parse(MOCK_SPOT_GUIDE);
  }
  const response = await httpClient.get<unknown>(`/api/v1/spots/${contentId}/guide`);
  return SpotGuideResponseSchema.parse(response);
};

export const useGuideContent = (contentId: string | null) => {
  return useQuery({
    queryKey: ['guide', contentId],
    queryFn: () => fetchGuideContent(contentId!),
    enabled: !!contentId,
  });
};
