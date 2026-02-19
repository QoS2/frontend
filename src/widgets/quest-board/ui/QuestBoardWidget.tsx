import React, { useState } from 'react';
import { QuestPlay } from '@features/quest-play';
import { Quest } from '@shared/api/contracts';
import { useUserProgress } from '@entities/user';

import { View } from 'react-native';

interface QuestBoardProps {
  quests: Quest[];
  onClose?: () => void;
}

export function QuestBoard({ quests, onClose }: QuestBoardProps) {
  const { completeQuest, completedQuestIds } = useUserProgress();
  const [activeQuestIndex] = useState(0);

  const currentQuest = quests[activeQuestIndex];
  const isCompleted = currentQuest ? completedQuestIds.includes(currentQuest.id) : false;

  const handleComplete = () => {
    if (currentQuest) {
      completeQuest(currentQuest.id);
    }
  };

  if (!currentQuest) return null;

  return (
    <View className="flex-1 bg-white">
      <QuestPlay 
        quest={currentQuest} 
        onComplete={handleComplete} 
        onClose={onClose} 
        isCompleted={isCompleted}
      />
    </View>
  );
}
