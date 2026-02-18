import React, { useState } from 'react';
import { Text } from '@shared/ui/Text';
import { QuestPlay } from '@features/quest-play';
import { Quest } from '@shared/api/contracts';
import { useUserProgress } from '@entities/user';

import { View, Pressable, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface QuestBoardProps {
  quests: Quest[];
  onComplete?: () => void;
  onClose?: () => void;
}

export function QuestBoard({ quests, onComplete, onClose }: QuestBoardProps) {
  const router = useRouter();
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
      <ScrollView>
        {isCompleted ? (
          <View className="p-8 bg-green-50 rounded-2xl items-center">
            <Text className="text-green-700 font-bold text-lg">Quest Completed!</Text>
          </View>
        ) : (
          <QuestPlay quest={currentQuest} onComplete={handleComplete} onClose={onClose} />
        )}
      </ScrollView>
    </View>
  );
}
