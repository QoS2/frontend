import React, { useRef, useState, useEffect } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as MediaLibrary from 'expo-media-library';
import { AROverlay, AROverlayHandle } from '@features/ar-overlay';
import { Text } from '@shared/ui';

export function PhotoSpotPage() {
  const router = useRouter();
  const arOverlayRef = useRef<AROverlayHandle>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [libraryPermission, requestLibraryPermission] = MediaLibrary.usePermissions();

  useEffect(() => {
    if (libraryPermission && !libraryPermission.granted && libraryPermission.canAskAgain) {
      requestLibraryPermission();
    }
  }, [libraryPermission]);

  const handleCapture = async () => {
    if (isCapturing) return;

    // 권한 체크
    if (!libraryPermission?.granted) {
      const { granted } = await requestLibraryPermission();
      if (!granted) {
        Alert.alert('Permission Required', 'We need gallery permission to save your photos.');
        return;
      }
    }

    try {
      setIsCapturing(true);
      // 촬영 햅틱
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const photoUri = await arOverlayRef.current?.takePicture();

      if (photoUri) {
        // 갤러리에 저장
        await MediaLibrary.saveToLibraryAsync(photoUri);
        
        // 성공 피드백
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        console.log('Photo saved to gallery:', photoUri);
        
        Alert.alert('Success', 'Photo saved to your gallery! ✨');
      }
    } catch (error) {
      console.error('Capture flow failed:', error);
      Alert.alert('Error', 'Failed to save photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <View className="flex-1 bg-black">
      <AROverlay
        ref={arOverlayRef}
        overlayImageUrl="https://placehold.co/400x400/png?text=Photo+Guide"
      />

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
        <TouchableOpacity
          onPress={handleCapture}
          disabled={isCapturing}
          className={`w-20 h-20 bg-white rounded-full border-4 border-gray-300 items-center justify-center ${
            isCapturing ? 'opacity-50' : ''
          }`}
        >
          <View className="w-16 h-16 bg-white rounded-full border-2 border-gray-100" />
        </TouchableOpacity>
        <Text className="text-white mt-4 font-bold shadow-lg">
          {isCapturing ? 'Capturing...' : 'Align with the guide and shoot!'}
        </Text>
      </View>
    </View>
  );
}
