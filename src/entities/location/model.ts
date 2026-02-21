import { useMemo } from 'react';
import { LocationMarker } from '../../shared/api/contracts';
import { useTourStore } from '../tour/store';
import { useTourDetail } from '../tour/model';

export const useLocationMarkers = () => {
  const activeTourId = useTourStore((state) => state.activeTourId);
  const { data: tourDetail, isLoading, error } = useTourDetail(activeTourId ?? 0);

  const markers: LocationMarker[] = useMemo(() => {
    if (!tourDetail?.mapSpots) return [];
    
    return tourDetail.mapSpots.map((spot) => {
      let mappedType: LocationMarker['type'] = 'PLACE';
      if (spot.type === 'MAIN') mappedType = 'PLACE';
      else if (spot.type === 'SUB') mappedType = 'SUB_PLACE';
      else if (spot.type === 'PHOTO') mappedType = 'PHOTO';
      else if (spot.type === 'TREASURE') mappedType = 'TREASURE';

      return {
        id: String(spot.spotId),
        type: mappedType,
        coordinate: { latitude: spot.lat, longitude: spot.lng },
        radius: spot.radiusM ?? 50,
        title: spot.title,
        description: spot.title,
        contentId: String(spot.spotId),
        thumbnailUrl: spot.thumbnailUrl || 'https://placehold.co/400x400/png'
      };
    });
  }, [tourDetail?.mapSpots]);

  return { data: markers, isLoading, error };
};
