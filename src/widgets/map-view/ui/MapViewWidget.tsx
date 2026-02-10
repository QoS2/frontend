import React, { forwardRef, useState, useMemo } from 'react';
import { View } from 'react-native';
import {
  NaverMapView,
  NaverMapMarkerOverlay,
  NaverMapCircleOverlay,
} from '@mj-studio/react-native-naver-map';
import { LocationMarker } from '@shared/api/contracts';

interface MapViewWidgetProps {
  markers: LocationMarker[];
  onMarkerPress: (marker: LocationMarker) => void;
  userLocation: { latitude: number; longitude: number } | null;
  activeMarkerId?: string | null;
}

export const MapViewWidget = forwardRef<React.ElementRef<typeof NaverMapView>, MapViewWidgetProps>(
  ({ markers, onMarkerPress, userLocation, activeMarkerId }, ref) => {
  const [zoomLevel, setZoomLevel] = useState(15);

  const handleCameraChange = (e: any) => {
    setZoomLevel(e.zoom);
  };

  const visibleMarkers = useMemo(() => {
    return markers.filter((marker) => {
      if (zoomLevel < 15) {
        return marker.type === 'PLACE';
      } else if (zoomLevel < 17) {
        return marker.type === 'PLACE' || marker.type === 'SUB_PLACE' || marker.type === 'PHOTO';
      } else {
        return true; // Show all
      }
    });
  }, [markers, zoomLevel]);

  /* Helper to get marker image based on type */
  const getMarkerImage = (type: string) => {
    switch (type) {
      case 'PLACE':
        return require('../../../../assets/icons/place.png');
      case 'SUB_PLACE':
        return require('../../../../assets/icons/sub-place.png');
      case 'PHOTO':
        return require('../../../../assets/icons/photo.png');
      case 'TREASURE':
        return require('../../../../assets/icons/treasure.png');
      default:
        return require('../../../../assets/icons/place.png');
    }
  };

  /* Helper to get marker size based on type */
  const getMarkerSize = (type: string) => {
    switch (type) {
      case 'PLACE': return { width: 40, height: 40 };
      case 'SUB_PLACE': return { width: 30, height: 30 };
      case 'PHOTO': return { width: 30, height: 30 };
      case 'TREASURE': return { width: 25, height: 25 };
      default: return { width: 30, height: 30 };
    }
  };

  return (
    <View className="flex-1">
      <NaverMapView
        ref={ref}
        style={{ width: '100%', height: '100%' }}
        initialCamera={{
          latitude: 37.5759,
          longitude: 126.9768,
          zoom: 15,
        }}
        isShowLocationButton={false}
        isShowZoomControls={false}
        onCameraChanged={handleCameraChange}
      >
        {visibleMarkers.map((marker) => {
          const image = getMarkerImage(marker.type);
          const size = getMarkerSize(marker.type);
          
          return (
            <React.Fragment key={marker.id}>
              <NaverMapMarkerOverlay
                latitude={marker.coordinate.latitude}
                longitude={marker.coordinate.longitude}
                caption={{ text: marker.title, textSize: 12 }}
                image={image}
                width={size.width}
                height={size.height}
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
          );
        })}
        </NaverMapView>
      </View>
    );
  },
);
