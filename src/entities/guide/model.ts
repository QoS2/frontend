import { useQuery } from '@tanstack/react-query';
import { httpClient } from '../../shared/api/httpClient'; // Import httpClient
import { API_FLAGS } from '../../shared/api/config';
import { MOCK_CONTENT } from './mockData';
import { GetContentResponseSchema, GuideContent } from '../../shared/api/contracts';

const fetchGuideContent = async (contentId: string): Promise<GuideContent> => {
  if (!API_FLAGS.GUIDE) {
     await new Promise((resolve) => setTimeout(resolve, 500));
     const content = MOCK_CONTENT[contentId];
     if (!content) throw new Error('Content not found');
     return GetContentResponseSchema.parse(content);
  }
  const response = await httpClient.get<unknown>(`/api/content/${contentId}`);
  return GetContentResponseSchema.parse(response);
};

export const useGuideContent = (contentId: string | null) => {
  return useQuery({
    queryKey: ['guide', contentId],
    queryFn: () => fetchGuideContent(contentId!),
    enabled: !!contentId,
  });
};
