import React, { useMemo } from 'react';
import { useNavigationContainerRef } from '@react-navigation/native';
import { CommonCollectionLayout } from '@shared/ui/CommonCollectionLayout';
import { useUserProgress } from '@entities/user';
import { useLocationMarkers } from '@entities/location';
import { BottomSheetStackParamList } from '@features/bottom-sheet/BottomSheetNavigator';

export function CollectionPage() {
  const { completedQuestIds, visitedPlaceIds } = useUserProgress();
  const { data: markers } = useLocationMarkers();
  const customNavigation = useNavigationContainerRef<BottomSheetStackParamList>();

  const collectedItems = useMemo(() => {
    if (!markers) return [];
    
    // Filter for collected items (quests or places)
    const filtered = markers.filter(
      (m) => visitedPlaceIds.includes(m.id) || completedQuestIds.includes(m.id)
    );

    // Map to CollectionItem format
    return filtered.map(item => ({
      id: item.id,
      title: item.title,
      subtitle: item.type === 'TREASURE' ? 'Quest Reward' : 'Visited Place',
      imageUrl: item.thumbnailUrl || 'https://placehold.co/400x400/png?text=Treasure',
      audioUrl: undefined // Treasures might not have audio yet
    }));
  }, [markers, visitedPlaceIds, completedQuestIds]);

  const handleTabPress = (tabId: string) => {
    switch (tabId) {
        case 'guide-list':
            customNavigation.navigate('GuideList');
            break;
        case 'ai-tour-guide':
            customNavigation.navigate('Chat');
            break;
        case 'place':
            customNavigation.navigate('Place');
            break;
        case 'photo':
            customNavigation.navigate('Photo');
            break;
        case 'treasure':
            // Already here
            break;
    }
  };

  return (
    <CommonCollectionLayout
      title="My Treasures"
      items={collectedItems}
    />
  );
}
