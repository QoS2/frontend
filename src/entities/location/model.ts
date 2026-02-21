import { useQuery } from '@tanstack/react-query';
import { httpClient } from '../../shared/api/httpClient'; // Import httpClient
import { GetMarkersResponseSchema, LocationMarker } from '../../shared/api/contracts'; // Import Schema/Type

const fetchMarkers = async (): Promise<LocationMarker[]> => {
  const response = await httpClient.get<unknown>('/api/markers');
  return GetMarkersResponseSchema.parse(response);
};

export const useLocationMarkers = () => {
  return useQuery({
    queryKey: ['markers'],
    queryFn: fetchMarkers,
  });
};
