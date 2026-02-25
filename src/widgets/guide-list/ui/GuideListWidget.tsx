import React, { useEffect } from 'react';
import { View, Pressable } from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
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
import { useTourDetail, useCurrentRun } from '@entities/tour/model';
import { LocationMarker } from '@shared/api/contracts';
import { useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@shared/api/httpClient';
import { ChatSessionResponseSchema } from '@shared/api/run.contracts';
import { useNextSpot } from '@entities/run/model';

type GuideStatus = 'done' | 'live' | 'unlock' | 'lock';

export function GuideListWidget() {
  const { data: markers = [] } = useLocationMarkers();
  const { activeMarkerId } = useMapNavigationStore();
  const { tourDetail, runId } = useCurrentRun();
  const { data: nextSpotData } = useNextSpot(runId);

  // Filter and sort items based on markers and their ID order
  const guideItems = React.useMemo(() => {
    if (!markers || markers.length === 0) return [];

    return markers
      .filter((m) => m.type === 'PLACE' || m.type === 'SUB_PLACE')
      .map((m) => {
        return {
          id: m.id,
          title: m.title,
          type: m.type,
          contentId: m.contentId,
        };
      })
      .sort((a, b) => {
        // Sort by ID numerically
        const idA = parseInt(a.id, 10);
        const idB = parseInt(b.id, 10);
        
        if (!isNaN(idA) && !isNaN(idB)) {
          return idA - idB;
        }
        // Fallback to string comparison if IDs are not numeric
        return a.id.localeCompare(b.id);
      });
  }, [markers]);

  // Use progress data if available, but filter by guideItems to ensure count only includes PLACE/SUB_PLACE
  const completedSpotIds = tourDetail?.currentRun?.progress?.completedSpotIds?.map(id => id.toString()) || 
                          nextSpotData?.progress?.completedSpotIds?.map(id => id.toString()) || [];
  
  const totalGuides = guideItems.length;
  const completedCount = guideItems.filter(item => completedSpotIds.includes(item.id)).length;
  const nextSpotId = nextSpotData?.nextSpot?.spotId.toString();

  useEffect(() => {
    console.log('[GUIDE_LIST_DEBUG] State updated:', {
      completedSpotIds,
      nextSpotId,
      activeMarkerId,
      guideItemIds: guideItems.map(i => i.id),
      tourRunProgress: tourDetail?.currentRun?.progress,
      nextSpotProgress: nextSpotData?.progress
    });
  }, [completedSpotIds, nextSpotId, activeMarkerId]);

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
      <BottomSheetScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {guideItems.map((item) => (
          <GuideItem
            key={item.id}
            item={item as any}
            status={getGuideStatus(item.id, nextSpotId, activeMarkerId, completedSpotIds)}
            runId={runId}
          />
        ))}
      </BottomSheetScrollView>
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
  // 1. 완료 여부를 최우선으로 체크
  if (completedSpotIds.includes(itemId)) {
    return 'done';
  }
  
  // 2. 현재 진행 중인(Live) 장소인지 체크
  // nextSpotId가 있으면 그것을 우선으로 하고, 없으면 지도에서 선택된 마커를 참고하되
  // 완료된 항목은 이미 위에서 걸러졌으므로 안전합니다.
  if (nextSpotId === itemId || (nextSpotId === undefined && activeMarkerId === itemId)) {
    return 'live';
  }

  // 3. 그 외에는 잠금 상태 (순서 기반 잠금 로직은 필요시 추가 가능)
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
