import { MapPage } from '@pages/map';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function MapScreen() {
  const { runId } = useLocalSearchParams<{ runId: string }>();
  const parsedRunId = runId ? Number(runId) : undefined;

  return (
    <View className="flex-1">
      <MapPage runId={parsedRunId} />
    </View>
  );
}