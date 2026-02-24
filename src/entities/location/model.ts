import { useMemo } from 'react';
import { LocationMarker } from '../../shared/api/contracts';
import { useTourStore } from '../tour/store';
import { useTourDetail } from '../tour/model';

export const useLocationMarkers = () => {
  const activeTourId = useTourStore((state) => state.activeTourId);
  const { data: tourDetail, isLoading, error } = useTourDetail(activeTourId ?? 0);

  const markers: LocationMarker[] = useMemo(() => {
    if (!tourDetail?.mapSpots) return [];
    
    // 좌표별 non-PLACE 마커 개수 추적 (PLACE는 항상 원래 위치)
    const nonPlaceCoordCounts: Record<string, number> = {};
    const OFFSET_BASE = 0.00008; // 약 8-10m 정도의 미세한 오프셋

    return tourDetail.mapSpots.map((spot) => {
      let mappedType: LocationMarker['type'] = 'PLACE';
      if (spot.type === 'MAIN') mappedType = 'PLACE';
      else if (spot.type === 'SUB') mappedType = 'SUB_PLACE';
      else if (spot.type === 'PHOTO') mappedType = 'PHOTO';
      else if (spot.type === 'TREASURE') mappedType = 'TREASURE';

      let adjustedLat = spot.lat;
      let adjustedLng = spot.lng;

      // PLACE(메인)는 항상 원래 좌표 유지, 나머지만 분산
      if (mappedType !== 'PLACE') {
        const coordKey = `${spot.lat.toFixed(6)},${spot.lng.toFixed(6)}`;
        const count = nonPlaceCoordCounts[coordKey] || 0;
        nonPlaceCoordCounts[coordKey] = count + 1;

        if (count > 0) {
          // 황금각 기반 원형 분산 배치 (Jittering)
          const angle = (count * 137.5) * (Math.PI / 180);
          const radius = OFFSET_BASE * Math.sqrt(count);
          adjustedLat += radius * Math.cos(angle);
          adjustedLng += radius * Math.sin(angle);
        }
      }

      return {
        id: String(spot.spotId),
        type: mappedType,
        coordinate: { latitude: adjustedLat, longitude: adjustedLng },
        radius: spot.radiusM ?? 50,
        title: spot.title,
        description: spot.title,
        contentId: String(spot.spotId),
        thumbnailUrl: spot.thumbnailUrl || 'https://placehold.co/400x400/png',
        isHighlight: spot.isHighlight ?? false,
      };
    });
  }, [tourDetail?.mapSpots]);

  return { data: markers, isLoading, error };
};
