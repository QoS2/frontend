import React from 'react';
import { Pressable, View } from 'react-native';
import { Camera } from 'lucide-react-native';
import { CollectionViewWidget } from '@widgets/collection-view';

const MOCK_PHOTOS = [
  { id: '1', title: 'Gwanghwamun Gate', subtitle: '2023.10.15', imageUrl: 'https://placehold.co/400x400/png' },
  { id: '2', title: 'Secret Garden', subtitle: '2023.10.16', imageUrl: 'https://placehold.co/400x400/png' },
];

export function PhotoSpotPage() {
  return (
    <CollectionViewWidget
      title="Photo Gallery"
      items={MOCK_PHOTOS}
      renderHeaderRight={() => (
        <Pressable className="bg-black/5 p-2 rounded-full active:opacity-70">
           <Camera size={20} color="#333" />
        </Pressable>
      )}
    />
  );
}
