import { useEffect, useRef, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import { useLocationTracker } from '@shared/lib';
import { useLocationMarkers } from '@entities/location';
import { getDistance } from '@shared/lib/geo';
import { useMapNavigationStore } from './model';
import { LocationMarker } from '@shared/api/contracts';

const DWELL_TIME_MS = 3000;

// Pure calculation hook
function useGeofence(
  location: { latitude: number; longitude: number } | null,
  markers: LocationMarker[] | undefined,
) {
  return useMemo(() => {
    if (!location || !markers) return null;

    for (const marker of markers) {
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
  }, [location, markers]);
}

export function useGeofenceTrigger() {
  const { location } = useLocationTracker();
  const { data: markers } = useLocationMarkers();
  const { activeMarkerId, setActiveMarkerId, setTriggeredMarkerId } = useMapNavigationStore();

  const currentMarkerId = useGeofence(location, markers);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Handle state transitions based on calculated currentMarkerId
    if (currentMarkerId !== activeMarkerId) {
      // Clear existing timer if any
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
        // User is not in any marker, clear triggered marker
        setTriggeredMarkerId(null);
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentMarkerId, activeMarkerId, setActiveMarkerId, setTriggeredMarkerId]);
}
