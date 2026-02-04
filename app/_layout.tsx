import { Stack } from 'expo-router';
import { QueryProvider } from '../src/app/providers/QueryProvider';
import '../global.css';

export default function RootLayout() {
  return (
    <QueryProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="step/[id]" options={{ presentation: 'modal' }} />
      </Stack>
    </QueryProvider>
  );
}
