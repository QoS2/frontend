import React from 'react';
import { View, ScrollView, FlatList } from 'react-native';
import { Text } from '../../shared/ui/Text';
import { useUserProgress } from '../../entities/user/model';
import { useLocationMarkers } from '../../entities/location/model';

export function CollectionPage() {
  const { completedQuestIds, visitedPlaceIds, totalMint } = useUserProgress();
  const { data: markers } = useLocationMarkers();

  const collectedItems = markers?.filter(m => visitedPlaceIds.includes(m.id) || completedQuestIds.includes(m.id)) ?? [];

  return (
    <View className="flex-1 bg-white p-4">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-2xl font-bold">My Collection</Text>
        <View className="bg-yellow-100 px-3 py-1 rounded-full">
          <Text className="text-yellow-700 font-bold">{totalMint} Mint</Text>
        </View>
      </View>

      <FlatList
        data={collectedItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="flex-row items-center mb-4 p-3 bg-gray-50 rounded-xl">
             <View className="w-12 h-12 bg-gray-200 rounded-full mr-4" />
             <View>
               <Text className="font-bold">{item.title}</Text>
               <Text className="text-gray-500 text-sm">{item.type}</Text>
             </View>
          </View>
        )}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-20">
            <Text className="text-gray-400">No items collected yet.</Text>
          </View>
        }
      />
    </View>
  );
}
