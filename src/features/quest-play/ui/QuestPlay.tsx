import React, { useState } from 'react';
import { View, Pressable, TextInput, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { ChevronLeft, Gamepad2, Check, HelpCircle } from 'lucide-react-native';
import { Image } from 'expo-image';
import { Text } from '@shared/ui/Text';
import { Quest } from '@shared/api/contracts';
import * as Haptics from 'expo-haptics';

interface QuestPlayProps {
  quest: Quest;
  onComplete: (reward: number) => void;
  onClose?: () => void;
  progressText?: string;
  locationName?: string;
}

export function QuestPlay({
  quest,
  onComplete,
  onClose,
  progressText = '1/1',
  locationName = 'Unknown Location',
}: QuestPlayProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);

  const handleCheck = async () => {
    let correct = false;
    if (quest.type === 'MULTIPLE_CHOICE' || quest.type === 'SELECT_IMAGE') {
      correct = selectedOption === quest.answer;
    } else if (quest.type === 'FILL_BLANKS') {
      correct = inputText.trim().toLowerCase() === quest.answer.toLowerCase();
    }

    setIsCorrect(correct);

    if (correct) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => onComplete(quest.rewardMint), 1500);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleToggleHint = () => {
    setShowHint(!showHint);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#FFF1EE]"
    >
      {/* 1. Header Area */}
      <View className="flex-row items-center px-4 py-3 mt-8">
        <Pressable onPress={onClose} className="p-2 active:opacity-70">
          <ChevronLeft size={28} color="#333" />
        </Pressable>
        
        <View className="flex-row gap-2 ml-2">
          {/* Location Tag */}
          <View className="bg-[#FFAB91] px-3 py-1.5 rounded-full">
            <Text className="text-white font-bold text-xs">
               {locationName}
            </Text>
          </View>
          
          {/* Progress Tag */}
          <View className="bg-white border border-gray-100 px-3 py-1.5 rounded-full flex-row items-center shadow-sm">
            <Gamepad2 size={14} color="#666" />
            <Text className="text-gray-600 font-bold text-xs ml-1">
              {progressText}
            </Text>
          </View>
        </View>
      </View>

      {/* 2. Scrollable Content Area */}
      <ScrollView 
        className="flex-1 px-5" 
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Chat Bubble Section */}
        <View className="flex-row items-start mt-4">
          {/* Avatar (AI) */}
          <View className="w-12 h-12 rounded-full mr-3 bg-white border border-gray-100 items-center justify-center shadow-sm overflow-hidden">
             <Image 
                source={{ uri: "https://placehold.co/100x100/png?text=AI" }} 
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
          </View>
          
          {/* Text Bubble */}
          <View className="flex-1 bg-white p-5 rounded-2xl rounded-tl-none shadow-sm border border-gray-50">
            <Text className="text-gray-800 text-sm leading-5 mb-3">
              {quest.question}
            </Text>

            {/* If there's a specific question image in the future, we could add it here */}
            {/* For now, we follow the UI mockup layout */}
          </View>
        </View>

        {/* 3. Game Type Specific UI */}
        <View className="mt-8">
          
          {/* MULTIPLE_CHOICE */}
          {quest.type === 'MULTIPLE_CHOICE' && (
            <View className="gap-3">
              {quest.options.map((option) => {
                const isSelected = selectedOption === option;
                return (
                  <Pressable
                    key={option}
                    onPress={() => {
                        setSelectedOption(option);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}

                    className={`flex-row items-center p-4 rounded-2xl border-2 bg-white active:opacity-70 ${
                      isSelected ? 'border-[#FFAB91] shadow-sm' : 'border-transparent'
                    }`}
                  >
                    <View className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${
                        isSelected ? 'bg-[#FFAB91] border-[#FFAB91]' : 'border-gray-200'
                    }`}>
                        {isSelected && <Check size={14} color="white" strokeWidth={4} />}
                    </View>
                    <Text className={`text-base font-bold flex-1 ${isSelected ? 'text-gray-900' : 'text-gray-400'}`}>
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* SELECT_IMAGE (1 out of 4) */}
          {quest.type === 'SELECT_IMAGE' && (
            <View className="flex-row flex-wrap gap-3">
              {quest.options.map((option) => {
                const isSelected = selectedOption === option;
                return (
                  <Pressable
                    key={option}
                    onPress={() => {
                        setSelectedOption(option);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={{ width: '47%' }}
                    className={`aspect-square rounded-2xl overflow-hidden border-4 bg-white active:opacity-70 ${
                      isSelected ? 'border-[#FFAB91]' : 'border-white shadow-sm'
                    }`}
                  >
                    <Image source={{ uri: option }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                    {isSelected && (
                        <View className="absolute inset-0 bg-black/20 items-center justify-center">
                            <View className="bg-[#FFAB91] rounded-full p-2">
                                <Check size={24} color="white" strokeWidth={3} />
                            </View>
                        </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* FILL_BLANKS */}
          {quest.type === 'FILL_BLANKS' && (
            <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50">
              <Text className="text-gray-400 font-bold mb-3 text-xs uppercase tracking-widest">Please enter the answer</Text>
              <TextInput
                className="text-xl font-bold text-gray-800 border-b-2 border-[#FFAB91]/30 pb-2"
                placeholder="Type your answer..."
                placeholderTextColor="#ddd"
                value={inputText}
                onChangeText={setInputText}
                autoCapitalize="none"
              />
              {showHint && quest.hint && (
                <View className="mt-4 p-3 bg-yellow-50 rounded-xl flex-row items-start">
                    <HelpCircle size={16} color="#EAB308" className="mr-2 mt-0.5" />
                    <Text className="text-yellow-800 text-sm flex-1">{quest.hint}</Text>
                </View>
              )}
            </View>
          )}

        </View>

        {/* Feedback Message */}
        {isCorrect !== null && (
            <View className={`mt-6 p-4 rounded-2xl items-center ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                <Text className={`font-bold text-base ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                    {isCorrect ? `✨ Correct! +${quest.rewardMint} Mint` : '❌ Try again! Check the hint.'}
                </Text>
            </View>
        )}
      </ScrollView>

      {/* 3. Fixed Bottom Footer */}
      <View className="bg-white rounded-t-[30px] p-6 shadow-xl border-t border-gray-50 pb-8">
        
        {/* Hint Button */}
        {quest.hint && (
            <Pressable 
                onPress={handleToggleHint}
                className="w-full py-4 rounded-xl border border-gray-100 items-center mb-3 bg-white active:opacity-70"
            >
                <Text className="text-gray-400 font-bold text-base">
                {showHint ? 'Hide Hint' : 'Need a hint?'}
                </Text>
            </Pressable>
        )}

        {/* Check Answer Button */}
        <Pressable 
            onPress={handleCheck}
            disabled={quest.type === 'FILL_BLANKS' ? !inputText.trim() : !selectedOption}
            className={`w-full py-4 rounded-xl items-center shadow-md active:opacity-70 ${
                (quest.type === 'FILL_BLANKS' ? inputText.trim() : selectedOption) 
                ? 'bg-[#FFAB91]' : 'bg-gray-200'
            }`}
        >
            <Text className="text-white font-extrabold text-base">Check Answer</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
