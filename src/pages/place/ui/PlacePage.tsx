import React from 'react';
import { CommonCollectionLayout } from '@shared/ui/CommonCollectionLayout';
import { useNavigationContainerRef } from '@react-navigation/native';
import { BottomSheetStackParamList } from '@features/bottom-sheet/BottomSheetNavigator';

const MOCK_PLACES = [
  {
    id: '1',
    title: 'Gwanghwamun',
    subtitle: 'Place 001',
    imageUrl: 'https://placehold.co/400x400/png?text=Gwanghwamun',
    audioUrl: 'mock_audio.mp3',
  },
  {
    id: '2',
    title: 'N Seoul Tower',
    subtitle: 'Place 002',
    imageUrl: 'https://placehold.co/400x400/png?text=N+Tower',
    audioUrl: 'mock_audio.mp3',
  },
  {
    id: '3',
    title: 'Bukchon Hanok',
    subtitle: 'Place 003',
    imageUrl: 'https://placehold.co/400x400/png?text=Hanok',
    audioUrl: 'mock_audio.mp3',
  },
  {
    id: '4',
    title: 'Dongdaemun DDP',
    subtitle: 'Place 004',
    imageUrl: 'https://placehold.co/400x400/png?text=DDP',
  }
];

export function PlacePage() {
  const customNavigation = useNavigationContainerRef<BottomSheetStackParamList>();

  const handleTabPress = (tabId: string) => {
    switch (tabId) {
        case 'guide-list':
            customNavigation.navigate('GuideList');
            break;
        case 'ai-tour-guide':
            customNavigation.navigate('Chat');
            break;
        case 'treasure':
            customNavigation.navigate('Treasure');
            break;
        case 'photo':
            customNavigation.navigate('Photo');
            break;
        case 'place':
            // Already here
            break;
    }
  };

  return (
    <CommonCollectionLayout
      title="Place Collection"
      items={MOCK_PLACES}
    />
  );
}
