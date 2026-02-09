import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Text, Button, Input, Avatar, AvatarFallback, Separator } from '@shared/ui';
import { useChatStore } from '@features/ai-chat/model';
import { useMapNavigationStore } from '@features/map-navigation/model';
import { useLocationMarkers } from '@entities/location/model';
import { useUserProgress } from '@entities/user/model';

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
      completeQuest(activeMarker.id, 100);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      addMessage({
        sender: 'ai',
        text: `You found the treasure: ${activeMarker.title}! 100 Mint added.`,
      });
    }
  };

  const handleTakePhoto = () => {
    router.push('/photo-spot');
  };

  const handleSend = () => {
    if (!inputText.trim() || isStreaming) return;

    addMessage({ sender: 'user', text: inputText });
    setInputText('');

    setTimeout(() => {
      streamReply(
        `I'm your AI guide for ${activeMarker?.title}. You asked about "${inputText}". This is a very interesting place with a long history...`,
      );
    }, 500);
  };

  const displayTitle = activeMarker ? activeMarker.title : 'Quest of Seoul Guide';

  return (
    <View className="flex-1 bg-white px-4">
      {/* Header */}
      <View className="py-4">
        <Text className="text-xl font-bold">{displayTitle}</Text>
        <Separator className="mt-2" />
      </View>

      {/* Action Buttons */}
      {activeMarker && (
        <View className="flex-row gap-2 mb-2">
          {activeMarker.type === 'PLACE' && (
            <Button size="sm" onPress={handleEnterStep}>
              <Text className="text-primary-foreground font-semibold">Enter Step</Text>
            </Button>
          )}
          {activeMarker.type === 'TREASURE' && (
            <Button size="sm" variant="secondary" onPress={handleCollectTreasure}>
              <Text className="font-semibold">Collect</Text>
            </Button>
          )}
          {activeMarker.type === 'PHOTO' && (
            <Button size="sm" variant="outline" onPress={handleTakePhoto}>
              <Text className="font-semibold">Take Photo</Text>
            </Button>
          )}
        </View>
      )}

      {/* Messages */}
      <BottomSheetScrollView className="flex-1 mb-4" contentContainerStyle={{ paddingBottom: 16 }}>
        {messages.map((msg) => (
          <View
            key={msg.id}
            className={`flex-row mb-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <Avatar alt="AI Guide" className="w-8 h-8 mr-2">
                <AvatarFallback>
                  <Text className="text-xs">AI</Text>
                </AvatarFallback>
              </Avatar>
            )}
            <View
              className={`max-w-[75%] p-3 rounded-2xl ${
                msg.sender === 'ai' ? 'bg-muted' : 'bg-primary'
              }`}
            >
              <Text className={msg.sender === 'ai' ? '' : 'text-primary-foreground'}>
                {msg.text}
              </Text>
            </View>
          </View>
        ))}
      </BottomSheetScrollView>

      {/* Input Area */}
      <View className="flex-row items-center gap-2 pb-4 border-t border-border pt-2">
        <Input
          className="flex-1"
          placeholder="Ask AI Guide..."
          value={inputText}
          onChangeText={setInputText}
          editable={!isStreaming}
        />
        <Button size="icon" onPress={handleSend} disabled={isStreaming || !inputText.trim()}>
          <Text className="text-primary-foreground text-lg">→</Text>
        </Button>
      </View>

      {/* Next Guide Button */}
      <View className="pb-4">
        <Button className="w-full" variant="outline">
          <Text className="font-semibold">Start next guide</Text>
        </Button>
      </View>
    </View>
  );
}
