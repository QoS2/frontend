import React, { useState } from 'react';
import { View } from 'react-native';
import { Text } from '@shared/ui/Text';
import { QuestPlay } from '@features/quest-play';
import { Quest } from '@shared/api/contracts';
import { useUserProgress } from '@entities/user';

interface QuestBoardProps {
  quests: Quest[];
}

export function QuestBoard({ quests }: QuestBoardProps) {
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
    <View className="mt-4">
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
    </View>
  );
}
