import React, { forwardRef, useState, useMemo } from 'react';
import { View } from 'react-native';
import {
  NaverMapView,
  NaverMapMarkerOverlay,
  NaverMapCircleOverlay,
} from '@mj-studio/react-native-naver-map';
import { LocationMarker } from '@shared/api/contracts';
import { getDistance } from '@shared/lib/geo';
import { PlaceIcon, SubPlaceIcon, PhotoIcon, TreasureIcon } from '@shared/assets/icons';
import { PlaceNumberMarker } from '@shared/ui';

interface MapViewWidgetProps {
  markers: LocationMarker[];
  onMarkerPress: (marker: LocationMarker) => void;
  userLocation: { latitude: number; longitude: number } | null;
  activeMarkerId?: string | null;
}

export const MapViewWidget = forwardRef<React.ElementRef<typeof NaverMapView>, MapViewWidgetProps>(
  ({ markers, onMarkerPress, userLocation, activeMarkerId }, ref) => {
  const [zoomLevel, setZoomLevel] = useState(18);

  const handleCameraChange = (e: any) => {
    setZoomLevel(e.zoom);
  };

  const visibleMarkers = useMemo(() => {
    return markers.filter((marker) => {
      if (zoomLevel < 15) {
        return marker.type === 'PLACE';
      } else if (zoomLevel < 17) {
        return marker.type === 'PLACE' || marker.type === 'SUB_PLACE';
      } else {
        return true; // Show all
      }
    });
  }, [markers, zoomLevel]);

  // Handle place numbering - only for main PLACES
  const placeOrderMap = useMemo(() => {
    const places = markers
      .filter((m) => m.type === 'PLACE')
      .sort((a, b) => {
        const idA = parseInt(a.id, 10);
        const idB = parseInt(b.id, 10);
        if (!isNaN(idA) && !isNaN(idB)) {
          return idA - idB;
        }
        return a.id.localeCompare(b.id);
      });

    const map: Record<string, number> = {};
    places.forEach((p, index) => {
      map[p.id] = index + 1;
    });
    return map;
  }, [markers]);

  /* Helper to get marker icon component based on type */
  const getMarkerIcon = (type: string) => {
    switch (type) {
      case 'PLACE':
        return PlaceIcon;
      case 'SUB_PLACE':
        return SubPlaceIcon;
      case 'PHOTO':
        return PhotoIcon;
      case 'TREASURE':
        return TreasureIcon;
      default:
        return PlaceIcon;
    }
  };

  /* Helper to get marker size based on type */
  const getMarkerSize = (type: string) => {
    switch (type) {
      case 'PLACE': return { width: 35, height: 35 };
      case 'SUB_PLACE': return { width: 25, height: 25 };
      case 'PHOTO': return { width: 25, height: 25 };
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
          zoom: 18,
        }}
        isShowLocationButton={false}
        isShowZoomControls={false}
        locale="en"
        maxZoom={18}
        minZoom={14}
        onCameraChanged={handleCameraChange}
        isShowCompass={false}
      >
        {visibleMarkers.map((marker) => {
          const Icon = getMarkerIcon(marker.type);
          const size = getMarkerSize(marker.type);

          /* Calculate distance to user */
          const distance = userLocation
           ? getDistance(
               userLocation.latitude,
               userLocation.longitude,
               marker.coordinate.latitude,
               marker.coordinate.longitude,
             )
           : Infinity;

          /* Show circle if active OR within 50m */
          const showCircle = activeMarkerId === marker.id || distance < 50;

          return (
            <React.Fragment key={marker.id}>
              {/* Marker Overlay */}
              <NaverMapMarkerOverlay
                latitude={marker.coordinate.latitude}
                longitude={marker.coordinate.longitude}
                caption={{ text: marker.title, textSize: 12 }}
                width={size.width}
                height={size.height}
                anchor={{ x: 0.5, y: 0.5 }}
                onTap={() => onMarkerPress(marker)}
              >
                {marker.type === 'PLACE' ? (
                  <PlaceNumberMarker
                    number={placeOrderMap[marker.id]}
                    width={size.width}
                    height={size.height}
                  />
                ) : (
                  <Icon width={size.width} height={size.height} />
                )}
              </NaverMapMarkerOverlay>
              
              {/* Circle Overlay */}
              {showCircle && (
                <NaverMapCircleOverlay
                  latitude={marker.coordinate.latitude}
                  longitude={marker.coordinate.longitude}
                  radius={marker.radius}
                  color={'rgba(0, 122, 255, 0.3)'}
                  outlineColor={'#007AFF'}
                />
              )}
            </React.Fragment>
          );
        })}
      </NaverMapView>
    </View>
  );
});
