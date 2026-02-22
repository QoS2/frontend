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
import { useTourStore } from '@entities/tour/store';
import { useTourDetail } from '@entities/tour/model';
import { LocationMarker } from '@shared/api/contracts';
import { useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@shared/api/httpClient';
import { ChatSessionResponseSchema } from '@shared/api/run.contracts';

import { useTourRunNextSpot } from '@entities/tour/model';

type GuideStatus = 'done' | 'live' | 'unlock' | 'lock';

export function GuideListWidget() {
  const { data: markers = [] } = useLocationMarkers();
  const { activeMarkerId } = useMapNavigationStore();
  const activeTourId = useTourStore((state) => state.activeTourId);
  const { data: tourDetail } = useTourDetail(activeTourId ?? 0);
  const runId = tourDetail?.currentRun?.runId;
  const { data: nextSpotData } = useTourRunNextSpot(runId);

  // Filter and sort items based on mainMissionPath to ensure correct order according to API
  const guideItems = React.useMemo(() => {
    // Create a lookup for marker types
    const markerMap = new Map(markers.map(m => [m.id, m]));

    if (!tourDetail?.mainMissionPath || tourDetail.mainMissionPath.length === 0) {
      // Fallback to markers if mainMissionPath is empty
      return markers
        .filter((m) => m.contentId !== null && (m.type === 'PLACE' || m.type === 'SUB_PLACE'))
        .map(m => ({
          id: m.id,
          title: m.title,
          type: m.type,
          contentId: m.contentId,
          orderIndex: 0
        }));
    }

    // Map mainMissionPath and filter only PLACE and SUB_PLACE
    return tourDetail.mainMissionPath
      .map(p => {
        const marker = markerMap.get(p.spotId.toString());
        return {
          id: p.spotId.toString(),
          title: p.spotTitle,
          type: marker?.type || 'PLACE',
          contentId: p.spotId.toString(),
          orderIndex: p.orderIndex,
        };
      })
      .filter(item => item.type === 'PLACE' || item.type === 'SUB_PLACE')
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [tourDetail, markers]);

  // Use progress data if available, but filter by guideItems to ensure count only includes PLACE/SUB_PLACE
  const completedSpotIds = tourDetail?.currentRun?.progress?.completedSpotIds?.map(id => id.toString()) || 
                          nextSpotData?.progress?.completedSpotIds?.map(id => id.toString()) || [];
  
  const totalGuides = guideItems.length;
  const completedCount = guideItems.filter(item => completedSpotIds.includes(item.id)).length;
  const nextSpotId = nextSpotData?.nextSpot?.spotId.toString();

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
            style={{ width: `${totalGuides > 0 ? (completedCount / totalGuides) * 100 : 0}%` }}
          />
        </View>
      </View>

      {/* Guide List */}
      <FlatList
        data={guideItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
           <GuideItem
            item={item as any}
            status={getGuideStatus(item.id, nextSpotId, activeMarkerId, completedSpotIds)}
            runId={runId}
          />
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
}

// Helper function to determine guide status
function getGuideStatus(
  itemId: string,
  nextSpotId: string | undefined,
  activeMarkerId: string | null,
  completedSpotIds: string[]
): GuideStatus {
  if (completedSpotIds.includes(itemId)) {
    return 'done';
  }
  if (nextSpotId === itemId || activeMarkerId === itemId) {
    return 'live';
  }
  // If not done and not next, we might need a lock status based on orderIndex,
  // but for now, we'll mark as lock if it's not the next spot.
  return 'lock';
}

// Guide Item Component
interface GuideItemProps {
  item: LocationMarker;
  status: GuideStatus;
  runId?: number;
}

function GuideItem({ item, status, runId }: GuideItemProps) {
  const navigation = useNavigation<NativeStackNavigationProp<BottomSheetStackParamList>>();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { setTriggeredMarkerId } = useMapNavigationStore();
  const isDone = status === 'done';
  const isLive = status === 'live';
  const isUnlock = status === 'unlock';
  const isLock = status === 'lock';

  const handlePress = () => {
    if (isLock) return;
    // Navigate to GuideChat for any item with content
    if (item.contentId) {
      navigation.navigate('GuideChat', { stepId: item.id, title: item.title });
      return;
    }
  };

  const prefetchChatSession = async () => {
    if (isLock || !runId || !item.id) return;
    const spotId = parseInt(item.id, 10);
    if (isNaN(spotId)) return;

    queryClient.prefetchQuery({
      queryKey: ['chat-session', runId, spotId],
      queryFn: async () => {
        const response = await httpClient.get<unknown>(`/api/v1/tour-runs/${runId}/spots/${spotId}/chat-session`);
        return ChatSessionResponseSchema.parse(response);
      },
      staleTime: 1000 * 60 * 10, // 10 minutes
    });
  };

  return (
    <Pressable 
      onPress={handlePress}
      onPressIn={prefetchChatSession}
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
