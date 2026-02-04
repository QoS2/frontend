import React from 'react';
import { View } from 'react-native';
import { NaverMapView, NaverMapMarkerOverlay, NaverMapCircleOverlay } from '@mj-studio/react-native-naver-map';
import { LocationMarker } from '../../shared/api/contracts';

interface MapViewWidgetProps {
  markers: LocationMarker[];
  onMarkerPress: (marker: LocationMarker) => void;
  userLocation: { latitude: number; longitude: number } | null;
  activeMarkerId?: string | null;
}

export function MapViewWidget({ markers, onMarkerPress, userLocation, activeMarkerId }: MapViewWidgetProps) {
  return (
    <View className="flex-1">
      <NaverMapView
        style={{ flex: 1 }}
        initialCamera={{
          latitude: 37.5759,
          longitude: 126.9768,
          zoom: 15,
        }}
        isShowLocationButton={true}
      >
        {markers.map((marker) => (
          <React.Fragment key={marker.id}>
            <NaverMapMarkerOverlay
              latitude={marker.coordinate.latitude}
              longitude={marker.coordinate.longitude}
              caption={{ text: marker.title }}
              onTap={() => onMarkerPress(marker)}
            />
            {activeMarkerId === marker.id && (
              <NaverMapCircleOverlay
                latitude={marker.coordinate.latitude}
                longitude={marker.coordinate.longitude}
                radius={marker.radius}
                color={'rgba(0, 122, 255, 0.3)'}
                outlineColor={'#007AFF'}
                outlineWidth={2}
              />
            )}
          </React.Fragment>
        ))}
      </NaverMapView>
    </View>
  );
}
