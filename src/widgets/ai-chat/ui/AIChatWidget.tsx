import React, { useEffect, useState } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Text } from '../../../shared/ui/Text';
import { useChatStore } from '../../../features/ai-chat/model';
import { useMapNavigationStore } from '../../../features/map-navigation/model';
import { useLocationMarkers } from '../../../entities/location/model';
import { useUserProgress } from '../../../entities/user/model';

export function AIChatWidget() {
  const router = useRouter();
  const { messages, addMessage, streamReply, isStreaming } = useChatStore();
  const { triggeredMarkerId } = useMapNavigationStore();
  const { data: markers } = useLocationMarkers();
  const { setCurrentStep, completeQuest } = useUserProgress();
  const [inputText, setInputText] = useState('');

  const activeMarker = markers?.find((m) => m.id === triggeredMarkerId);

  useEffect(() => {
    if (activeMarker && messages.length === 0) {
      // Initial greeting from AI
      streamReply(`Welcome to ${activeMarker.title}! ${activeMarker.description}`);
    }
  }, [activeMarker, messages.length, streamReply]);

  const handleEnterStep = () => {
    if (activeMarker && activeMarker.contentId) {
      setCurrentStep(activeMarker.contentId);
      router.push(`/step/${activeMarker.contentId}`);
    }
  };

  const handleCollectTreasure = () => {
    if (activeMarker) {
      completeQuest(activeMarker.id, 100); // 100 Mint for treasure
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      addMessage({
        sender: 'ai',
        text: `You found the treasure: ${activeMarker.title}! 100 Mint added.`,
      });
    }
  };

  const handleTakePhoto = () => {
    // Navigate to AR/Photo page (to be implemented)
    router.push('/photo-spot');
  };

  const handleSend = () => {
    if (!inputText.trim() || isStreaming) return;

    addMessage({ sender: 'user', text: inputText });
    setInputText('');

    // Simulate AI response
    setTimeout(() => {
      streamReply(
        `I'm your AI guide for ${activeMarker?.title}. You asked about "${inputText}". This is a very interesting place with a long history...`,
      );
    }, 500);
  };

  if (!triggeredMarkerId || !activeMarker) return null;

  return (
    <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-lg p-4 h-1/2">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold">{activeMarker.title}</Text>

        {activeMarker.type === 'PLACE' && (
          <TouchableOpacity
            className="bg-blue-500 px-4 py-2 rounded-full"
            onPress={handleEnterStep}
          >
            <Text className="text-white font-semibold">Enter Step Page</Text>
          </TouchableOpacity>
        )}

        {activeMarker.type === 'TREASURE' && (
          <TouchableOpacity
            className="bg-yellow-500 px-4 py-2 rounded-full"
            onPress={handleCollectTreasure}
          >
            <Text className="text-black font-semibold">Collect</Text>
          </TouchableOpacity>
        )}

        {activeMarker.type === 'PHOTO' && (
          <TouchableOpacity
            className="bg-purple-500 px-4 py-2 rounded-full"
            onPress={handleTakePhoto}
          >
            <Text className="text-white font-semibold">Take Photo</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView className="flex-1 mb-4">
        {messages.map((msg) => (
          <View
            key={msg.id}
            className={`mb-2 p-3 rounded-2xl max-w-[80%] ${
              msg.sender === 'ai' ? 'bg-gray-100 self-start' : 'bg-blue-100 self-end'
            }`}
          >
            <Text>{msg.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View className="flex-row items-center border-t border-gray-200 pt-2">
        <TextInput
          className="flex-1 bg-gray-50 rounded-full px-4 py-2 mr-2"
          placeholder="Ask AI Guide..."
          value={inputText}
          onChangeText={setInputText}
          editable={!isStreaming}
        />
        <TouchableOpacity
          className={`p-2 rounded-full ${isStreaming ? 'bg-gray-300' : 'bg-blue-500'}`}
          onPress={handleSend}
          disabled={isStreaming}
        >
          <Text className="text-white">Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
