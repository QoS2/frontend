import React from 'react';
import { View } from 'react-native';
import { Text } from '@shared/ui';
import { CollectionViewWidget } from '@widgets/collection-view';
import { useLocationMarkers } from '@entities/location';
import { useUserProgress } from '@entities/user';

export function CollectionPage() {
  const { data: markers = [] } = useLocationMarkers();
  const { visitedPlaceIds, completedQuestIds } = useUserProgress();
  
  // Convert activated markers/quests into collection items
  const collectionItems = React.useMemo(() => {
    return markers
      .filter(m => visitedPlaceIds.includes(m.id))
      .map(m => ({
        id: m.id,
        title: m.title,
        subtitle: m.type, // e.g., 'Historical', 'Cultural'
        imageUrl: 'https://placehold.co/400x400/png', // Placeholder for now
      }));
  }, [markers, visitedPlaceIds, completedQuestIds]);

  return (
    <CollectionViewWidget
      title="My Treasures"
      items={collectionItems}
    />
  );
}
