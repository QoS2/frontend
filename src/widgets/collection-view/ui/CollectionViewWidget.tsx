import React, { useState } from 'react';
import { View, ScrollView, Pressable, Image, Dimensions } from 'react-native';
import { ChevronLeft, Volume2 } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { Text } from '@shared/ui';

export interface CollectionItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  audioUrl?: string; // Optional (PhotoSpot에는 없음)
}

interface CollectionViewWidgetProps {
  title: string;
  items: CollectionItem[];
  renderHeaderRight?: () => React.ReactNode; 
}

export function CollectionViewWidget({
  title,
  items,
  renderHeaderRight,
}: CollectionViewWidgetProps) {
  const [selectedItem, setSelectedItem] = useState<CollectionItem | null>(null);

  const handleBack = () => {
    setSelectedItem(null);
  };

  return (
    <View className="flex-1 bg-gray-50 pt-4">
      {/* 1. Content Area */}
      <View className="flex-1 px-6">
        {!selectedItem ? (
          /* --- Grid List View --- */
          <Animated.View exiting={FadeOut} entering={FadeIn} layout={Layout}>
            <View className="flex-row items-center justify-between mb-4 mt-2">
              <View className="flex-row items-center">
                <Text className="text-xl font-extrabold text-gray-900 mr-2">
                  {title}
                </Text>
                <View className="bg-gray-200 px-2.5 py-0.5 rounded-full">
                  <Text className="text-xs font-bold text-gray-500">
                    {items.length}/10
                  </Text>
                </View>
              </View>
              {renderHeaderRight && renderHeaderRight()}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="flex-row flex-wrap justify-between pb-20">
                {items.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => setSelectedItem(item)}
                    className="w-[48%] aspect-square bg-white rounded-2xl mb-4 border border-gray-100 shadow-sm active:opacity-90 overflow-hidden"
                  >
                     <Image 
                        source={{ uri: item.imageUrl }}
                        className="w-full h-full"
                        resizeMode="cover"
                     />
                     <View className="absolute bottom-0 left-0 right-0 p-3 bg-white/90">
                        <Text className="font-bold text-gray-800 text-xs" numberOfLines={1}>{item.title}</Text>
                     </View>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </Animated.View>
        ) : (
          /* --- Detail View --- */
          <Animated.View entering={FadeIn} exiting={FadeOut} className="flex-1 pt-4">
            {/* Back Button */}
            <Pressable
              onPress={handleBack}
              className="mb-4 w-10 h-10 justify-center items-center bg-white rounded-full shadow-sm active:opacity-70"
            >
              <ChevronLeft size={24} color="#333" />
            </Pressable>

            {/* 3D Image Area (Floating Effect) */}
            <View className="items-center z-10 -mb-12">
               <Image 
                  source={{ uri: selectedItem.imageUrl }}
                  className="w-64 h-64"
                  resizeMode="contain"
               />
            </View>

            {/* Detail Card */}
            <View className="bg-white rounded-[30px] p-6 pt-16 shadow-lg border border-gray-50 w-full items-center min-h-[300px]">
                <Text className="text-gray-500 text-sm mb-1 self-start font-medium ml-2">
                  {selectedItem.subtitle}
                </Text>
                
                <View className="items-center mt-6 space-y-5">
                    <Text className="text-2xl font-extrabold text-gray-900 text-center">
                      {selectedItem.title}
                    </Text>
                    
                    {/* Audio Button (Optional) */}
                    {selectedItem.audioUrl && (
                      <Pressable className="flex-row items-center border-2 border-orange-300 px-5 py-2 rounded-full bg-white active:opacity-50">
                          <Text className="text-orange-500 font-bold mr-2 text-base">
                            Listen
                          </Text>
                          <Volume2 size={18} color="#F97316" />
                      </Pressable>
                    )}
                </View>
            </View>
          </Animated.View>
        )}
      </View>
    </View>
  );
}
