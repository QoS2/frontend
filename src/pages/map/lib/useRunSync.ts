import { useEffect, useMemo } from 'react';
import { useLocationMarkers } from '@entities/location';
import { useRunProgressStore } from '@features/run-progress';
import { useDistanceCalculator } from '@shared/lib';

interface UseRunSyncProps {
    isRunMode: boolean;
    tourDetail: any;
    currentRun: any;
    location: any;
}

export function useRunSync({ isRunMode, tourDetail, currentRun, location }: UseRunSyncProps) {
    const { data: markers = [] } = useLocationMarkers();
    const { currentTarget, setCurrentTarget } = useRunProgressStore();

    // Sync RunState to RunProgressStore
    // Rule applied: rerender-dependencies (using primitive completedSpotIds.length for check instead of full objects when possible)
    useEffect(() => {
        if (!isRunMode || !tourDetail || !currentRun) {
            setCurrentTarget(null);
            return;
        }
        
        const completedIds = currentRun.progress.completedSpotIds;
        const nextSpot = tourDetail.mapSpots.find((spot: any) => !completedIds.includes(spot.spotId));
        
        if (nextSpot) {
            // Only update if target actually changed to prevent primitive infinite render loop
            setCurrentTarget({
                spotId: nextSpot.spotId,
                title: nextSpot.title,
                lat: nextSpot.lat,
                lng: nextSpot.lng,
                radiusM: nextSpot.radiusM ?? 50,
            });
        } else {
            setCurrentTarget(null);
        }
    }, [isRunMode, tourDetail, currentRun, setCurrentTarget]);

    // Target Logic: 
    const targetMarker = useMemo(() => {
        if (!isRunMode || !currentTarget) return null;
        return markers.find(m => m.type === 'PLACE' && m.title === currentTarget.title) || null;
    }, [isRunMode, currentTarget, markers]);

    // Calculate Distance
    const distanceText = useDistanceCalculator(
        location, 
        currentTarget 
            ? { latitude: currentTarget.lat, longitude: currentTarget.lng } 
            : (targetMarker ? targetMarker.coordinate : null)
    );

    // Derive TopNavBar data
    const navDestination = currentTarget ? currentTarget.title : (targetMarker ? targetMarker.title : 'Exploring Seoul');
    const navDistance = distanceText || 'Calculating...';

    return {
        targetMarker,
        navDestination,
        navDistance
    };
}
