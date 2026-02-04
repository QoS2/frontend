import React from 'react';
import { View } from 'react-native';
import { NaverMapView, NaverMapMarker } from '@mj-studio/react-native-naver-map';
import { LocationMarker } from '../../shared/api/contracts';

interface MapViewWidgetProps {
  markers: LocationMarker[];
  onMarkerPress: (marker: LocationMarker) => void;
  userLocation: { latitude: number; longitude: number } | null;
}

export function MapViewWidget({ markers, onMarkerPress, userLocation }: MapViewWidgetProps) {
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
          <NaverMapMarker
            key={marker.id}
            latitude={marker.coordinate.latitude}
            longitude={marker.coordinate.longitude}
            caption={{ text: marker.title }}
            onTap={() => onMarkerPress(marker)}
          />
        ))}
      </NaverMapView>
    </View>
  );
}
