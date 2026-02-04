import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { AROverlay } from '../src/features/ar-overlay';
import { Text } from '../src/shared/ui/Text';

export default function PhotoSpotScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-black">
      <AROverlay overlayImageUrl="https://placehold.co/400x400/png?text=Photo+Guide" />
      
      {/* UI Overlays */}
      <View className="absolute top-12 left-4">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="bg-black/50 px-4 py-2 rounded-full"
        >
          <Text className="text-white font-bold">Close</Text>
        </TouchableOpacity>
      </View>

      <View className="absolute bottom-12 left-0 right-0 items-center">
        <TouchableOpacity className="w-20 h-20 bg-white rounded-full border-4 border-gray-300 items-center justify-center">
          <View className="w-16 h-16 bg-white rounded-full border-2 border-gray-100" />
        </TouchableOpacity>
        <Text className="text-white mt-4 font-bold shadow-lg">Align with the guide and shoot!</Text>
      </View>
    </View>
  );
}
