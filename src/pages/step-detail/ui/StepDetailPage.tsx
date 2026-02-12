import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from '@shared/ui/Text';
import { useGuideContent } from '@entities/guide';
import { useTextStream } from '@shared/lib/hooks/useTextStream';
import { GuidePlayer } from '@widgets/guide-player';
import { QuestBoard } from '@widgets/quest-board';

export function StepDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: content, isLoading, isError, error } = useGuideContent(id);
  const [activeInteraction, setActiveInteraction] = useState<any>(null); // GuideEvent | null

  const { displayedText, currentIndex, isComplete, skip } = useTextStream({
    text: content?.script ?? '',
    speed: 30,
    autoStart: !!content,
  });

  const [handledEventIds, setHandledEventIds] = useState<string[]>([]);

  // Interaction Trigger Engine
  React.useEffect(() => {
    if (!content?.events) return;

    // Find the first unhandled event that should have been triggered by now
    const unhandledEvent = content.events
      .sort((a, b) => a.triggerIndex - b.triggerIndex) // Ensure chronological order
      .find(e => e.triggerIndex <= currentIndex && !handledEventIds.includes(e.id));
    
    if (unhandledEvent) {
        // Only trigger 'Push' type events (QUEST, CAMERA, REWARD)
        // MEDIA is handled by GuidePlayer passively
        if (['QUEST', 'CAMERA', 'REWARD'].includes(unhandledEvent.type)) {
            // If there is already an active interaction, we might want to wait or queue it.
            // For now, if no interaction is active, show it.
            if (!activeInteraction) {
                setActiveInteraction(unhandledEvent);
                setHandledEventIds(prev => [...prev, unhandledEvent.id]);
            }
        } else {
            // For non-blocking events (like MEDIA), just mark as handled
            setHandledEventIds(prev => [...prev, unhandledEvent.id]);
        }
    }
  }, [currentIndex, content, activeInteraction, handledEventIds]);

  if (isError) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-4">
        <Text className="text-red-500 text-lg font-bold mb-2">Error Loading Guide</Text>
        <Text className="text-gray-500 mb-4 text-center">{error?.message}</Text>
        <Text className="text-xs text-red-400 bg-red-50 p-2 rounded mb-4">
            {JSON.stringify(error, null, 2)}
        </Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mt-6 bg-gray-200 px-6 py-3 rounded-xl"
        >
          <Text className="font-bold text-gray-700">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-4">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-4 text-gray-500">Loading guide...</Text>
        <Text className="mt-2 text-xs text-gray-400">ID: {JSON.stringify(id)}</Text>
      </View>
    );
  }

  if (!content) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-4">
        <Text className="text-red-500 text-lg font-bold mb-2">Guide Not Found</Text>
        <Text className="text-gray-500 mb-4">Could not load guide content.</Text>
        <Text className="text-xs text-gray-400 bg-gray-100 p-2 rounded">
          Requested ID: {JSON.stringify(id)}
        </Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mt-6 bg-gray-200 px-6 py-3 rounded-xl"
        >
          <Text className="font-bold text-gray-700">Go Back</Text>
        </TouchableOpacity>
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
      <View className="mb-4">
        <GuidePlayer content={content} currentIndex={currentIndex} />
      </View>

      {/* Developer Test Controls */}
      <View className="flex-row gap-2 mb-4">
        <TouchableOpacity
          onPress={() => {
            const questEvent = content.events.find(e => e.type === 'QUEST');
            if (questEvent) setActiveInteraction(questEvent);
          }}
          className="bg-purple-100 px-3 py-2 rounded-lg border border-purple-200"
        >
          <Text className="text-purple-700 font-bold text-xs">🛠️ Test Quest</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
           onPress={() => {
             const cameraEvent = content.events.find(e => e.type === 'CAMERA');
             if (cameraEvent) setActiveInteraction(cameraEvent);
           }}
           className="bg-blue-100 px-3 py-2 rounded-lg border border-blue-200"
        >
           <Text className="text-blue-700 font-bold text-xs">📸 Test Camera</Text>
        </TouchableOpacity>
      </View>

        <TouchableOpacity
          activeOpacity={1}
          onPress={skip}
          className="mt-6 p-4 bg-gray-50 rounded-2xl min-h-[150px]"
        >
          <Text className="text-lg leading-7 text-gray-800">{displayedText}</Text>
        </TouchableOpacity>

        {isComplete && !activeInteraction && (
          <View className="mt-8">
            <Text className="text-lg font-bold mb-4">Tour Completed!</Text>
            <TouchableOpacity
              className="bg-gray-200 p-4 rounded-xl items-center"
              onPress={() => router.back()}
            >
              <Text className="text-gray-600 font-bold text-lg">Back to List</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Interaction Overlays */}
        {activeInteraction?.type === 'QUEST' && (
             <QuestBoard 
               quests={content.quests} 
               onComplete={() => setActiveInteraction(null)}
             />
        )}
        
        {activeInteraction?.type === 'CAMERA' && (
            <View className="absolute top-0 left-0 right-0 bottom-0 bg-black z-50">
                {/* Mock Camera View - In real implementation, use CameraView here */}
                <View className="flex-1 justify-center items-center">
                    <Text className="text-white text-xl mb-8 font-bold text-center px-4">
                      📸 Mission: Take a photo of{'\n'}{activeInteraction.data.targetName}
                    </Text>
                    <View className="w-64 h-64 border-2 border-white/50 rounded-lg mb-8 items-center justify-center">
                      <Text className="text-white/50">Camera Preview Area</Text>
                    </View>
                    <TouchableOpacity 
                        onPress={() => {
                          // Simulate photo taken
                          setActiveInteraction(null);
                          // Suggest next step or show success toast could be added here
                        }}
                        className="w-16 h-16 bg-white rounded-full items-center justify-center border-4 border-gray-300"
                    >
                      <View className="w-12 h-12 bg-white rounded-full border border-black/10" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => setActiveInteraction(null)}
                        className="absolute top-12 right-4 bg-black/50 p-2 rounded-full"
                    >
                        <Text className="text-white font-bold">Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )}
      </ScrollView>
    </View>
  );
}
