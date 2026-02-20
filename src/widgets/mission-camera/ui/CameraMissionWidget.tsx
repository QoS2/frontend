import React, { useState, useRef } from 'react';
import { View, Pressable, Image, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Text } from '@shared/ui';
import { MissionStep } from '@shared/api/mission.contracts';
import { Camera, SwitchCamera, RefreshCw, Check, X } from 'lucide-react-native';
import { useSubmitMission } from '@entities/mission/model';
import { useUploadFile } from '@entities/upload/model';
import { Alert, TouchableOpacity } from 'react-native';

interface CameraMissionWidgetProps {
    mission: MissionStep;
    onCapture: (photoUrl: string) => void;
    onClose: () => void;
    onComplete: () => void;
    runId: number;
    stepId: string;
}

export function CameraMissionWidget({ mission, onCapture, onClose, onComplete, runId, stepId }: CameraMissionWidgetProps) {
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState<'back' | 'front'>('back');
    const [photo, setPhoto] = useState<string | null>(null);
    const cameraRef = useRef<CameraView>(null);

    const { mutate: uploadFile, isPending: isUploading } = useUploadFile();
    const { mutate: submitMission, isPending: isSubmitting } = useSubmitMission();

    // Permission handling
    if (!permission) {
        return <View className="flex-1 bg-black" />; // Loading permission
    }
    
    if (!permission.granted) {
        return (
            <View className="flex-1 bg-black justify-center items-center p-6">
                <Text className="text-white text-center text-lg mb-6">
                    We need your permission to show the camera
                </Text>
                <Pressable 
                    onPress={requestPermission}
                    className="bg-blue-600 px-6 py-3 rounded-xl"
                >
                    <Text className="text-white font-bold">Grant Permission</Text>
                </Pressable>
            </View>
        );
    }

    const toggleCameraFacing = () => {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    };

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const photoData = await cameraRef.current.takePictureAsync({
                    quality: 0.7,
                    base64: false, // We usually upload file, but for MVP we might mock
                });
                if (photoData?.uri) {
                    setPhoto(photoData.uri);
                }
            } catch (e) {
                console.error("Failed to take picture", e);
            }
        }
    };

    const handleRetake = () => {
        setPhoto(null);
    };

    const handleSubmit = () => {
        if (!photo) return;
        
        // 1. Upload
        uploadFile(photo, {
            onSuccess: (uploadData) => {
                console.log('Upload success', uploadData);
                // 2. Submit Mission
                submitMission({
                    runId,
                    stepId,
                    data: { missionType: 'PHOTO', photoUrl: uploadData.url }
                }, {
                    onSuccess: (result) => {
                        if (result.isCorrect) {
                            Alert.alert('Mission Complete!', result.feedback || 'Great shot!', [
                                { text: 'OK', onPress: onComplete }
                            ]);
                        } else {
                            Alert.alert('Try Again', result.feedback || 'Keep trying!');
                        }
                    },
                    onError: () => {
                        Alert.alert('Error', 'Failed to submit mission');
                    }
                });
            },
            onError: () => {
                Alert.alert('Upload Failed', 'Could not upload photo');
                // Fallback for mock/test if upload fails
                // onCapture(photo); 
            }
        });
    };

    if (photo) {
        // --- Review Mode ---
        return (
            <View className="flex-1 bg-black relative">
                <Image source={{ uri: photo }} className="flex-1" resizeMode="cover" />
                
                {/* Overlay Text */}
                <View className="absolute top-12 left-0 right-0 items-center">
                     <Text className="text-white text-lg font-bold shadow-md bg-black/30 px-4 py-1 rounded-full">
                        Review Photo
                     </Text>
                </View>

                {/* Bottom Actions */}
                <View className="absolute bottom-0 left-0 right-0 p-8 flex-row justify-between items-center bg-black/60">
                    <Pressable onPress={handleRetake} className="items-center p-2">
                        <RefreshCw size={24} color="white" />
                        <Text className="text-white mt-1 text-xs">Retake</Text>
                    </Pressable>

                    <Pressable 
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-blue-600 w-16 h-16 rounded-full items-center justify-center shadow-lg active:opacity-80"
                    >
                         {(isSubmitting || isUploading) ? (
                            <ActivityIndicator color="white" />
                         ) : (
                            <Check size={32} color="white" />
                         )}
                    </Pressable>

                    <View className="w-10" /> {/* Spacer for symmetry */}
                </View>
            </View>
        );
    }

    // --- Camera Mode ---
    return (
        <View className="flex-1 bg-black">
             {/* Header Info */}
             <View className="absolute top-0 left-0 right-0 z-10 pt-12 pb-4 px-6 bg-gradient-to-b from-black/70 to-transparent flex-row justify-between items-start">
                <TouchableOpacity onPress={onClose} className="p-2 bg-black/30 rounded-full mr-4">
                    <X color="white" size={24} />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-white text-xl font-bold text-center mb-1">
                        {mission.title}
                    </Text>
                    <Text className="text-white/80 text-sm text-center">
                        {mission.optionsJson?.instruction || mission.prompt}
                    </Text>
                </View>
                <View className="w-10" />
            </View>

            <CameraView 
                ref={cameraRef} 
                className="flex-1" 
                facing={facing}
            >
                {/* Visual Guide Frame if needed */}
                <View className="flex-1 justify-center items-center">
                    <View className="w-64 h-64 border-2 border-white/30 rounded-lg dashed-border" />
                </View>
            </CameraView>

            {/* Bottom Controls */}
            <View className="absolute bottom-0 left-0 right-0 pb-12 pt-8 px-8 flex-row justify-between items-center bg-gradient-to-t from-black/80 to-transparent">
                <View className="w-12 h-12 bg-gray-800/50 rounded-full" /> {/* Placeholder Gallery */}

                <Pressable 
                    onPress={takePicture}
                    className="w-20 h-20 rounded-full border-4 border-white items-center justify-center active:scale-95 transition-transform"
                >
                    <View className="w-16 h-16 bg-white rounded-full" />
                </Pressable>

                <Pressable onPress={toggleCameraFacing} className="w-12 h-12 bg-gray-800/50 rounded-full items-center justify-center active:bg-gray-700/50">
                    <SwitchCamera size={24} color="white" />
                </Pressable>
            </View>
        </View>
    );
}
