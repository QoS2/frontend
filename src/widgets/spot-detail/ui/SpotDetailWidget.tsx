import React from 'react';
import { View, ScrollView, Image, Pressable } from 'react-native';
import { Text } from '@shared/ui';
import { SpotDetail, GuideSegment } from '@shared/api/spot.contracts';
import { PlayCircle, MapPin, Clock } from 'lucide-react-native';

interface SpotDetailWidgetProps {
    spot: SpotDetail;
    guides: GuideSegment[];
    onClose: () => void;
}

export function SpotDetailWidget({ spot, guides, onClose }: SpotDetailWidgetProps) {
    return (
        <View className="flex-1 bg-white">
            {/* Header Image */}
            <View className="h-64 relative">
                <Image 
                    source={{ uri: spot.thumbnailUrl }} 
                    className="w-full h-full"
                    resizeMode="cover"
                />
                <Pressable 
                    onPress={onClose}
                    className="absolute top-12 right-4 bg-black/50 p-2 rounded-full"
                >
                    <Text className="text-white font-bold">Close</Text>
                </Pressable>
                
                <View className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <Text className="text-white text-3xl font-bold mb-1">{spot.title}</Text>
                    <View className="flex-row items-center space-x-4">
                        <View className="flex-row items-center">
                            <MapPin size={16} color="#ddd" />
                            <Text className="text-gray-200 ml-1 text-sm">{spot.type}</Text>
                        </View>
                        {spot.address && (
                            <View className="flex-row items-center ml-4">
                                <Text className="text-gray-200 ml-1 text-sm">{spot.address}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 py-6">
                <Text className="text-gray-600 text-lg leading-7 mb-8">
                    {spot.description}
                </Text>

                <Text className="text-xl font-bold mb-4 text-gray-900 border-l-4 border-blue-500 pl-3">
                    Guides
                </Text>
                
                <View className="space-y-4 mb-8">
                    {guides.map((guide, index) => {
                        const hasAudio = guide.assets?.some(a => a.type === 'AUDIO');
                        return (
                            <View key={guide.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex-row items-start">
                                 <View className="bg-blue-100 w-8 h-8 rounded-full items-center justify-center mr-3 mt-1">
                                    <Text className="text-blue-600 font-bold">{index + 1}</Text>
                                 </View>
                                 <View className="flex-1">
                                    <Text className="text-gray-600 leading-5">{guide.text}</Text>
                                    {hasAudio && (
                                        <Pressable className="flex-row items-center mt-3 bg-white self-start px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                                            <PlayCircle size={20} color="#2563EB" />
                                            <Text className="text-blue-600 ml-2 font-medium">Listen Audio</Text>
                                        </Pressable>
                                    )}
                                 </View>
                            </View>
                        );
                    })}
                </View>

                {/* Bottom Spacer */}
                <View className="h-24" />
            </ScrollView>
        </View>
    );
}
