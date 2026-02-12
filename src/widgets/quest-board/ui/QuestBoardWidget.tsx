import React, { useState } from 'react';
import { View } from 'react-native';
import { Text } from '@shared/ui/Text';
import { QuestPlay } from '@features/quest-play';
import { Quest } from '@shared/api/contracts';
import { useUserProgress } from '@entities/user';

import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { X } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface QuestBoardProps {
  quests: Quest[];
  onComplete?: () => void;
}

export function QuestBoard({ quests, onComplete }: QuestBoardProps) {
  const navigation = useNavigation();
  const { completeQuest, completedQuestIds } = useUserProgress();
  const [activeQuestIndex] = useState(0);

  const currentQuest = quests[activeQuestIndex];
  const isCompleted = currentQuest ? completedQuestIds.includes(currentQuest.id) : false;

  const handleComplete = (reward: number) => {
    if (currentQuest) {
      completeQuest(currentQuest.id, reward);
    }
  };

  if (!currentQuest) return null;

  return (
    <View className="flex-1 bg-white">
      {/* Header with Close Button */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <Text className="text-lg font-bold">Mission Board</Text>
        <TouchableOpacity onPress={onComplete ? onComplete : () => navigation.goBack()} className="p-2">
          <X size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <BottomSheetScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-xl font-bold mb-4">
          Quest {activeQuestIndex + 1}/{quests.length}
        </Text>
        {isCompleted ? (
          <View className="p-8 bg-green-50 rounded-2xl items-center">
            <Text className="text-green-700 font-bold text-lg">Quest Completed!</Text>
          </View>
        ) : (
          <QuestPlay quest={currentQuest} onComplete={handleComplete} />
        )}
      </BottomSheetScrollView>
    </View>
  );
}
