import { useQuery } from '@tanstack/react-query';
import { httpClient } from '../../shared/api/httpClient';
import { SpotGuideResponse, SpotGuideResponseSchema } from '../../shared/api/spot.contracts';

const fetchGuideContent = async (contentId: string): Promise<SpotGuideResponse> => {
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
