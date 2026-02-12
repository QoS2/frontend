import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { AIChatWidget } from '@widgets/ai-chat';
import { GuideListWidget } from '@widgets/guide-list';
import { GuideChatWidget } from '@widgets/guide-chat';
import { QuestBoard } from '@widgets/quest-board';
import { useGuideContent } from '@entities/guide';
import { CollectionPage } from '@pages/collection/ui/CollectionPage';
import { PhotoSpotPage } from '@pages/photo-spot/ui/PhotoSpotPage';
import { PlacePage } from '@pages/place/ui/PlacePage';

import { useMapNavigationStore } from '@features/map-navigation';
import { useEffect } from 'react';

export type BottomSheetStackParamList = {
  Chat: undefined;
  GuideList: undefined;
  GuideChat: { stepId: string; title: string };
  QuestBoard: { contentId: string };
  Place: undefined;
  Treasure: undefined;
  Photo: undefined;
};

const Stack = createNativeStackNavigator<BottomSheetStackParamList>();

interface BottomSheetNavigatorProps {
  onRouteChange?: (routeName: string) => void;
  navigationRef?: any;
}

export function BottomSheetNavigator({onRouteChange, navigationRef}: BottomSheetNavigatorProps) {
  
  return (
    <NavigationIndependentTree>
      <NavigationContainer
        ref={navigationRef}
        onStateChange={(state) => {
          const currentRoute = state?.routes[state.index];
          if (currentRoute && onRouteChange) {
            onRouteChange(currentRoute.name);
          }
        }}
      >
        <Stack.Navigator
          id="BottomSheetStack"
          screenOptions={{
            headerShown: false,
            animation: 'fade',
          }}
        >
          <Stack.Screen name="Chat" component={AIChatWidget} />
          <Stack.Screen name="GuideList" component={GuideListWidget} />
          <Stack.Screen name="GuideChat" component={GuideChatWidget} />
          <Stack.Screen name="QuestBoard" component={QuestBoardScreen} />
          <Stack.Screen name="Place" component={PlacePage} />
          <Stack.Screen name="Treasure" component={CollectionPage} />
          <Stack.Screen name="Photo" component={PhotoSpotPage} />
        </Stack.Navigator>
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}

function QuestBoardScreen({ route }: any) {
  const { contentId } = route.params;
  const { data: guideContent, isLoading } = useGuideContent(contentId);

  if (isLoading || !guideContent) return null;

  return <QuestBoard quests={guideContent.quests} />;
}
