import React from 'react';
import { CollectionViewWidget } from '@widgets/collection-view';
import { useLocationMarkers } from '@entities/location';

export function PlacePage() {
  const { data: markers = [] } = useLocationMarkers();
  
  const placeItems = markers
    .filter((m) => m.type === 'PLACE')
    .map((m) => ({
      id: m.id,
      title: m.title,
      subtitle: m.description?.substring(0, 30) || 'Historical Place',
      imageUrl: m.thumbnailUrl || 'https://placehold.co/400x400/png',
    }));

  return (
    <CollectionViewWidget
      title="Place Collection"
      items={placeItems}
    />
  );
}
