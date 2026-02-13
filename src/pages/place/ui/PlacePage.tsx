import React from 'react';
import { CollectionViewWidget } from '@widgets/collection-view';

const MOCK_ITEMS = [
  { id: '1', title: 'Gwanghwamun', subtitle: 'Historical Landmark', imageUrl: 'https://placehold.co/400x400/png' },
  { id: '2', title: 'Gyeongbokgung', subtitle: 'Royal Palace', imageUrl: 'https://placehold.co/400x400/png' },
  { id: '3', title: 'N Seoul Tower', subtitle: 'City View', imageUrl: 'https://placehold.co/400x400/png' },
  { id: '4', title: 'Bukchon Hanok', subtitle: 'Traditional Village', imageUrl: 'https://placehold.co/400x400/png' },
];

export function PlacePage() {
  return (
    <CollectionViewWidget
      title="Place Collection"
      items={MOCK_ITEMS}
    />
  );
}
