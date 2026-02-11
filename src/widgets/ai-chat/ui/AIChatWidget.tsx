import { useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { List, ArrowRight, CheckCircle, Send, Users } from 'lucide-react-native';
import { ChatAvatar } from '@shared/assets/icons';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { Text} from '@shared/ui';
import { useChatStore } from '@features/ai-chat';
import { useMapNavigationStore } from '@features/map-navigation';
import { useLocationMarkers } from '@entities/location';
import { useUserProgress } from '@entities/user';
import { useBottomSheetStore } from '@features/bottom-sheet';

export function AIChatWidget() {
  const router = useRouter();
  const { messages, streamReply } = useChatStore();
  const { triggeredMarkerId } = useMapNavigationStore();
  const { data: markers } = useLocationMarkers();
  const { setCurrentStep } = useUserProgress();
  const { setView } = useBottomSheetStore();

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

  const handleShowGuideList = () => {
    setView('guide-list');
  };

  const displayTitle = activeMarker ? activeMarker.title : 'Quest of Seoul Guide';

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center flex-1">
          <View className="flex-row items-center ml-2 flex-1">
            <View className="bg-[#5AC8FA] rounded-full w-7 h-7 items-center justify-center">
              <Text className="text-white text-xs font-bold">3</Text>
            </View>
            <Text className="text-base font-bold ml-2 flex-1">{displayTitle}</Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          <TouchableOpacity 
            onPress={handleShowGuideList}
            className="bg-white rounded-3xl px-3 py-1.5 flex-row items-center border border-gray-200"
          >
            <List size={16} color="#000" />
            <Text className="text-xs font-bold ml-1.5">Guide List</Text>
          </TouchableOpacity>

          <View className="bg-gray-100 rounded-2xl px-3 py-1.5 flex-row items-center">
            <CheckCircle size={14} color="#666" />
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
              <View className="w-10 h-10 mr-4">
                <ChatAvatar width={40} height={40} />
              </View>
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
          <Users size={20} color="#333" />
          <Text className="text-base font-semibold text-gray-800 mx-2">Start next guide</Text>
          <ArrowRight size={18} color="#333" />
        </TouchableOpacity>
      </BottomSheetScrollView>
    </View>
  );
}
