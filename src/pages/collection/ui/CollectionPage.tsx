import React from 'react';
import { View } from 'react-native';
import { Text } from '@shared/ui';
import { CollectionViewWidget } from '@widgets/collection-view';
import { useTreasureCollection } from '@entities/collection/model';
import { useUserProgress } from '@entities/user';

export function CollectionPage() {
  const { data: treasureData } = useTreasureCollection();
  const { visitedPlaceIds } = useUserProgress();
  
  // Convert treasures into collection items
  const collectionItems = React.useMemo(() => {
    return (treasureData?.items || []).map(item => ({
        id: item.spotId,
        title: item.title,
        subtitle: item.description,
        imageUrl: item.thumbnailUrl || undefined,
        // Since mock data IDs might not match visitedPlaceIds perfectly in this refactor, 
        // we might strictly need ID alignment. For now, we just map basic fields.
        // In real app, we check if item.id is in visitedPlaceIds or if 'acquiredAt' is present.
        // For treasures with 'acquiredAt', they are collected.
    }));
  }, [treasureData]);

  return (
    <CollectionViewWidget
      title="My Treasures"
      items={collectionItems}
    />
  );
}
