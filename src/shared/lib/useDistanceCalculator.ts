import { useState, useEffect, useRef } from 'react';
import { getDistance, formatDistance } from './geo';

interface Coordinates {
    latitude: number;
    longitude: number;
}

export function useDistanceCalculator(
    currentLocation: Coordinates | null,
    targetLocation: Coordinates | null
) {
    const [distanceString, setDistanceString] = useState<string>('');
    const lastUpdateRef = useRef<number>(0);

    useEffect(() => {
        if (!currentLocation || !targetLocation) {
            setDistanceString('');
            return;
        }

        const now = Date.now();
        // Throttle updates to every 5 seconds to save resources
        if (now - lastUpdateRef.current < 5000) return;

        lastUpdateRef.current = now;

        const distMeters = getDistance(
            currentLocation.latitude,
            currentLocation.longitude,
            targetLocation.latitude,
            targetLocation.longitude
        );

        setDistanceString(formatDistance(distMeters));
    }, [currentLocation, targetLocation]);

    return distanceString;
}
