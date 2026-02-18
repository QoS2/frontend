import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@shared/api/client';
export type { GuideContent } from '@shared/api/contracts';

export const useGuideContent = (contentId: string | null) => {
  return useQuery({
    queryKey: ['guide', contentId],
    queryFn: () => apiClient.getGuideContent(contentId!),
    enabled: !!contentId,
  });
};
