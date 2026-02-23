import { useMemo } from 'react';
import { LocationMarker } from '../../shared/api/contracts';
import { useTourStore } from '../tour/store';
import { useTourDetail } from '../tour/model';

export const useLocationMarkers = () => {
  const activeTourId = useTourStore((state) => state.activeTourId);
  const { data: tourDetail, isLoading, error } = useTourDetail(activeTourId ?? 0);

  const markers: LocationMarker[] = useMemo(() => {
    if (!tourDetail?.mapSpots) return [];
    
    // 좌표별 마커 개수 추적을 위한 맵
    const coordCounts: Record<string, number> = {};
    const OFFSET_BASE = 0.00008; // 약 8-10m 정도의 미세한 오프셋

    return tourDetail.mapSpots.map((spot) => {
      let mappedType: LocationMarker['type'] = 'PLACE';
      if (spot.type === 'MAIN') mappedType = 'PLACE';
      else if (spot.type === 'SUB') mappedType = 'SUB_PLACE';
      else if (spot.type === 'PHOTO') mappedType = 'PHOTO';
      else if (spot.type === 'TREASURE') mappedType = 'TREASURE';

      const coordKey = `${spot.lat.toFixed(6)},${spot.lng.toFixed(6)}`;
      const count = coordCounts[coordKey] || 0;
      coordCounts[coordKey] = count + 1;

      // 중복 좌표인 경우 원형으로 미세하게 분산
      let adjustedLat = spot.lat;
      let adjustedLng = spot.lng;

      if (count > 0) {
        // 인덱스에 따라 각도를 다르게 하여 원형 배치 (간단한 Jittering)
        const angle = (count * 137.5) * (Math.PI / 180); // 황금각 사용
        const radius = OFFSET_BASE * Math.sqrt(count);
        adjustedLat += radius * Math.cos(angle);
        adjustedLng += radius * Math.sin(angle);
      }

      return {
        id: String(spot.spotId),
        type: mappedType,
        coordinate: { latitude: adjustedLat, longitude: adjustedLng },
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
