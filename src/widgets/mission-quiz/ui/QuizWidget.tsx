import React, { useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { Text } from '@shared/ui';
import { MissionStep } from '@shared/api/mission.contracts';
import { CheckCircle2, Circle } from 'lucide-react-native';

interface QuizWidgetProps {
    mission: MissionStep;
    onAnswer: (answer: string) => void;
    isSubmitting: boolean;
}

export function QuizWidget({ mission, onAnswer, isSubmitting }: QuizWidgetProps) {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    const handleSelect = (optionId: string) => {
        setSelectedOption(optionId);
    };

    const handleSubmit = () => {
        if (selectedOption) {
            onAnswer(selectedOption);
        }
    };

    if (!mission.optionsJson?.choices) return null;

    return (
        <View className="flex-1 bg-white p-6">
            <View className="mb-8">
                <Text className="text-2xl font-bold mb-2 text-gray-900">{mission.title}</Text>
                
                <View className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                     <Text className="text-lg font-medium text-blue-900 leading-7">
                        Q. {mission.prompt}
                     </Text>
                </View>
            </View>

            <ScrollView className="flex-1 mb-8" showsVerticalScrollIndicator={false}>
                <View className="gap-3">
                    {mission.optionsJson.choices.map((option) => {
                        const isSelected = selectedOption === option.id;
                        return (
                            <Pressable
                                key={option.id}
                                onPress={() => handleSelect(option.id)}
                                disabled={isSubmitting}
                                className={`
                                    flex-row items-center p-4 rounded-xl border-2
                                    ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}
                                    active:opacity-80
                                `}
                            >
                                {isSelected ? (
                                    <CheckCircle2 size={24} color="#2563EB" /> // blue-600
                                ) : (
                                    <Circle size={24} color="#D1D5DB" /> // gray-300
                                )}
                                <Text className={`ml-3 text-lg ${isSelected ? 'text-blue-900 font-medium' : 'text-gray-700'}`}>
                                    {option.text}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            </ScrollView>

            <Pressable
                onPress={handleSubmit}
                disabled={!selectedOption || isSubmitting}
                className={`
                    w-full py-4 rounded-xl items-center shadow-lg
                    ${!selectedOption || isSubmitting ? 'bg-gray-300' : 'bg-blue-600'}
                `}
            >
                <Text className="text-white font-bold text-lg">
                    {isSubmitting ? 'Checking...' : 'Submit Answer'}
                </Text>
            </Pressable>
        </View>
    );
}
