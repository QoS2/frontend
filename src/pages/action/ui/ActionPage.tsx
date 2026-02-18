import React, { useMemo } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { QuestBoard } from '@widgets/quest-board';
import { useGuideContent } from '@entities/guide';
import { Text } from '@shared/ui';

export function ActionPage() {
  const params = useLocalSearchParams();
  const type = params.type as string;
  const contentId = params.id as string;
  const questId = params.questId as string | undefined;
  const targetName = params.targetName as string | undefined;

  const router = useRouter();
  const { data: content, isLoading, isError } = useGuideContent(contentId);

  
  const handleComplete = () => {
    // Navigate back to chat
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/map'); // Fallback
    }
  };

  const renderContent = () => {
    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#0000ff" />
                <Text className="mt-4 text-gray-500">Loading Action...</Text>
            </View>
        );
    }

    if (isError || !content) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text className="text-red-500 mb-4">Failed to load content</Text>
                <Pressable onPress={() => router.back()} className="p-2 bg-gray-200 rounded">
                    <Text>Go Back</Text>
                </Pressable>
            </View>
        );
    }

    switch (type) {
      case 'QUEST': {
        const activeQuests = questId 
            ? content.quests?.filter(q => q.id === questId) 
            : [];
            
        if (!activeQuests || activeQuests.length === 0) {
             return (
                <View className="flex-1 justify-center items-center">
                    <Text>Quest not found: {questId}</Text>
                    <Pressable onPress={() => router.back()} className="mt-4 p-2 bg-gray-200 rounded">
                        <Text>Go Back</Text>
                    </Pressable>
                </View>
             );
        }

        return (
          <QuestBoard 
            quests={activeQuests} 
            onComplete={handleComplete}
            onClose={handleComplete}
          />
        );
      }
      case 'CAMERA':
        return (
           <View className="flex-1 justify-center items-center bg-black">
                <Text className="text-white text-xl mb-8 font-bold text-center px-4">
                  📸 Mission: Take a photo of{'\n'}{targetName || 'Photo Spot'}
                </Text>
                <View className="w-64 h-64 border-2 border-white/50 rounded-lg mb-8 items-center justify-center">
                  <Text className="text-white/50">Camera Preview Area</Text>
                </View>
                <Pressable 
                    onPress={handleComplete}
                    className="w-16 h-16 bg-white rounded-full items-center justify-center border-4 border-gray-300 active:opacity-70"
                >
                  <View className="w-12 h-12 bg-white rounded-full border border-black/10" />
                </Pressable>
                <Pressable 
                    onPress={() => router.back()}
                    className="absolute top-12 right-4 bg-black/50 p-2 rounded-full active:opacity-70"
                >
                    <Text className="text-white font-bold">Close</Text>
                </Pressable>
            </View>
        );
      case 'REWARD':
        return (
          <View className="flex-1 justify-center items-center bg-blue-50/30 p-8">
            <View className="bg-white p-8 rounded-3xl items-center shadow-xl border border-blue-100 w-full">
              <Text className="text-6xl mb-6">🎁</Text>
              <Text className="text-2xl font-bold mb-2">Victory!</Text>
              <Text className="text-gray-500 text-center mb-8">
                You have successfully completed the mission and earned a reward.
              </Text>
              <Pressable 
                onPress={handleComplete}
                className="w-full bg-blue-600 p-4 rounded-xl items-center active:opacity-80"
              >
                <Text className="text-white font-bold text-lg">Claim Reward</Text>
              </Pressable>
            </View>
          </View>
        );
      default:
        return (
          <View className="flex-1 justify-center items-center">
            <Text>Unknown Action Type: {type}</Text>
            <Pressable onPress={() => router.back()} className="mt-4 p-2 bg-gray-200 rounded">
              <Text>Go Back</Text>
            </Pressable>
          </View>
        );
    }
  };

  return (
    <View className="flex-1 bg-white">
      {renderContent()}
    </View>
  );
}
