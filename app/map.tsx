import { MapPage } from '@pages/map';
import { useState } from 'react';
import { View, StyleSheet, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthDebugWidget } from '../src/features/auth/ui/AuthDebugWidget';

export default function MapScreen() {
  const router = useRouter();
  const [isAuthDebugVisible, setIsAuthDebugVisible] = useState(true);

  return (
    <View style={styles.container}>
      <MapPage />
      {isAuthDebugVisible ? (
        <View style={styles.debugOverlay} pointerEvents="box-none">
          <AuthDebugWidget onClose={() => setIsAuthDebugVisible(false)} />
        </View>
      ) : (
        <View style={styles.openDebugButton}>
          <Button title="🔧 Auth Debug" onPress={() => setIsAuthDebugVisible(true)} color="#666" />
          <View style={{ height: 8 }} />
          <Button title="🗺️ Tours" onPress={() => router.push('/tours')} color="#007AFF" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  debugOverlay: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 9999,
  },
  openDebugButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    padding: 4,
  },
});
