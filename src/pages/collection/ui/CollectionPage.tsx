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
      .filter(m => m.type === 'TREASURE')
      .map(m => ({
        id: m.id,
        title: m.title,
        subtitle: visitedPlaceIds.includes(m.id) ? 'Collected' : 'Not Collected',
        imageUrl: m.thumbnailUrl || 'https://placehold.co/400x400/png', 
      }));
  }, [markers, visitedPlaceIds]);

  return (
    <CollectionViewWidget
      title="My Treasures"
      items={collectionItems}
    />
  );
}
