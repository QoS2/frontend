import { useRef, useMemo, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { useLocationMarkers } from '@entities/location';
import { getDistance } from '@shared/lib/geo';
import { useMapNavigationStore } from './model';
import { LocationMarker } from '@shared/api/contracts';

const DWELL_TIME_MS = 3000;

// Pure calculation hook
function useGeofence(
  location: { latitude: number; longitude: number } | null,
  markers: LocationMarker[] | undefined,
  excludeTypes?: string[]
) {
  return useMemo(() => {
    if (!location || !markers) return null;

    const filteredMarkers = excludeTypes 
      ? markers.filter(m => !excludeTypes.includes(m.type))
      : markers;

    for (const marker of filteredMarkers) {
      const distance = getDistance(
        location.latitude,
        location.longitude,
        marker.coordinate.latitude,
        marker.coordinate.longitude,
      );

      if (distance <= marker.radius) {
        return marker.id;
      }
    }
    return null;
  }, [location, markers, excludeTypes]);
}

export function useGeofenceTrigger(
  location: { latitude: number; longitude: number } | null,
  excludeTypes?: string[]
) {
  const { data: markers } = useLocationMarkers();
  const { setActiveMarkerId, setTriggeredMarkerId } = useMapNavigationStore();

  const currentMarkerId = useGeofence(location, markers, excludeTypes);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only proceed if the calculated marker ID implies a change
    // Access state directly to avoid dependency cycle
    const currentActiveId = useMapNavigationStore.getState().activeMarkerId;
    if (currentMarkerId === currentActiveId) return;

    if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
    }

    setActiveMarkerId(currentMarkerId);

    if (currentMarkerId) {
        // Start new timer for dwell time
        timerRef.current = setTimeout(() => {
            setTriggeredMarkerId(currentMarkerId);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            timerRef.current = null;
        }, DWELL_TIME_MS);
    } else {
        // User left the marker area -> Clear triggered state immediately
        setTriggeredMarkerId(null);
    }
  }, [currentMarkerId, setActiveMarkerId, setTriggeredMarkerId]);
}
