import React from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryProvider } from '../src/_app/providers/QueryProvider';
import '../global.css';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryProvider>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen
              name="map"
              options={{
                headerShown: true,
                title: 'Gwanghwamun',
                headerStyle: { backgroundColor: '#fff' },
                headerShadowVisible: false,
              }}
            />
          </Stack>
        </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
