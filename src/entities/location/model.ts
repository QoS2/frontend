import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@shared/api/client';

export const useLocationMarkers = () => {
  return useQuery({
    queryKey: ['markers'],
    queryFn: apiClient.getMarkers,
  });
};
