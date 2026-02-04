import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from '../../../shared/ui/Text';
import { useGuideContent } from '../../../entities/guide/model';
import { useTextStream } from '../../../shared/lib/hooks/useTextStream';
import { GuidePlayer } from '../../../widgets/guide-player';
import { QuestBoard } from '../../../widgets/quest-board';

export function StepDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: content, isLoading } = useGuideContent(id);
  const [showQuests, setShowQuests] = useState(false);

  const { displayedText, currentIndex, isComplete, skip } = useTextStream({
    text: content?.script ?? '',
    speed: 30,
    autoStart: !!content,
  });

  if (isLoading || !content) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text>Loading guide...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="p-4 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Text className="text-blue-500 font-bold">Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold">Touring Gwanghwamun</Text>
      </View>

      <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 100 }}>
        <GuidePlayer content={content} currentIndex={currentIndex} />

        <TouchableOpacity
          activeOpacity={1}
          onPress={skip}
          className="mt-6 p-4 bg-gray-50 rounded-2xl min-h-[150px]"
        >
          <Text className="text-lg leading-7 text-gray-800">{displayedText}</Text>
        </TouchableOpacity>

        {isComplete && !showQuests && (
          <View className="mt-8">
            <Text className="text-lg font-bold mb-4">Ready for missions?</Text>
            <TouchableOpacity
              className="bg-blue-600 p-4 rounded-xl items-center"
              onPress={() => setShowQuests(true)}
            >
              <Text className="text-white font-bold text-lg">Start Quest</Text>
            </TouchableOpacity>
          </View>
        )}

        {showQuests && <QuestBoard quests={content.quests} />}
      </ScrollView>
    </View>
  );
}
