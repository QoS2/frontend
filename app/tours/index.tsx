import React from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TourListWidget } from '../../src/widgets/tour-list/ui/TourListWidget';

export default function TourListPage() {
  const router = useRouter();

  const handleTourPress = (tourId: number) => {
    router.push(`/tours/${tourId}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <TourListWidget onTourPress={handleTourPress} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
