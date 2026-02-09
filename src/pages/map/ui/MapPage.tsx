import React, { useRef, useMemo } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet from '@gorhom/bottom-sheet';
import { MapViewWidget } from '@widgets/map-view';
import { AIChatWidget } from '@widgets/ai-chat';
import { useLocationMarkers } from '@entities/location/model';
import { useLocationTracker } from '@shared/lib/hooks/useLocationTracker';
import { useGeofenceTrigger } from '@features/map-navigation/useGeofenceTrigger';
import { useMapNavigationStore } from '@features/map-navigation/model';

export function MapPage() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['15%', '50%', '90%'], []);

  const { data: markers = [] } = useLocationMarkers();
  const { location } = useLocationTracker();
  const { activeMarkerId } = useMapNavigationStore();

  // Run geofence trigger logic
  useGeofenceTrigger();

  const handleMarkerPress = (marker: any) => {
    console.log('Marker pressed:', marker.title);
  };

  return (
    <GestureHandlerRootView className="flex-1">
      <MapViewWidget
        markers={markers}
        userLocation={location}
        onMarkerPress={handleMarkerPress}
        activeMarkerId={activeMarkerId}
      />
      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        backgroundStyle={{ backgroundColor: 'white' }}
        handleIndicatorStyle={{ backgroundColor: '#D1D5DB' }}
      >
        <AIChatWidget />
      </BottomSheet>
    </GestureHandlerRootView>
  );
}
