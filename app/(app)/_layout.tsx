import React from 'react';
import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="tours/index" options={{ headerShown: false }} />
      <Stack.Screen name="tours/[id]" options={{ headerShown: false }} />
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
  );
}
