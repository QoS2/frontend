import React from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { Text } from '@shared/ui';
import { CollectionViewWidget } from '@widgets/collection-view';
import { useTreasureCollection, useCollectTreasure } from '@entities/collection/model';
import { useTourStore } from '@entities/tour/store';
import { useTourDetail } from '@entities/tour/model';
import { useRoute } from '@react-navigation/native';
import { useLocationMarkers } from '@entities/location';

export function CollectionPage() {
  const activeTourId = useTourStore((state) => state.activeTourId);
  const { data: treasureData, isLoading, isError } = useTreasureCollection(activeTourId ?? undefined);
  const { data: tourDetail } = useTourDetail(activeTourId ?? 0);
  const runId = tourDetail?.currentRun?.runId;
  const { data: markers = [] } = useLocationMarkers();
  const route = useRoute<any>();
  const itemId = route.params?.itemId;
  const { mutate: collectTreasure, isPending: isCollecting } = useCollectTreasure();
  
  // Convert treasures into collection items, merging with markers for description if needed
  // CRITICAL: Hook must be called before conditional returns
  const collectionItems = React.useMemo(() => {
    return (treasureData?.items || []).map(item => {
        const marker = markers.find(m => m.id === item.spotId.toString());
        return {
            id: item.spotId,
            title: item.title,
            subtitle: item.description || 'Treasure',
            imageUrl: item.thumbnailUrl || 'https://placehold.co/400x400/png',
            message: marker?.description || item.description || '',
            collected: item.collected,
        };
    });
  }, [treasureData, markers]);

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
        <Text className="text-gray-400 text-center">Failed to load treasures. Please try again later.</Text>
      </View>
    );
  }

  const handleCollect = (id: string | number) => {
    if (!runId) {
      Alert.alert('오류', '투어 정보를 찾을 수 없습니다.');
      return;
    }
    collectTreasure(
      { runId, spotId: Number(id) },
      {
        onSuccess: () => Alert.alert('🎉 수집 완료!', '보물을 획득했습니다!'),
        onError: () => Alert.alert('오류', '보물 수집에 실패했습니다. 다시 시도해주세요.'),
      }
    );
  };

  return (
    <CollectionViewWidget
      title="My Treasures"
      items={collectionItems}
      emptyMessage="No collected treasures yet."
      initialItemId={itemId}
      onCollect={handleCollect}
    />
  );
}
