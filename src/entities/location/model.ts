import { useQuery } from '@tanstack/react-query';
import { httpClient } from '../../shared/api/httpClient'; // Import httpClient
import { API_FLAGS } from '../../shared/api/config';
import { MOCK_MARKERS } from './mockData';
import { GetMarkersResponseSchema, LocationMarker } from '../../shared/api/contracts'; // Import Schema/Type

const fetchMarkers = async (): Promise<LocationMarker[]> => {
  if (!API_FLAGS.LOCATION) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return GetMarkersResponseSchema.parse(MOCK_MARKERS);
  }
  const response = await httpClient.get<unknown>('/api/markers');
  return GetMarkersResponseSchema.parse(response);
};

export const useLocationMarkers = () => {
  return useQuery({
    queryKey: ['markers'],
    queryFn: fetchMarkers,
  });
};
