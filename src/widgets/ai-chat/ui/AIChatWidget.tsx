import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { Text, Avatar, AvatarFallback } from '@shared/ui';
import { useChatStore } from '@features/ai-chat/model';
import { useMapNavigationStore } from '@features/map-navigation/model';
import { useLocationMarkers } from '@entities/location/model';
import { useUserProgress } from '@entities/user/model';

export function AIChatWidget() {
  const router = useRouter();
  const { messages, streamReply } = useChatStore();
  const { triggeredMarkerId } = useMapNavigationStore();
  const { data: markers } = useLocationMarkers();
  const { setCurrentStep } = useUserProgress();

  const activeMarker = markers?.find((m) => m.id === triggeredMarkerId);

  useEffect(() => {
    if (activeMarker && messages.length === 0) {
      streamReply(`Welcome to ${activeMarker.title}! ${activeMarker.description}`);
    }
  }, [activeMarker, messages.length, streamReply]);

  const handleEnterStep = () => {
    if (activeMarker && activeMarker.contentId) {
      setCurrentStep(activeMarker.contentId);
      router.push(`/step/${activeMarker.contentId}`);
    }
  };

  const displayTitle = activeMarker ? activeMarker.title : 'Quest of Seoul Guide';

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity>
            <Ionicons name="chevron-back-outline" size={20} color="#666" />
          </TouchableOpacity>

          <View className="flex-row items-center ml-2 flex-1">
            <View className="bg-[#5AC8FA] rounded-full w-7 h-7 items-center justify-center">
              <Text className="text-white text-xs font-bold">3</Text>
            </View>
            <Text className="text-base font-bold ml-2 flex-1">{displayTitle}</Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          <TouchableOpacity className="bg-white rounded-3xl px-3 py-1.5 flex-row items-center border border-gray-200">
            <Ionicons name="list" size={16} color="#000" />
            <Text className="text-xs font-bold ml-1.5">Guide List</Text>
          </TouchableOpacity>

          <View className="bg-gray-100 rounded-2xl px-3 py-1.5 flex-row items-center">
            <Ionicons name="checkmark-circle" size={14} color="#666" />
            <Text className="text-xs text-gray-600 ml-1">Done</Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      <BottomSheetScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {messages.map((msg) => (
          <View
            key={msg.id}
            className={`flex-row mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <Avatar alt="AI Guide" className="w-10 h-10 mr-2">
                <AvatarFallback>
                  <Text className="text-base">🐯</Text>
                </AvatarFallback>
              </Avatar>
            )}
            <View
              className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                msg.sender === 'ai'
                  ? 'bg-gray-100 border border-gray-200 rounded-tl-none'
                  : 'bg-[#4FAAF0] rounded-br-none'
              }`}
            >
              <Text className={`text-base leading-5 ${msg.sender === 'ai' ? 'text-gray-800' : 'text-white'}`}>
                {msg.text}
              </Text>
            </View>
          </View>
        ))}

        {/* Start Next Guide Button */}
        <TouchableOpacity
          onPress={handleEnterStep}
          className="bg-[#8DC6F0] rounded-2xl p-4 flex-row items-center justify-center mt-4 mb-24"
        >
          <Ionicons name="people" size={20} color="#333" />
          <Text className="text-base font-semibold text-gray-800 mx-2">Start next guide</Text>
          <Ionicons name="arrow-forward" size={18} color="#333" />
        </TouchableOpacity>
      </BottomSheetScrollView>
    </View>
  );
}
