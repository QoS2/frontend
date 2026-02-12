import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { Text } from '@shared/ui/Text';

interface AROverlayProps {
  overlayImageUrl?: string;
}

export interface AROverlayHandle {
  takePicture: () => Promise<string | null>;
}

export const AROverlay = forwardRef<AROverlayHandle, AROverlayProps>(
  ({ overlayImageUrl }, ref) => {
    const cameraRef = useRef<CameraView>(null);
    const [permission, requestPermission] = useCameraPermissions();

    useImperativeHandle(ref, () => ({
      takePicture: async () => {
        if (cameraRef.current) {
          try {
            const photo = await cameraRef.current.takePictureAsync({
              quality: 0.8,
              base64: false,
              exif: false,
            });
            console.log('Photo captured:', photo?.uri);
            return photo?.uri || null;
          } catch (error) {
            console.error('Failed to take picture:', error);
            return null;
          }
        }
        return null;
      },
    }));

    if (!permission) {
      return <View />;
    }

    if (!permission.granted) {
      return (
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-center mb-4">We need your permission to show the camera</Text>
          <Text className="text-blue-500 font-bold" onPress={requestPermission}>
            Grant Permission
          </Text>
        </View>
      );
    }

    return (
      <View className="flex-1">
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} />
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
  },
);
