import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { BottomSheetHandleProps } from '@gorhom/bottom-sheet';
import Animated, { useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';

// 탭 데이터 정의
const TABS = [
  { id: 'guide-list', label: 'Guide List', active: false },
  { id: 'ai-tour-guide', label: 'AI Tour Guide', active: true }, // 기본 활성화 (예시)
  { id: 'place', label: 'Place', active: false },
  { id: 'treasure', label: 'Treasure', active: false },
  { id: 'photo', label: 'Photo Spot', active: false },
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

  const handleTabPress = (id: string, label: string) => {
      if (!navigationRef?.current) return;

      switch (id) {
          case 'guide-list':
              navigationRef.current.navigate('GuideList');
              break;
          case 'ai-tour-guide':
              navigationRef.current.navigate('GuideChat');
              break;
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

  const containerStyle = useMemo(() => ({
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    backgroundColor: 'white',
  }), []);

  return (
    <View style={containerStyle} className="pb-2 pt-3 bg-white rounded-t-xl z-50">
      {/* 1. Drag Indicator (Grey Bar) */}
      <View className="items-center mb-4">
        <View className="w-10 h-1 rounded-full bg-gray-300" />
      </View>

      {/* 2. Scrollable Tabs */}
      <View className="h-10">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
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
    </View>
  );
};
