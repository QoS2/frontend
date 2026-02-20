import React from 'react';
import { View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Text } from '@shared/ui/Text';
import { useGuideContent } from '@entities/guide';
import { useTextStream } from '@shared/lib/hooks/useTextStream';
import { GuidePlayer } from '@widgets/guide-player';

interface StepDetailPageProps {
  id: string;
  onBack: () => void;
}

export function StepDetailPage({ id, onBack }: StepDetailPageProps) {
  const { data: content, isLoading, isError, error } = useGuideContent(id);

  const { displayedText, currentIndex, isComplete, skip } = useTextStream({
    text: (content as any)?.script ?? '',
    speed: 30,
    autoStart: !!content,
  });

  if (isError) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-4">
        <Text className="text-red-500 text-lg font-bold mb-2">Error Loading Guide</Text>
        <Text className="text-gray-500 mb-4 text-center">{error?.message}</Text>
        <Pressable 
          onPress={onBack}
          className="mt-6 bg-gray-200 px-6 py-3 rounded-xl active:opacity-70"
        >
          <Text className="font-bold text-gray-700">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-4">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-4 text-gray-500">Loading guide...</Text>
      </View>
    );
  }

  if (!content) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-4">
        <Text className="text-red-500 text-lg font-bold mb-2">Guide Not Found</Text>
        <Pressable 
          onPress={onBack}
          className="mt-6 bg-gray-200 px-6 py-3 rounded-xl active:opacity-70"
        >
          <Text className="font-bold text-gray-700">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="p-4 flex-row items-center border-b border-gray-100">
        <Pressable onPress={onBack} className="mr-4 active:opacity-70">
          <Text className="text-blue-500 font-bold">Back</Text>
        </Pressable>
        <Text className="text-xl font-bold" numberOfLines={1}>{content.stepTitle}</Text>
      </View>

      <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="mb-4">
          <GuidePlayer content={content as any} currentIndex={currentIndex} />
        </View>

        <Pressable
          onPress={skip}
          className="mt-6 p-4 bg-gray-50 rounded-2xl min-h-[150px] active:opacity-70"
        >
          <Text className="text-lg leading-7 text-gray-800">{displayedText}</Text>
        </Pressable>

        {isComplete && (
          <View className="mt-8">
            <Text className="text-lg font-bold mb-4">Reading Completed!</Text>
            <Pressable
              className="bg-gray-200 p-4 rounded-xl items-center"
              onPress={onBack}
            >
              <Text className="text-gray-600 font-bold text-lg">Back to List</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
