import React, { useEffect } from 'react';
import { View, Pressable, FlatList } from 'react-native';
import { ChevronLeft, Check, LockKeyhole, LockKeyholeOpen, Radio } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomSheetStackParamList } from '@features/bottom-sheet';
import { Text } from '@shared/ui';
import { useLocationMarkers } from '@entities/location';
import { useMapNavigationStore } from '@features/map-navigation';
import { useUserProgress } from '@entities/user';
import { LocationMarker } from '@shared/api/contracts';

type GuideStatus = 'done' | 'live' | 'unlock' | 'lock';

export function GuideListWidget() {
  const navigation = useNavigation();
  const { data: markers = [] } = useLocationMarkers();
  const { activeMarkerId, setTriggeredMarkerId } = useMapNavigationStore();
  const { visitedPlaceIds } = useUserProgress();

  // Filter and sort markers for guide list
  const guideItems = markers.filter((m) => m.contentId !== null);

  // Calculate progress
  const totalGuides = guideItems.length;
  const completedCount = guideItems.filter((item) => 
    visitedPlaceIds.includes(item.id)
  ).length;

  const handleBackToChat = () => {
    navigation.goBack();
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center flex-1">
          <Text className="text-xl font-extrabold text-gray-900">Guide List</Text>
          <View className="bg-gray-100 px-2 py-0.5 rounded-full ml-2">
             <Text className="text-xs font-bold text-gray-500">
                {completedCount}/{totalGuides}
             </Text>
          </View>
        </View>

        <View className="flex-row gap-2">
            <View className="border border-gray-200 rounded-full px-2 py-1 flex-row items-center">
                <Text className="text-[10px] text-gray-500 font-medium">All</Text>
                <ChevronLeft size={10} color="#999" style={{ transform: [{rotate: '-90deg'}], marginLeft: 2 }} />
            </View>
        </View>
      </View>

      {/* Progress Bar */}
      <View className="px-4 py-3">
        <View className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <View 
            className="h-full bg-sky-400 rounded-full" 
            style={{ width: `${(completedCount / totalGuides) * 100}%` }}
          />
        </View>
      </View>

      {/* Guide List */}
      <FlatList
        data={guideItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GuideItem
            item={item}
            status={getGuideStatus(item, activeMarkerId, visitedPlaceIds)}
          />
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
}

// Helper function to determine guide status
function getGuideStatus(
  marker: LocationMarker,
  activeMarkerId: string | null,
  visitedPlaceIds: string[]
): GuideStatus {
  if (visitedPlaceIds.includes(marker.id)) {
    return 'done';
  }
  if (activeMarkerId === marker.id) {
    return 'live';
  }
  // Simple unlock logic: could be enhanced with distance checks
  return 'unlock';
}

// Guide Item Component
interface GuideItemProps {
  item: LocationMarker;
  status: GuideStatus;
}

function GuideItem({ item, status }: GuideItemProps) {
  const navigation = useNavigation<NativeStackNavigationProp<BottomSheetStackParamList>>();
  const router = useRouter();
  const { setTriggeredMarkerId } = useMapNavigationStore();
  const isDone = status === 'done';
  const isLive = status === 'live';
  const isUnlock = status === 'unlock';
  const isLock = status === 'lock';

  const handlePress = () => {
    if (isLive) {
      // Ensure the chat context is immediately updated to this marker
      setTriggeredMarkerId(item.id);
      navigation.navigate('Chat');
      return;
    }
    
    if (item.contentId) {
      // Direct navigation to StepDetailPage using Expo Router
      // This allows users to access the guide content directly from the list
      router.push(`/step/${item.contentId}`);
    }
  };

  return (
    <Pressable 
      onPress={handlePress}
      className={`flex-row items-center py-4 px-4 border-b border-gray-50 active:opacity-70 ${
        isLive ? 'bg-sky-50/50' : 'bg-white'
      }`}
    >
      {/* Left Icon Status Area */}
      <View className="w-12 items-center justify-center mr-3">
        {isDone && (
          <View className="bg-gray-100 p-2 rounded-full">
            <Check size={20} color="#9CA3AF" />
          </View>
        )}
        {isLive && (
          <View className="relative">
            <View className="bg-sky-500 p-3 rounded-full">
              <Radio size={20} color="white" />
            </View>
            <View className="absolute -top-1 -right-1 bg-green-400 w-3 h-3 rounded-full border-2 border-white" />
          </View>
        )}
        {isUnlock && (
          <View className="bg-sky-50 p-2 rounded-full">
            <LockKeyholeOpen size={20} color="#38BDF8" />
          </View>
        )}
        {isLock && (
          <View className="bg-red-50 p-2 rounded-full">
            <LockKeyhole size={20} color="#F87171" />
          </View>
        )}

        {/* Status Text */}
        <Text className={`text-[10px] mt-1 font-bold ${
          isDone ? 'text-gray-400' : 
          isLive ? 'text-sky-500' : 
          isUnlock ? 'text-sky-400' : 'text-red-300'
        }`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Text>
      </View>

      {/* Main Content */}
      <View className="flex-1 justify-center">
        <Text className={`text-base mb-0.5 ${
          isDone ? 'text-gray-400 line-through' :
          isLive ? 'text-black font-bold' :
          isUnlock ? 'text-black font-semibold' :
          'text-gray-400'
        }`}>
          {item.title}
        </Text>
        <Text className="text-xs text-gray-400">{item.type}</Text>
      </View>

      {/* Right Badge - could show quest count if available */}
      {isLive && (
        <View className="rounded-full w-6 h-6 items-center justify-center ml-2 bg-sky-400">
          <Text className="text-white text-xs font-bold">!</Text>
        </View>
      )}
    </Pressable>
  );
}
