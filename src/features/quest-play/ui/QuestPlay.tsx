import React, { useState } from 'react';
import { View, TouchableOpacity, TextInput } from 'react-native';
import { Text } from '../../../shared/ui/Text';
import { Quest } from '../../../shared/api/contracts';

interface QuestPlayProps {
  quest: Quest;
  onComplete: (reward: number) => void;
}

export function QuestPlay({ quest, onComplete }: QuestPlayProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleCheck = () => {
    let correct = false;
    if (quest.type === 'MULTIPLE_CHOICE' || quest.type === 'SELECT_IMAGE') {
      correct = selectedOption === quest.answer;
    } else if (quest.type === 'FILL_BLANKS') {
      correct = inputText.trim().toLowerCase() === quest.answer.toLowerCase();
    }

    setIsCorrect(correct);
    if (correct) {
      setTimeout(() => onComplete(quest.rewardMint), 1000);
    }
  };

  return (
    <View className="p-4 bg-white rounded-2xl shadow-sm">
      <Text className="text-lg font-bold mb-4">{quest.question}</Text>

      {quest.type === 'MULTIPLE_CHOICE' && (
        <View className="space-y-2">
          {quest.options.map((option) => (
            <TouchableOpacity
              key={option}
              onPress={() => setSelectedOption(option)}
              className={`p-3 rounded-xl border ${
                selectedOption === option ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <Text>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {quest.type === 'FILL_BLANKS' && (
        <TextInput
          className="border border-gray-200 p-3 rounded-xl"
          placeholder="Type your answer here..."
          value={inputText}
          onChangeText={setInputText}
        />
      )}

      <TouchableOpacity
        onPress={handleCheck}
        className="mt-6 bg-blue-600 p-4 rounded-xl items-center"
      >
        <Text className="text-white font-bold">Check Answer</Text>
      </TouchableOpacity>

      {isCorrect === true && (
        <Text className="mt-4 text-green-600 font-bold text-center">
          Correct! +{quest.rewardMint} Mint
        </Text>
      )}
      {isCorrect === false && (
        <Text className="mt-4 text-red-600 font-bold text-center">Try again!</Text>
      )}
    </View>
  );
}
