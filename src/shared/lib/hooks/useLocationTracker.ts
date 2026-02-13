import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
}

export function useLocationTracker() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let isMounted = true;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        // Initial fetch to get location immediately
        try {
          const initialLoc = await Location.getCurrentPositionAsync({});
          if (isMounted) setLocation(initialLoc.coords);
        } catch (err) {
          // Ignore initial fetch error, watcher will pick up
        }

        // Optimized watch position
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 2000, 
            distanceInterval: 10,
          },
          (newLocation) => {
            if (isMounted) {
              setLocation(newLocation.coords);
            }
          }
        );
      } catch (e) {
        setErrorMsg('Error initializing location tracker');
      }
    })();

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  return { location, errorMsg };
}
