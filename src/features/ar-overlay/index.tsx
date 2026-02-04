import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { Text } from '../../shared/ui/Text';

interface AROverlayProps {
  overlayImageUrl?: string;
}

export function AROverlay({ overlayImageUrl }: AROverlayProps) {
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-center mb-4">We need your permission to show the camera</Text>
        <Text 
          className="text-blue-500 font-bold"
          onPress={requestPermission}
        >
          Grant Permission
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <CameraView style={StyleSheet.absoluteFill} />
      {overlayImageUrl && (
        <View className="absolute inset-0 justify-center items-center pointer-events-none">
          <Image
            source={{ uri: overlayImageUrl }}
            className="w-64 h-64 opacity-70"
            contentFit="contain"
          />
        </View>
      )}
    </View>
  );
}
