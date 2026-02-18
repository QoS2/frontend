import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { View, Pressable, Image, ScrollView } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';

import { Text } from '@shared/ui';
import { ChatAvatar } from '@shared/assets/icons';
import type { BottomSheetStackParamList } from '@features/bottom-sheet';
import { useChatStore, ChatMessage, ChatAction } from '@features/ai-chat';
import { useMapNavigationStore } from '@features/map-navigation';
import { useLocationMarkers } from '@entities/location';
import { useUserProgress } from '@entities/user';
import { useGuideContent } from '@entities/guide';

type GuideChatRouteProp = RouteProp<BottomSheetStackParamList, 'GuideChat'>;

export function GuideChatWidget() {
  const route = useRoute<GuideChatRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<BottomSheetStackParamList>>();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Store Hooks
  const { 
    messages, 
    isStreaming, 
    addMessage, 
    streamReply, 
    startGuide,
    guideProgress,
    updateProgress,
  } = useChatStore();
  const { triggeredMarkerId, activeMarkerId } = useMapNavigationStore();
  const { data: markers } = useLocationMarkers();
  const { setCurrentStep } = useUserProgress();
  
  // Router
  const router = useRouter();

  // 1. Determine Context
  const contextStepId = route.params?.stepId || triggeredMarkerId || activeMarkerId;
  const activeMarker = markers?.find((m) => m.id === contextStepId);
  const displayTitle = route.params?.title || activeMarker?.title || 'AI Tour Guide';

  // 2. Fetch Guide Content
  const { data: guideContent } = useGuideContent(activeMarker?.contentId || null);

  // 3. Script Parsing (Memoized)
  const segments = useMemo(() => {
    if (!guideContent) return [];
    
    const events = [...(guideContent.events || [])].sort((a, b) => a.triggerIndex - b.triggerIndex);
    const result: ({ type: 'text'; text: string } | { type: 'action'; event: any })[] = [];
    let lastIndex = 0;

    events.forEach(event => {
      // Push text before event
      if (event.triggerIndex > lastIndex) {
        const textChunk = guideContent.script.substring(lastIndex, event.triggerIndex).trim();
        if (textChunk) {
            result.push({ type: 'text', text: textChunk });
        }
      }
      // Push event
      result.push({ type: 'action', event });
      lastIndex = event.triggerIndex;
    });

    // Push remaining text
    if (lastIndex < guideContent.script.length) {
      const remainingText = guideContent.script.substring(lastIndex).trim();
      if (remainingText) {
        result.push({ type: 'text', text: remainingText });
      }
    }
    return result;
  }, [guideContent]);

  // 4. Script Player Logic
  // Derive current index from store persistence
  const currentSegmentIndex = guideContent?.id ? (guideProgress[guideContent.id] || 0) : 0;
  
  const isPlayingRef = useRef(false);
  const lastPlayedIndexRef = useRef(-1);

  // Reset lastPlayedIndex when guide changes
  useEffect(() => {
    if (guideContent?.id) {
        startGuide(guideContent.id);
        isPlayingRef.current = true;
        // If we are resuming, assume we've played everything up to the current index
        lastPlayedIndexRef.current = currentSegmentIndex - 1;
    }
  }, [guideContent?.id, startGuide]);

  // Main Playback Effect
  useEffect(() => {
    if (!isPlayingRef.current || !guideContent || currentSegmentIndex >= segments.length) {
        return;
    }

    // Crucial: Only play if we haven't initiated this index yet
    if (currentSegmentIndex <= lastPlayedIndexRef.current) {
        return;
    }

    if (isStreaming) return; // Wait for current stream to finish

    const segment = segments[currentSegmentIndex];
    lastPlayedIndexRef.current = currentSegmentIndex;

    if (segment.type === 'text') {
        streamReply(segment.text);
    } else {
        // It's an action event
        const event = segment.event;
        // Map event to ChatAction
        let actions: ChatAction[] = [];
        
        switch (event.type) {
            case 'QUEST':
                actions.push({ label: '⚔️ Start Quest', actionId: 'start-quest', data: { questId: event.data.questId } });
                break;
            case 'CAMERA':
                actions.push({ label: '📸 Open Camera', actionId: 'open-camera', data: { targetName: event.data.targetName } });
                break;
            case 'REWARD':
                 actions.push({ label: '🎁 Get Reward', actionId: 'get-reward', data: event.data });
                 break;
        }

        if (actions.length > 0) {
             addMessage({
                sender: 'ai',
                type: 'action',
                actions: actions,
                text: 'Here is a challenge for you!' 
            });
        }
        
        // Actions are instant, so move to next segment immediately
        updateProgress(guideContent.id, currentSegmentIndex + 1);
    }
  }, [currentSegmentIndex, segments, guideContent, isStreaming, streamReply, addMessage, updateProgress]);

  // Effect to advance index when streaming finishes
  const wasStreamingRef = useRef(isStreaming);
  useEffect(() => {
      if (wasStreamingRef.current && !isStreaming) {
          // Stream just finished, advance progress
          if (guideContent?.id) {
             updateProgress(guideContent.id, currentSegmentIndex + 1);
          }
      }
      wasStreamingRef.current = isStreaming;
  }, [isStreaming, guideContent, currentSegmentIndex, updateProgress]);


  // 5. Action Handler (Router Navigation)
  const handleAction = (action: ChatAction) => {
    const contentId = activeMarker?.contentId;
    if (!contentId) {
        console.warn('No content ID for action');
        return;
    }

    switch (action.actionId) {
      case 'start-game':
      case 'start-quest':
        router.push({
            pathname: `/action/QUEST/${contentId}`,
            params: { questId: action.data?.questId }
        });
        break;
      case 'open-camera':
        router.push({
            pathname: `/action/CAMERA/${contentId}`,
            params: { targetName: action.data?.targetName || 'Photo Spot' }
        });
        break;
      case 'get-reward':
        router.push({
            pathname: `/action/REWARD/${contentId}`,
            params: { rewardId: action.data?.rewardId }
        });
        break;
      default:
        console.warn('Unknown action:', action.actionId);
    }
  };

  const renderMessageContent = (msg: ChatMessage) => {
      switch (msg.type) {
        case 'image':
          return (
            <View className="rounded-2xl overflow-hidden border border-gray-200 mt-1">
              <Image 
                source={msg.imageUrl} 
                style={{ width: 220, height: 160 }} 
                resizeMode="cover" 
              />
            </View>
          );
        case 'action':
          return (
            <View className="flex-col gap-2 mt-1 min-w-[200px]">
                {msg.text && (
                     <View className="px-4 py-3 rounded-2xl bg-gray-100 border border-gray-200 rounded-tl-none mb-2">
                        <Text className="text-base text-gray-800">{msg.text}</Text>
                     </View>
                )}
              {msg.actions?.map((action, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => handleAction(action)}
                  className="bg-white border border-[#5AC8FA] py-3 px-4 rounded-xl items-center flex-row justify-center active:bg-[#5AC8FA] active:opacity-90 shadow-sm"
                >
                  <Text className="text-[#5AC8FA] font-bold text-base active:text-white">{action.label}</Text>
                </Pressable>
              ))}
            </View>
          );
        case 'text':
        default:
          return (
            <View
              className={`px-4 py-3 rounded-2xl max-w-[85%] ${
                msg.sender === 'ai'
                  ? 'bg-gray-100 border border-gray-200 rounded-tl-none'
                  : 'bg-[#4FAAF0] rounded-br-none'
              }`}
            >
              <Text className={`text-base leading-5 ${msg.sender === 'ai' ? 'text-gray-800' : 'text-white'}`}>
                {msg.text || ''}
              </Text>
            </View>
          );
      }
    };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <View className="flex-row items-center flex-1">
            <Pressable onPress={() => navigation.navigate('GuideList')} className="mr-2 active:opacity-70">
                <View className="bg-gray-100 rounded-full w-8 h-8 items-center justify-center">
                    <ChevronLeft size={20} color="#000" />
                </View>
            </Pressable>
            <Text className="text-lg font-bold flex-1" numberOfLines={1}>{displayTitle}</Text>
        </View>
      </View>

      {/* Messages Area */}
      <BottomSheetScrollView 
        ref={scrollViewRef}
        className="flex-1" 
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 ? (
            <View className="items-center justify-center mt-10 opacity-50">
                <ChatAvatar width={60} height={60} />
                <Text className="text-gray-400 mt-4 text-center">
                    {activeMarker 
                        ? `Connecting to Guide...`
                        : 'No guideable locations nearby.'}
                </Text>
            </View>
        ) : (
            messages.map((msg) => (
            <View
                key={msg.id}
                className={`flex-row mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
                {msg.sender === 'ai' && (
                <View className="w-10 h-10 mr-4">
                    <ChatAvatar width={40} height={40} />
                </View>
                )}
                {renderMessageContent(msg)}
            </View>
            ))
        )}
      </BottomSheetScrollView>
    </View>
  );
}
