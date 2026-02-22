import React, { useEffect, useRef, useState } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { View, Pressable, Image, ScrollView, ActivityIndicator } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';

import { Text, TypewriterText } from '@shared/ui';
import { ChatAvatar } from '@shared/assets/icons';
import type { BottomSheetStackParamList } from '@features/bottom-sheet';
import { useChatStore, ChatMessage, ChatAction } from '@features/ai-chat';
import { useMapNavigationStore } from '@features/map-navigation';
import { useLocationMarkers } from '@entities/location';
import { useActionOverlayStore } from '@features/action-overlay/useActionOverlayStore';
import { useRunProgressStore } from '@features/run-progress/runProgressStore';
import { useNextTurnByUrl } from '@entities/run/model';

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
    finishStreaming
  } = useChatStore();
  const { triggeredMarkerId, activeMarkerId } = useMapNavigationStore();
  const { data: markers } = useLocationMarkers();
  const { openAction } = useActionOverlayStore();

  // 1. Determine Context
  const contextStepId = route.params?.stepId || triggeredMarkerId || activeMarkerId;
  const activeMarker = markers?.find((m) => m.id === contextStepId);
  const displayTitle = route.params?.title || activeMarker?.title || 'AI Tour Guide';

  // 2. Turn-by-Turn Hooks (For Run Mode)
  const { activeSessionId, currentTurn, setCurrentTurn, playedTurnIds, markTurnAsPlayed } = useRunProgressStore();
  const { mutate: fetchNextTurn } = useNextTurnByUrl();

  // 3. New Turn-by-Turn Run Mode Logic
  const previousStreamingTurnRef = useRef(isStreaming);
  const [isTurnFetching, setIsTurnFetching] = useState(false);

  // Function to process action
  const processTurnAction = (action: any, delayMs?: number | null) => {
     if (!action) return;
     
     if (action.type === 'AUTO_NEXT' && action.nextApi) {
         setIsTurnFetching(true);
         setTimeout(() => {
             fetchNextTurn(action.nextApi, {
                 onSuccess: (nextTurn) => {
                     setCurrentTurn(nextTurn);
                     setIsTurnFetching(false);
                 },
                 onError: (e) => {
                     console.error("fetchNextTurn Error", e);
                     setIsTurnFetching(false);
                 }
             });
         }, delayMs || 0);
     } else if (action.type === 'MISSION_CHOICE' || action.type === 'NEXT') {
         let chatActions: ChatAction[] = [];
         if (action.type === 'MISSION_CHOICE') {
             chatActions.push({ label: '시작하기', actionId: 'start-mission', data: { stepId: action.stepId || currentTurn?.turnId } });
         } else if (action.type === 'NEXT') {
             chatActions.push({ label: '다음 장소로', actionId: 'next-step', data: {} });
         }
         if (chatActions.length > 0) {
             addMessage({
                 sender: 'ai',
                 type: 'action',
                 actions: chatActions,
             });
         }
     }
  };

  // Play currentTurn
  useEffect(() => {
     if (!activeSessionId || !currentTurn) return;
     if (playedTurnIds.includes(currentTurn.turnId)) return;
     if (isStreaming || isTurnFetching) return;
 
     markTurnAsPlayed(currentTurn.turnId);

     // Show assets if any
     if (currentTurn.assets && currentTurn.assets.length > 0) {
         currentTurn.assets.forEach(asset => {
             if (asset.type === 'IMAGE') {
                 addMessage({ sender: 'ai', type: 'image', imageUrl: asset.url as any });
             }
         });
     }

     if (currentTurn.text) {
         streamReply(currentTurn.text);
     } else {
         // Process Action Immediately if no text streaming is needed
         processTurnAction(currentTurn.action, currentTurn.delayMs);
     }
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [activeSessionId, currentTurn, isStreaming, isTurnFetching, playedTurnIds, addMessage, streamReply, markTurnAsPlayed]);

  // When text streaming ends, process action (delayMs => fetch next)
  useEffect(() => {
     if (!activeSessionId || !currentTurn) return;
     
     if (previousStreamingTurnRef.current && !isStreaming && currentTurn && currentTurn.text) {
         processTurnAction(currentTurn.action, currentTurn.delayMs);
     }
     previousStreamingTurnRef.current = isStreaming;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStreaming, activeSessionId, currentTurn]);

  // 4. Action Handler (Overlay Activation)
  const handleAction = (action: ChatAction) => {
    const contentId = activeMarker?.contentId;
    if (!contentId) {
        console.warn('No content ID for action');
        return;
    }

    if (action.actionId === 'start-mission') {
        const stepId = action.data?.stepId || contextStepId;
        openAction({
            type: 'QUIZ',  // QUEST was removed, directly route to QUIZ
            contentId: stepId?.toString() || contentId,
         });
         return;
     } else if (action.actionId === 'next-step') {
        navigation.goBack();
        return;
    }

    switch (action.actionId) {
      case 'start-game':
      case 'start-quest':
        openAction({
            type: 'QUEST',
            contentId: contentId,
            questId: action.data?.questId
        });
        break;
      case 'open-camera':
        openAction({
            type: 'CAMERA',
            contentId: contentId,
            targetName: action.data?.targetName || 'Photo Spot'
        });
        break;
      case 'get-reward':
        openAction({
            type: 'REWARD',
            contentId: contentId,
            rewardId: action.data?.rewardId
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
                        {msg.isAnimating ? (
                            <TypewriterText 
                                text={msg.text} 
                                className="text-base text-gray-800" 
                                onComplete={() => finishStreaming(msg.id)}
                            />
                        ) : (
                            <Text className="text-base text-gray-800">{msg.text}</Text>
                        )}
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
              {msg.sender === 'ai' && msg.isAnimating ? (
                  <TypewriterText 
                    text={msg.text || ''} 
                    className="text-base leading-5 text-gray-800"
                    onComplete={() => finishStreaming(msg.id)}
                  />
              ) : (
                  <Text className={`text-base leading-5 ${msg.sender === 'ai' ? 'text-gray-800' : 'text-white'}`}>
                    {msg.text || ''}
                  </Text>
              )}
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
                {isTurnFetching && <ActivityIndicator size="small" color="#9CA3AF" className="mt-4" />}
            </View>
        ) : (
            <>
                {messages.map((msg) => (
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
                ))}
                {isTurnFetching && (
                    <View className="flex-row mb-4 justify-start items-center">
                        <View className="w-10 h-10 mr-4">
                            <ChatAvatar width={40} height={40} />
                        </View>
                        <View className="px-4 py-3 rounded-2xl bg-gray-100 border border-gray-200 rounded-tl-none">
                            <ActivityIndicator size="small" color="#9CA3AF" />
                        </View>
                    </View>
                )}
            </>
        )}
      </BottomSheetScrollView>
    </View>
  );
}
