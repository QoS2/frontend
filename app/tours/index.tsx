import React from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TourListWidget } from '../../src/widgets/tour-list/ui/TourListWidget';

import { useState } from 'react';
import { AuthDebugWidget } from '../../src/features/auth/ui/AuthDebugWidget';
import { TouchableOpacity, Text, View } from 'react-native';

export default function TourListPage() {
  const router = useRouter();
  const [showDebug, setShowDebug] = useState(false);

  const handleTourPress = (tourId: number) => {
    router.push(`/tours/${tourId}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <TourListWidget onTourPress={handleTourPress} />
      
      {/* Settings Button */}
      <TouchableOpacity 
        className="absolute bottom-8 left-5 w-11 h-11 bg-white rounded-full justify-center items-center shadow-sm z-10"
        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 }}
        onPress={() => setShowDebug(!showDebug)}
      >
        <Text className="text-xl">🔧</Text>
      </TouchableOpacity>

      {/* Debug Overlay */}
      {showDebug && (
        <View className="absolute bottom-20 left-5 right-5 z-20">
           <AuthDebugWidget onClose={() => setShowDebug(false)} />
        </View>
      )}
    </SafeAreaView>
  );
}
