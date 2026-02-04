import React from 'react';
import { View } from 'react-native';
import { MapViewWidget } from '../../widgets/map-view';
import { AIChatWidget } from '../../widgets/ai-chat';
import { useLocationMarkers } from '../../entities/location/model';
import { useLocationTracker } from '../../shared/lib/hooks/useLocationTracker';
import { useGeofenceTrigger } from '../../features/map-navigation/useGeofenceTrigger';
import { useMapNavigationStore } from '../../features/map-navigation/model';

export function MapPage() {
  const { data: markers = [] } = useLocationMarkers();
  const { location } = useLocationTracker();
  const { activeMarkerId } = useMapNavigationStore();
  
  // Run geofence trigger logic
  useGeofenceTrigger();

  const handleMarkerPress = (marker: any) => {
    console.log('Marker pressed:', marker.title);
  };

  return (
    <View className="flex-1">
      <MapViewWidget 
        markers={markers}
        userLocation={location}
        onMarkerPress={handleMarkerPress}
        activeMarkerId={activeMarkerId}
      />
      <AIChatWidget />
    </View>
  );
}
