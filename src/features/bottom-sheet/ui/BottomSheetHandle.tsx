import React, { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { BottomSheetHandleProps } from '@gorhom/bottom-sheet';
import { useTourStore } from '@entities/tour/store';
import { useTourDetail, useCurrentRun } from '@entities/tour/model';
import { useNextSpot } from '@entities/run/model';
import { useMapNavigationStore } from '@features/map-navigation';

// 탭 데이터 정의
const TABS = [
  { id: 'guide-list', label: 'Guide List', active: false },
  { id: 'ai-tour-guide', label: 'AI Tour Guide', active: true }, // 기본 활성화 (예시)
  { id: 'place', label: 'Place', active: false },
  { id: 'treasure', label: 'Treasure', active: false },
  { id: 'photo', label: 'Photo', active: false },
];

type BottomSheetHandlePropsWithNav = BottomSheetHandleProps & {
    navigationRef?: any;
    currentRoute?: string;
};

export const BottomSheetHandle = ({ animatedIndex, animatedPosition, navigationRef, currentRoute }: BottomSheetHandlePropsWithNav) => {
  // Source of truth for active tab based on current navigation route
  const activeTabId = useMemo(() => {
    if (!currentRoute) return 'ai-tour-guide';
    switch (currentRoute) {
        case 'GuideList': return 'guide-list';
        case 'GuideChat': return 'ai-tour-guide';
        case 'Treasure': return 'treasure';
        case 'Photo': return 'photo';
        case 'Place': return 'place';
        default: return 'ai-tour-guide';
    }
  }, [currentRoute]);

  const { tourDetail, runId } = useCurrentRun();
  const { activeMarkerId } = useMapNavigationStore();
  const { data: nextSpotData } = useNextSpot(runId);

  const handleTabPress = (id: string, label: string) => {
      if (!navigationRef?.current) return;

      switch (id) {
          case 'guide-list':
              navigationRef.current.navigate('GuideList');
              break;
          case 'ai-tour-guide': {
              // Find Live Spot
              const nextSpotId = nextSpotData?.nextSpot?.spotId;
              const targetSpotId = nextSpotId || activeMarkerId;
              
              // Find title from mainMissionPath or mapSpots
              const spot = tourDetail?.mainMissionPath?.find(p => p.spotId === targetSpotId) || 
                           tourDetail?.mapSpots?.find(s => s.spotId === targetSpotId);
              
              const spotTitle = (spot as any)?.spotTitle || (spot as any)?.title || 'Guide';
              
              navigationRef.current.navigate('GuideChat', { 
                  stepId: targetSpotId?.toString(), 
                  title: spotTitle
              });
              break;
          }
          case 'treasure':
              navigationRef.current.navigate('Treasure');
              break;
          case 'photo':
              navigationRef.current.navigate('Photo');
              break;
          case 'place':
              navigationRef.current.navigate('Place');
              break;
      }
  };

  return (
    <View className="pb-2 pt-3 bg-white rounded-t-xl z-50">
      {/* 1. Drag Indicator (Grey Bar) */}
      <View className="items-center mb-4">
        <View className="w-10 h-1 rounded-full bg-gray-300" />
      </View>

      {/* 2. Scrollable Tab Carousel */}
      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 4 }}
      >
        {TABS.map((tab) => (
          <Pressable
            key={tab.id}
            onPress={() => handleTabPress(tab.id, tab.label)}
            className={`px-4 py-1.5 rounded-full border justify-center items-center ${
              activeTabId === tab.id
                ? 'bg-[#5AC8FA] border-[#5AC8FA]'
                : 'bg-white border-transparent'
            } active:opacity-70`}
          >
            <Text
              className={`text-sm font-bold ${
                activeTabId === tab.id ? 'text-white' : 'text-gray-600'
              }`}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};
