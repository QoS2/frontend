import { MapPage } from '@pages/map';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function MapScreen() {
  const { runId, tourId } = useLocalSearchParams<{ runId: string; tourId: string }>();
  const parsedRunId = runId ? Number(runId) : undefined;
  const parsedTourId = tourId ? Number(tourId) : undefined;

  return (
    <View className="flex-1">
      <MapPage runId={parsedRunId} tourId={parsedTourId} />
    </View>
  );
}