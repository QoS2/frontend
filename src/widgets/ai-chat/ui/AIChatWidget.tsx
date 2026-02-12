import React, {useEffect, useRef} from 'react';
import {View, Pressable, Image, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {BottomSheetStackParamList} from '@features/bottom-sheet';
import {ChevronLeft} from 'lucide-react-native';
import {ChatAvatar} from '@shared/assets/icons';
import {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { Text} from '@shared/ui';
import { useChatStore, ChatMessage, ChatAction } from '@features/ai-chat';
import { useMapNavigationStore } from '@features/map-navigation';
import { useLocationMarkers } from '@entities/location';
import { useUserProgress } from '@entities/user';
import { QuestBoard } from '@widgets/quest-board';

type NavigationProp = NativeStackNavigationProp<BottomSheetStackParamList, 'Chat'>;

export function AIChatWidget() {
  const router = useRouter();
  const navigation = useNavigation<NavigationProp>();
  const scrollViewRef = useRef<ScrollView>(null);
  const {messages, streamReply, welcomedMarkerIds, welcomeMarker} = useChatStore();
  const {triggeredMarkerId} = useMapNavigationStore();
  const {data: markers} = useLocationMarkers();
  const {setCurrentStep} = useUserProgress();
  const [activeInteraction, setActiveInteraction] = React.useState<any>(null); // GuideEvent | null

  const activeMarker = markers?.find((m) => m.id === triggeredMarkerId);

  const isWelcoming = useRef(false);

  useEffect(() => {
    // 1. Basic guards
    if (!activeMarker || messages.length > 0 || isWelcoming.current) return;
    
    // 2. Business logic guard (already welcomed in this session?)
    if (!welcomedMarkerIds.includes(activeMarker.id)) {
      isWelcoming.current = true; // Sync guard to prevent double-triggering in same mount
      welcomeMarker(activeMarker);
    }
  }, [activeMarker, messages.length, welcomeMarker, welcomedMarkerIds]);

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

  const displayTitle = activeMarker ? activeMarker.title : 'Quest of Seoul Guide';

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
                  {/* Icon logic can be added here if needed */}
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
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center flex-1">
            <Pressable onPress={() => navigation.navigate('GuideList')} className="mr-2 active:opacity-70">
                <View className="bg-[#5AC8FA] rounded-full w-7 h-7 items-center justify-center">
                    <ChevronLeft size={18} color="white" strokeWidth={2.5} />
                </View>
            </Pressable>
            <Text className="text-lg font-bold flex-1" numberOfLines={1}>{displayTitle}</Text>
        </View>

        <View className="flex-row items-center gap-2">
            <View className="bg-green-100 rounded-full px-2 py-1 flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-green-500 mr-1" />
                <Text className="text-[10px] text-green-700 font-bold">Live</Text>
            </View>
        </View>
      </View>

      {/* Messages */}
      <BottomSheetScrollView 
        ref={scrollViewRef}
        className="flex-1" 
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
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
            
            {/* Render Content based on Type */}
            {renderMessageContent(msg)}
          </View>
        ))}
      </BottomSheetScrollView>

        {/* Interaction Overlays */}
        {activeInteraction?.type === 'QUEST' && (
             <View className="absolute top-0 left-0 right-0 bottom-0 bg-white z-50">
               <QuestBoard 
                 quests={[]} // In real app, fetch quests by ID or use activeInteraction.data.quests
                 onComplete={() => setActiveInteraction(null)}
               />
             </View>
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
                     <Pressable 
                        onPress={() => {
                          // Simulate photo taken
                          setActiveInteraction(null);
                          // Suggest next step or show success toast could be added here
                        }}
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
