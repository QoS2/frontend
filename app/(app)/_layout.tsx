import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '@entities/auth/authStore';

export default function AppLayout() {
  const accessToken = useAuthStore((state) => state.accessToken);

  if (!accessToken) {
    return <Redirect href="/sign-in" />;
  }

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
