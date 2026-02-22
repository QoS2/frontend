import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { GuideListWidget } from '@widgets/guide-list';
import { GuideChatWidget } from '@widgets/guide-chat';
import { QuestBoard } from '@widgets/quest-board';
import { CollectionPage } from '@pages/collection/ui/CollectionPage';
import { PhotoSpotPage } from '@pages/photo-spot/ui/PhotoSpotPage';
import { PlacePage } from '@pages/place/ui/PlacePage';

export type BottomSheetStackParamList = {
  GuideList: undefined;
  GuideChat: { stepId?: string; title?: string } | undefined;
  QuestBoard: { contentId: string };
  Place: { itemId?: string };
  Treasure: undefined;
  Photo: { itemId?: string };
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
          initialRouteName="GuideChat"
          screenOptions={{
            headerShown: false,
            animation: 'fade',
          }}
        >
          <Stack.Screen name="GuideChat" component={GuideChatWidget} />
          <Stack.Screen name="GuideList" component={GuideListWidget} />
          <Stack.Screen name="QuestBoard" component={QuestBoardScreen} />
          <Stack.Screen name="Place" component={PlacePage as any} />
          <Stack.Screen name="Treasure" component={CollectionPage as any} />
          <Stack.Screen name="Photo" component={PhotoSpotPage as any} />
        </Stack.Navigator>
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}

function QuestBoardScreen({ route }: any) {
  const { contentId } = route.params;
  // TODO: Fetch specific quest based on Turn data or mission step API
  const quests = [] as any[];

  return <QuestBoard quests={quests} />;
}
