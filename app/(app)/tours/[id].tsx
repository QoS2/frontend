import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TourDetailWidget } from '@widgets/tour-detail/ui/TourDetailWidget';

export default function TourDetailPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const tourId = Number(id);

  if (isNaN(tourId)) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text>Invalid Tour ID</Text>
      </SafeAreaView>
    );
  }

  const handleBack = () => {
    router.back();
  };

  const handleRunStart = (runId: number) => {
    // Navigate to map or specialized run mode
    // For now, go back to map with run params? or just alert
    console.log('Run Started:', runId, 'Tour:', tourId);
    router.push({ pathname: '/map', params: { runId, tourId } });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <TourDetailWidget 
        tourId={tourId} 
        onBack={handleBack}
        onRunStart={handleRunStart}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
