import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { Text } from '@shared/ui/Text';
import { GuideContent } from '@shared/api/contracts';

interface GuidePlayerProps {
  content: GuideContent;
  currentIndex: number;
}

export function GuidePlayer({ content, currentIndex }: GuidePlayerProps) {
  const currentMedia = useMemo(() => {
    // Filter for MEDIA events and sort by triggerIndex descending
    const mediaEvents = content.events
      .filter((e) => e.type === 'MEDIA')
      .sort((a, b) => b.triggerIndex - a.triggerIndex);
    
    const latestEvent = mediaEvents.find((evt) => currentIndex >= evt.triggerIndex);
    return latestEvent?.data;
  }, [content.events, currentIndex]);

  if (!currentMedia) {
    return <View className="w-full aspect-video bg-gray-200 rounded-xl" />;
  }

  return (
    <View className="w-full aspect-video bg-black rounded-xl overflow-hidden">
      {currentMedia.type === 'IMAGE' ? (
        <Image
          source={{ uri: currentMedia.mediaUrl }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={500}
        />
      ) : (
        // For video, we'd use expo-av, but for now placeholder or simplified
        <View className="flex-1 justify-center items-center">
          <Text className="text-white">Video Player: {currentMedia.mediaUrl}</Text>
        </View>
      )}
    </View>
  );
}
