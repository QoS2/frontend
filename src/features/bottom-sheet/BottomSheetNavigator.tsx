import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { AIChatWidget } from '@widgets/ai-chat';
import { GuideListWidget } from '@widgets/guide-list';
import { GuideChatWidget } from '@widgets/guide-chat';
import { QuestBoard } from '@widgets/quest-board';
import { useGuideContent } from '@entities/guide';

import { useMapNavigationStore } from '@features/map-navigation';
import { useEffect } from 'react';

export type BottomSheetStackParamList = {
  Chat: undefined;
  GuideList: undefined;
  GuideChat: { stepId: string; title: string };
  QuestBoard: { contentId: string };
};

const Stack = createNativeStackNavigator<BottomSheetStackParamList>();

interface BottomSheetNavigatorProps {
  onRouteChange?: (routeName: string) => void;
}

export function BottomSheetNavigator({onRouteChange}: BottomSheetNavigatorProps) {
  const navigationRef = React.useRef<any>(null);

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
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Chat" component={AIChatWidget} />
          <Stack.Screen name="GuideList" component={GuideListWidget} />
          <Stack.Screen name="GuideChat" component={GuideChatWidget} />
          <Stack.Screen name="QuestBoard" component={QuestBoardScreen} />
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
