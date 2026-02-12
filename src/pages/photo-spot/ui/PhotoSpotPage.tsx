import React from 'react';
import { CommonCollectionLayout } from '@shared/ui/CommonCollectionLayout';
import { useNavigationContainerRef } from '@react-navigation/native';
import { BottomSheetStackParamList } from '@features/bottom-sheet/BottomSheetNavigator';
import { View, Pressable } from 'react-native';
import { Camera } from 'lucide-react-native';

const MOCK_PHOTOS = [
  {
    id: 'p1',
    title: 'Selfie at Place 1',
    subtitle: '2024.02.12',
    imageUrl: 'https://placehold.co/400x400/png?text=Photo+1',
  },
  {
    id: 'p2',
    title: 'Group Photo',
    subtitle: '2024.02.11',
    imageUrl: 'https://placehold.co/400x400/png?text=Photo+2',
  },
];

export function PhotoSpotPage() {
  const customNavigation = useNavigationContainerRef<BottomSheetStackParamList>();

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
        case 'treasure':
            customNavigation.navigate('Treasure');
            break;
        case 'photo':
            // Already here
            break;
    }
  };

  const renderCameraLauncher = () => (
    <Pressable 
      onPress={() => {
        // TODO: Navigate to Camera Logic or Open Modal
        console.log('Open Camera');
      }}
      className="bg-black p-2 rounded-full active:opacity-70"
    >
      <Camera size={20} color="white" />
    </Pressable>
  );

  return (
    <CommonCollectionLayout
      title="Photo Collection"
      items={MOCK_PHOTOS}
      renderHeaderRight={renderCameraLauncher}
    />
  );
}
