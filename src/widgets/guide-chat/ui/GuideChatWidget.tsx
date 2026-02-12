import React, { useEffect, useRef } from 'react';
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
import { QuestBoard } from '@widgets/quest-board';

type GuideChatRouteProp = RouteProp<BottomSheetStackParamList, 'GuideChat'>;

export function GuideChatWidget() {
  const route = useRoute<GuideChatRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<BottomSheetStackParamList>>();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Store Hooks
  const { messages, welcomedMarkerIds, welcomeMarker } = useChatStore();
  const { triggeredMarkerId, activeMarkerId } = useMapNavigationStore();
  const { data: markers } = useLocationMarkers();
  const { setCurrentStep } = useUserProgress();
  
  // Local State
  const [activeInteraction, setActiveInteraction] = React.useState<any>(null);
  const isWelcoming = useRef(false);

  // 1. Determine Context (Explicit from Route Params OR Implicit from Store)
  const contextStepId = route.params?.stepId || triggeredMarkerId || activeMarkerId;
  const activeMarker = markers?.find((m) => m.id === contextStepId);
  const displayTitle = route.params?.title || activeMarker?.title || 'AI Tour Guide';

  // 2. Welcome Logic (Auto-trigger context-aware welcome)
  useEffect(() => {
    if (!activeMarker || isWelcoming.current) return;

    // If entering via tab (no params) or explicitly, check if we need to welcome
    if (!welcomedMarkerIds.includes(activeMarker.id)) {
      isWelcoming.current = true;
      welcomeMarker(activeMarker);
    }
  }, [activeMarker, welcomedMarkerIds, welcomeMarker]);

  // 3. Action Handlers
  const router = useRouter();
  
  const handleEnterStep = () => {
    if (activeMarker && activeMarker.contentId) {
      setCurrentStep(activeMarker.contentId);
      router.push(`/step/${activeMarker.contentId}`);
    }
  };

  const handleAction = (action: ChatAction) => {
    switch (action.actionId) {
      case 'start-game':
      case 'start-quest':
        setActiveInteraction({ type: 'QUEST', data: { questId: action.data?.questId || activeMarker?.contentId } });
        break;
      case 'open-camera':
        setActiveInteraction({ type: 'CAMERA', data: { targetName: action.data?.targetName || 'Photo Spot' } });
        break;
      case 'next-guide':
        handleEnterStep();
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
              {msg.actions?.map((action, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => handleAction(action)}
                  className="bg-white border border-[#5AC8FA] py-3 px-4 rounded-xl items-center flex-row justify-center active:bg-[#5AC8FA] active:opacity-90"
                >
                  <Text className="text-[#5AC8FA] font-bold text-base">{action.label}</Text>
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
            <Pressable onPress={() => navigation.goBack()} className="mr-2 active:opacity-70">
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
                        ? `${activeMarker.title}에 대해 무엇이든 물어보세요!` 
                        : '주변에 가이드 가능한 장소가 없습니다.'}
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

      {/* Interaction Overlays (Quest / Camera) */}
      {activeInteraction?.type === 'QUEST' && (
          <View className="absolute top-0 left-0 right-0 bottom-0 bg-white z-50">
            <QuestBoard 
                quests={[]} 
                onComplete={() => setActiveInteraction(null)}
            />
          </View>
      )}
      
      {activeInteraction?.type === 'CAMERA' && (
        <View className="absolute top-0 left-0 right-0 bottom-0 bg-black z-50">
            {/* Mock Camera View */}
            <View className="flex-1 justify-center items-center">
                <Text className="text-white text-xl mb-8 font-bold text-center px-4">
                    📸 Mission: Take a photo of{'\n'}{activeInteraction.data.targetName}
                </Text>
                <View className="w-64 h-64 border-2 border-white/50 rounded-lg mb-8 items-center justify-center">
                    <Text className="text-white/50">Camera Preview Area</Text>
                </View>
                <Pressable 
                    onPress={() => setActiveInteraction(null)}
                    className="w-16 h-16 bg-white rounded-full items-center justify-center border-4 border-gray-300 active:opacity-70"
                >
                    <View className="w-12 h-12 bg-white rounded-full border border-black/10" />
                </Pressable>
                <Pressable 
                    onPress={() => setActiveInteraction(null)}
                    className="absolute top-12 right-4 bg-black/50 p-2 rounded-full active:opacity-70"
                >
                    <Text className="text-white font-bold">Close</Text>
                </Pressable>
            </View>
        </View>
      )}
    </View>
  );
}
