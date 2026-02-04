import { useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { useLocationTracker } from '@shared/lib/hooks/useLocationTracker';
import { useLocationMarkers } from '@entities/location/model';
import { getDistance } from '@shared/lib/geo';
import { useMapNavigationStore } from './model';

const DWELL_TIME_MS = 3000;

export function useGeofenceTrigger() {
  const { location } = useLocationTracker();
  const { data: markers } = useLocationMarkers();
  const { activeMarkerId, setActiveMarkerId, setTriggeredMarkerId } = useMapNavigationStore();

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!location || !markers) return;

    let currentMarkerId: string | null = null;

    // Find if user is within any marker's radius
    for (const marker of markers) {
      const distance = getDistance(
        location.latitude,
        location.longitude,
        marker.coordinate.latitude,
        marker.coordinate.longitude,
      );

      if (distance <= marker.radius) {
        currentMarkerId = marker.id;
        break;
      }
    }

    // Handle state transitions
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
  }, [location, markers, activeMarkerId, setActiveMarkerId, setTriggeredMarkerId]);
}
