import React from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryProvider } from '../src/_app/providers/QueryProvider';
import '../global.css';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
          <Stack.Screen name="collection" options={{ headerShown: false }} />
          <Stack.Screen name="photo-spot" options={{ headerShown: false }} />
          <Stack.Screen name="step/[id]" options={{ presentation: 'modal' }} />
        </Stack>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}
