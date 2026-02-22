import React from 'react';
import { View } from 'react-native';
import { Text } from '@shared/ui';
import { CollectionViewWidget } from '@widgets/collection-view';
import { useTreasureCollection } from '@entities/collection/model';
import { useUserProgress } from '@entities/user';
import { useRoute } from '@react-navigation/native';
import { useLocationMarkers } from '@entities/location';

export function CollectionPage() {
  const { data: treasureData } = useTreasureCollection();
  const { data: markers = [] } = useLocationMarkers();
  const { visitedPlaceIds } = useUserProgress();
  const route = useRoute<any>();
  const itemId = route.params?.itemId;
  
  // Convert treasures into collection items, merging with markers for description if needed
  const collectionItems = React.useMemo(() => {
    return (treasureData?.items || []).map(item => {
        const marker = markers.find(m => m.id === item.spotId.toString());
        return {
            id: item.spotId,
            title: item.title,
            subtitle: item.description,
            imageUrl: item.thumbnailUrl || 'https://placehold.co/400x400/png',
            message: marker?.description || item.description,
            collected: item.collected,
        };
    });
  }, [treasureData, markers]);

  const handleCollect = (id: string | number) => {
    console.log(`[Collect Treasure] ${id}`);
    // TODO: Call API to collect treasure
  };

  return (
    <CollectionViewWidget
      title="My Treasures"
      items={collectionItems}
      initialItemId={itemId}
      onCollect={handleCollect}
    />
  );
}
