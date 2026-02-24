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
import { useQueryClient } from '@tanstack/react-query';
import { useChatStore, ChatMessage, ChatAction } from '@features/ai-chat';
import { useMapNavigationStore } from '@features/map-navigation';
import { useLocationMarkers } from '@entities/location';
import { useActionOverlayStore } from '@features/action-overlay/useActionOverlayStore';
import { useRunProgressStore } from '@features/run-progress/runProgressStore';
import { useNextTurnByUrl, fetchChatSession, fetchChatHistory } from '@entities/run/model';
import { useTourStore } from '@entities/tour/store';
import { useTourDetail } from '@entities/tour/model';
import { httpClient } from '@shared/api/httpClient';

type GuideChatRouteProp = RouteProp<BottomSheetStackParamList, 'GuideChat'>;

export function GuideChatWidget() {
  const route = useRoute<GuideChatRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<BottomSheetStackParamList>>();
  const queryClient = useQueryClient();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Store Hooks
  const { 
    messages, 
    isStreaming, 
    addMessage, 
    setMessages,
    setActiveSpot,
    streamReply,
    finishStreaming
  } = useChatStore();
  const { triggeredMarkerId, activeMarkerId } = useMapNavigationStore();
  const { data: markers } = useLocationMarkers();
  const { openAction } = useActionOverlayStore();

  // 1. Determine Context
  const activeTourId = useTourStore((state) => state.activeTourId);
  const { data: tourDetail } = useTourDetail(activeTourId ?? 0);
  const runId = tourDetail?.currentRun?.runId;

  const contextStepIdRaw = route.params?.stepId || triggeredMarkerId || activeMarkerId;
  
  // Note: Only PLACE and SUB_PLACE markers have chat sessions.
  // Maintain the last valid context so chat doesn't disrupt when passing by a PHOTO spot.
  const lastValidContextRef = useRef<string | null>(null);
  const contextStepId = React.useMemo(() => {
    if (!contextStepIdRaw || !markers) return lastValidContextRef.current;
    const marker = markers.find((m) => m.id.toString() === contextStepIdRaw.toString());
    if (marker && (marker.type === 'PLACE' || marker.type === 'SUB_PLACE')) {
      lastValidContextRef.current = contextStepIdRaw.toString();
      return contextStepIdRaw.toString();
    }
    return lastValidContextRef.current;
  }, [contextStepIdRaw, markers]);

  const activeMarker = markers?.find((m) => m.id.toString() === contextStepId?.toString());
  const displayTitle = route.params?.title || activeMarker?.title || 'AI Tour Guide';

  // 2. Run Progress Store
  const { activeSessionId, currentTurn, setCurrentTurn, playedTurnIds, markTurnAsPlayed, setSession } = useRunProgressStore();
  const { mutate: fetchNextTurn } = useNextTurnByUrl();
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  // 3. Single imperative effect: spot → session → history → display
  useEffect(() => {
    if (!contextStepId || !runId) return;

    let cancelled = false;
    const spotIdNum = Number(contextStepId);
    if (isNaN(spotIdNum)) return;

    // Clear old messages for this new spot
    setActiveSpot(contextStepId.toString());
    setIsHistoryLoading(true);

    (async () => {
      try {
        // Step 1: Get session for this spot
        const session = await fetchChatSession({ runId, spotId: spotIdNum });
        if (cancelled) return;

        // Step 2: Set session in store
        setSession(session.sessionId, null);

        // Step 3: Get chat history
        const history = await fetchChatHistory(session.sessionId);
        if (cancelled) return;

        // Step 4: Map turns to messages
        const historicalMessages: ChatMessage[] = [];
        history.turns.forEach(turn => {
          markTurnAsPlayed(turn.turnId);

          if (turn.assets) {
            turn.assets.forEach(asset => {
              if (asset.type === 'IMAGE') {
                historicalMessages.push({
                  id: `hist-asset-${asset.id}`,
                  sender: 'ai',
                  type: 'image',
                  imageUrl: asset.url as any,
                  timestamp: Date.now() - 1000,
                });
              }
            });
          }

          if (turn.text) {
            historicalMessages.push({
              id: `hist-${turn.turnId}`,
              sender: turn.role === 'USER' ? 'user' : 'ai',
              type: 'text',
              text: turn.text,
              timestamp: Date.now() - 500,
            });
          }

          const chatActions = mapActionToChatActions(turn.action);
          if (chatActions.length > 0) {
            historicalMessages.push({
              id: `hist-action-${turn.turnId}`, // turnId is for message identity
              sender: 'ai',
              type: 'action',
              actions: chatActions,
              timestamp: Date.now() - 500,
            });
          }
        });

        // Step 5: Display
        if (!cancelled) {
          const RECENCY_THRESHOLD_MS = 20000; // 20 seconds
          const isFreshSession = history.turns.length > 0 && 
              history.turns[0].createdAt &&
              (Date.now() - new Date(history.turns[0].createdAt).getTime() < RECENCY_THRESHOLD_MS);

          if (isFreshSession) {
              setMessages([]); // Start empty for dramatic reveal
              let currentDelay = 0;
              
              historicalMessages.forEach((msg, idx) => {
                  setTimeout(() => {
                      if (cancelled) return;
                      addMessage({
                          sender: msg.sender,
                          type: msg.type,
                          text: msg.text,
                          imageUrl: msg.imageUrl,
                          actions: msg.actions,
                          isAnimating: msg.sender === 'ai' && msg.type === 'text',
                      });
                      
                      // Trigger AUTO_NEXT on the last item
                      if (idx === historicalMessages.length - 1) {
                          const lastTurn = history.turns[history.turns.length - 1];
                          if (lastTurn && lastTurn.action?.type === 'AUTO_NEXT' && contextStepId === (triggeredMarkerId || activeMarkerId)) {
                             processTurnAction(lastTurn.action, lastTurn.delayMs);
                          }
                      }
                  }, currentDelay);
                  
                  // Calculate delay for the NEXT message based on current message's text length
                  currentDelay += msg.text ? (msg.text.length * 40 + 800) : 800; 
              });
          } else {
              setMessages(historicalMessages);

              // Step 6: If last turn was AUTO_NEXT, trigger it
              const lastTurn = history.turns[history.turns.length - 1];
              if (lastTurn && lastTurn.action?.type === 'AUTO_NEXT' && contextStepId === (triggeredMarkerId || activeMarkerId)) {
                 processTurnAction(lastTurn.action, lastTurn.delayMs);
              }
          }
        }
      } catch (error) {
        console.error('[Chat] Failed to load history:', error);
      } finally {
        if (!cancelled) setIsHistoryLoading(false);
      }
    })();

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextStepId, runId]);


  // 5. Action Utilities
  const mapActionToChatActions = (action: any): ChatAction[] => {
    if (!action) return [];
    const chatActions: ChatAction[] = [];
    
    // Priority: 1. action.stepId (Direct link from server)
    // 2. Lookup in tourDetail.mainMissionPath using current contextStepId (spotId)
    let missionStepId = action.stepId;
    if (!missionStepId && contextStepId) {
      const spotMatched = tourDetail?.mainMissionPath?.find(
        (path) => path.spotId.toString() === contextStepId.toString()
      );
      // spot에 연결된 미션들 중 첫 번째 미션의 stepId를 가져옵니다. (보통 1개의 메인 미션)
      if (spotMatched && spotMatched.missions && spotMatched.missions.length > 0) {
        missionStepId = spotMatched.missions[0].stepId;
      }
    }

    // 현재 장소가 완료된 상태인지 확인 (tourDetail의 progress 정보 활용)
    const completedSpotIds = tourDetail?.currentRun?.progress?.completedSpotIds || [];
    const isCompleted = contextStepId ? completedSpotIds.includes(Number(contextStepId)) : false;

    if (action.type === 'MISSION_CHOICE') {
        if (!missionStepId) {
            console.warn('[CHAT_DEBUG] MISSION_CHOICE with no valid stepId or contextStepId');
            return [];
        }
        chatActions.push({ 
            label: isCompleted ? '완료된 미션 보기' : '시작하기', 
            actionId: 'start-mission', 
            data: { stepId: missionStepId, isCompleted } 
        });
    } else if (action.type === 'NEXT') {
        chatActions.push({ 
            label: '다음 장소로', 
            actionId: 'next-step', 
            data: { nextApi: action.nextApi } 
        });
    }
    return chatActions;
  };

  // 7. New Turn-by-Turn Run Mode Logic
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
     } else {
         const chatActions = mapActionToChatActions(action);
         if (chatActions.length > 0) {
             addMessage({
                 sender: 'ai',
                 type: 'action',
                 actions: chatActions,
             });
         }
     }
  };

  // 8. Play currentTurn
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

  // 9. When text streaming ends, process action (delayMs => fetch next)
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
    console.log('[CHAT_DEBUG] handleAction called:', JSON.stringify(action));
    const contentId = activeMarker?.contentId;
    
    if (action.actionId === 'start-mission') {
        // use action.data.stepId first, then contentId (which is likely the overarching place ID)
        const targetId = action.data?.stepId || contentId;
        const isCompleted = action.data?.isCompleted || false;
        
        console.log('[CHAT_DEBUG] start-mission. targetId:', targetId, 'isCompleted:', isCompleted);
        if (!targetId) {
            console.warn('[CHAT_DEBUG] No valid target ID for start-mission action');
            return;
        }

        // 마커 타입을 기반으로 퀴즈인지 카메라 미션인지 판단 (추후 ActionPage에서 API 결과로 더 정확히 판단함)
        const guessType = activeMarker?.type === 'PHOTO' ? 'CAMERA' : 'QUIZ';

        openAction({
            type: guessType,
            contentId: targetId.toString(),
         });
         return;
     } else if (action.actionId === 'next-step') {
         console.log('[CHAT_DEBUG] next-step routing to GuideList');
         
         // 만약 nextApi가 있다면 호출하여 백엔드 상태 갱신 트리거
         if (action.data?.nextApi) {
             httpClient.get(action.data.nextApi).catch(e => {
                 console.warn('[CHAT_DEBUG] nextApi call failed:', e);
             });
         }

         // 백엔드 상태 갱신을 위해 관련 쿼리 무효화
         queryClient.invalidateQueries({ queryKey: ['tour-run', runId, 'next-spot'] });
         queryClient.invalidateQueries({ queryKey: ['tour', activeTourId] });

         navigation.navigate('GuideList');
         return;
     }

    if (!contentId) {
        console.warn('[CHAT_DEBUG] No content ID for action:', action.actionId);
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
            <View className="flex-col gap-2 min-w-[200px] items-start">
              <View
                className={`px-4 py-3 rounded-2xl max-w-[85%] ${
                  msg.sender === 'ai'
                    ? 'bg-gray-100 border border-gray-200 rounded-tl-none'
                    : 'bg-[#4FAAF0] rounded-br-none self-end'
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
                {(isTurnFetching || isHistoryLoading) && <ActivityIndicator size="small" color="#9CA3AF" className="mt-4" />}
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
