import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { AIChatWidget } from '@widgets/ai-chat';
import { GuideListWidget } from '@widgets/guide-list';
import { GuideChatWidget } from '@widgets/guide-chat';

export type BottomSheetStackParamList = {
  Chat: undefined;
  GuideList: undefined;
  GuideChat: { stepId: string; title: string };
};

const Stack = createNativeStackNavigator<BottomSheetStackParamList>();

interface BottomSheetNavigatorProps {
  onRouteChange?: (routeName: string) => void;
}

export function BottomSheetNavigator({onRouteChange}: BottomSheetNavigatorProps) {
  return (
    <NavigationIndependentTree>
      <NavigationContainer
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
        </Stack.Navigator>
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}
