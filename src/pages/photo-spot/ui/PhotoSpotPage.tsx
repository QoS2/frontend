import React from 'react';
import { Pressable } from 'react-native';
import { Camera } from 'lucide-react-native';
import { CollectionViewWidget } from '@widgets/collection-view';
import { useLocationMarkers } from '@entities/location';

export function PhotoSpotPage() {
  const { data: markers = [] } = useLocationMarkers();

  const photoItems = markers
    .filter((m) => m.type === 'PHOTO')
    .map((m) => ({
      id: m.id,
      title: m.title,
      subtitle: 'Photo Spot',
      imageUrl: m.thumbnailUrl || 'https://placehold.co/400x400/png',
    }));

  return (
    <CollectionViewWidget
      title="Photo Gallery"
      items={photoItems}
      renderHeaderRight={() => (
        <Pressable className="bg-black/5 p-2 rounded-full active:opacity-70">
           <Camera size={20} color="#333" />
        </Pressable>
      )}
    />
  );
}
