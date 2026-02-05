import { Stack } from 'expo-router';
import { QueryProvider } from '../src/_app/providers/QueryProvider';
import '../global.css';

export default function RootLayout() {
  return (
    <QueryProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="step/[id]" options={{ presentation: 'modal' }} />
      </Stack>
    </QueryProvider>
  );
}
