import React from 'react';
import { View, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from '../../../shared/ui'; // Assuming shared UI exists
import { useTours } from '../../../entities/tour/model';
import { TourListItem } from '../../../shared/api/tour.contracts';

interface TourListWidgetProps {
  onTourPress: (tourId: number) => void;
}

export const TourListWidget = ({ onTourPress }: TourListWidgetProps) => {
  const { data: tours, isLoading, error } = useTours();

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500 text-lg">Failed to load tours</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: TourListItem }) => (
    <TouchableOpacity
      className="bg-white rounded-xl overflow-hidden mb-4 shadow-sm"
      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}
      onPress={() => onTourPress(item.id)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.thumbnailUrl }} className="w-full h-44 bg-gray-200" />
      <View className="p-4">
        <View className="flex-row justify-between items-center mb-1">
           <Text className="text-lg font-bold text-gray-800 flex-1">{item.title}</Text>
           {item.accessStatus === 'LOCKED' && <Text className="ml-2 text-base">locks</Text>}
        </View>
        <Text className="text-gray-500 text-sm mb-3" numberOfLines={2}>
          {item.description}
        </Text>
        <View className="flex-row gap-3">
          <Text className="text-xs text-gray-500 font-medium">⏱ {item.estimatedDurationMin} min</Text>
          <Text className="text-xs text-gray-500 font-medium">📍 {item.counts.main} spots</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-100">
      <Text className="text-xl font-bold p-4 bg-white">Available Tours</Text>
      <FlatList
        data={tours}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, gap: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};
