import React from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { Camera } from 'lucide-react-native';
import { CollectionViewWidget } from '@widgets/collection-view';
import { usePhotoSpots } from '@entities/collection/model';
import { useTourStore } from '@entities/tour/store';
import { useRoute } from '@react-navigation/native';
import { Text } from '@shared/ui';

export function PhotoSpotPage() {
  const activeTourId = useTourStore((state) => state.activeTourId);
  const { data: photoData, isLoading, isError } = usePhotoSpots(activeTourId ?? undefined);
  const route = useRoute<any>();
  const itemId = route.params?.itemId;

  const photoItems = React.useMemo(() => (photoData || [])
    .map((m) => ({
      id: m.spotId,
      title: m.title,
      subtitle: 'Photo Spot',
      imageUrl: m.thumbnailUrl || 'https://placehold.co/400x400/png',
      message: m.description || '',
      collected: m.collected,
    })), [photoData]);

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
        <Text className="text-gray-400 text-center">Failed to load photo spots. Please try again later.</Text>
      </View>
    );
  }

  return (
    <CollectionViewWidget
      title="Photo Gallery"
      items={photoItems}
      emptyMessage="No captured photos yet."
      initialItemId={itemId}
      renderHeaderRight={() => (
        <Pressable className="bg-black/5 p-2 rounded-full active:opacity-70">
           <Camera size={20} color="#333" />
        </Pressable>
      )}
    />
  );
}
