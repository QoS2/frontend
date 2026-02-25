import React, { useEffect, useRef, useState } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';

import { TypewriterText, Text } from '@shared/ui';
import { useChatStore } from '@features/ai-chat';
import { useCurrentRun } from '@entities/tour/model';
import { useLocationMarkers } from '@entities/location';
import type { BottomSheetStackParamList } from '@features/bottom-sheet';

// --- Custom Hooks ---
import { useChatHistory } from '../lib/useChatHistory';
import { useTurnPlayer } from '../lib/useTurnPlayer';
import { useChatActionHandler } from '../lib/useChatActionHandler';

// --- Components ---
import { ChatMessageBubble } from './components/ChatMessageBubble';
import { ImageViewerModal } from './components/ImageViewerModal';

type GuideChatRouteProp = RouteProp<BottomSheetStackParamList, 'GuideChat'>;
type GuideChatNavigationProp = NativeStackNavigationProp<BottomSheetStackParamList, 'GuideChat'>;

export function GuideChatWidget() {
    const route = useRoute<GuideChatRouteProp>();
    const navigation = useNavigation<GuideChatNavigationProp>();
    
    // Global States
    const { messages, isStreaming } = useChatStore();
    const { currentRun, tourDetail } = useCurrentRun();
    const { data: markers } = useLocationMarkers();
    const runId = currentRun?.runId;
    const routeStepId = route.params?.stepId ? route.params.stepId.toString() : undefined;
    const routeTitle = route.params?.title;

    // View States
    const scrollViewRef = useRef<any>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // 1. History Sync Hook
    const {
        contextStepId,
        activeMarker,
        displayTitle,
        isHistoryLoading,
        mapActionToChatActions
    } = useChatHistory({
        runId,
        tourDetail,
        markers,
        routeStepId,
        routeTitle,
        processTurnAction: (action, delay) => turnPlayer.processTurnAction(action, delay)
    });

    // 2. Turn Player Hook (Streaming, Auto Next)
    const turnPlayer = useTurnPlayer({
        isHistoryLoading,
        mapActionToChatActions
    });

    // 3. Action Handler Hook (Start Mission, Next Spot)
    const { handleActionClick } = useChatActionHandler({
        contextStepId,
        activeMarker,
        runId,
        navigation,
        processTurnAction: (action, delay) => turnPlayer.processTurnAction(action, delay)
    });

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        if (scrollViewRef.current) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isStreaming, turnPlayer.isTurnFetching]);

    // Render Logic
    if (!contextStepId || !activeMarker) {
        return (
            <View className="flex-1 items-center justify-center p-6 pb-24">
                <Text className="text-gray-500 text-lg">AI 가이드를 기다리는 중입니다.</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white relative">
            <View className="px-5 pb-3">
                <Text className="text-2xl font-bold font-neo-bold text-gray-800">
                    {displayTitle}
                </Text>
            </View>

            <BottomSheetScrollView
                ref={scrollViewRef}
                className="flex-1 px-5"
                contentContainerStyle={{ paddingBottom: 150 }}
                showsVerticalScrollIndicator={false}
            >
                {isHistoryLoading ? (
                    <View className="py-10 items-center justify-center">
                        <ActivityIndicator size="large" color="#4FAAF0" />
                        <Text className="text-gray-500 mt-4">히스토리를 동기화 중입니다...</Text>
                    </View>
                ) : (
                    <>
                        {messages.map((msg) => (
                            <ChatMessageBubble 
                                key={msg.id} 
                                msg={msg} 
                                onAction={handleActionClick} 
                                onImageSelect={setSelectedImage} 
                            />
                        ))}

                        {turnPlayer.isTurnFetching && (
                            <View className="px-4 py-3 rounded-2xl bg-gray-100 max-w-[85%] self-start flex-row gap-2 mt-2">
                                <ActivityIndicator size="small" color="#9CA3AF" />
                                <TypewriterText text="다음 안내를 가져오는 중입니다..." className="text-gray-500" />
                            </View>
                        )}
                    </>
                )}
            </BottomSheetScrollView>

            <ImageViewerModal 
                imageUrl={selectedImage} 
                onClose={() => setSelectedImage(null)} 
            />
        </View>
    );
}
