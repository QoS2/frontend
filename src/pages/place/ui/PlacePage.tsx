import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { CollectionViewWidget } from '@widgets/collection-view';
import { usePlaceCollection } from '@entities/collection/model';
import { useTourStore } from '@entities/tour/store';
import { useRoute } from '@react-navigation/native';
import { useLocationMarkers } from '@entities/location';
import { Text } from '@shared/ui';

export function PlacePage() {
  const activeTourId = useTourStore((state) => state.activeTourId);
  const { data: placeData, isLoading, isError } = usePlaceCollection(activeTourId ?? undefined);
  const { data: markers = [] } = useLocationMarkers();
  const route = useRoute<any>();
  const itemId = route.params?.itemId;
  
  // Convert collection data to view items
  // Hook call is kept at the top to satisfy React rules
  const placeItems = React.useMemo(() => (placeData?.items || [])
    .map((m) => ({
      id: m.spotId,
      title: m.title,
      subtitle: m.type === 'MAIN' ? 'Main Spot' : 'Discovery Spot',
      imageUrl: m.thumbnailUrl || 'https://placehold.co/400x400/png',
      message: m.description || '',
      collected: m.collected,
    })), [placeData]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 px-6">
        <Text className="text-gray-400 text-center">Failed to load places. Please try again later.</Text>
      </View>
    );
  }

  return (
    <CollectionViewWidget
      title="Place Collection"
      items={placeItems}
      emptyMessage="No collected places yet."
      initialItemId={itemId}
    />
  );
}
