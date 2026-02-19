import React, { useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { usePlaceCollection, useTreasureCollection } from '@entities/collection/model';
import { CollectionItem } from '@shared/api/collection.contracts';

type TabType = 'PLACES' | 'TREASURES';

export function CollectionWidget() {
  const [activeTab, setActiveTab] = useState<TabType>('PLACES');

  const { data: placesData, isLoading: isPlacesLoading } = usePlaceCollection();
  const { data: treasuresData, isLoading: isTreasuresLoading } = useTreasureCollection();

  const isLoading = activeTab === 'PLACES' ? isPlacesLoading : isTreasuresLoading;
  const data = activeTab === 'PLACES' ? placesData?.items : treasuresData?.items;

  const renderItem = ({ item }: { item: CollectionItem }) => (
    <View className="flex-1 m-2 p-3 bg-white rounded-xl shadow-sm items-center">
      <Image
        source={{ uri: item.imageUrl || 'https://placehold.co/100x100.png' }}
        className="w-20 h-20 rounded-lg mb-2 bg-gray-100"
        resizeMode="cover"
      />
      <Text className="text-sm font-bold text-gray-800 text-center mb-1" numberOfLines={1}>
        {item.name}
      </Text>
      <Text className="text-xs text-gray-500 text-center">
        {new Date(item.acquiredAt).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header Tabs */}
      <View className="flex-row bg-white p-2 mx-4 mt-4 rounded-xl shadow-sm">
        <TouchableOpacity
          className={`flex-1 py-3 rounded-lg items-center ${activeTab === 'PLACES' ? 'bg-blue-600' : 'bg-transparent'}`}
          onPress={() => setActiveTab('PLACES')}
        >
          <Text className={`font-bold ${activeTab === 'PLACES' ? 'text-white' : 'text-gray-500'}`}>
            Places ({placesData?.totalCount || 0})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 rounded-lg items-center ${activeTab === 'TREASURES' ? 'bg-yellow-500' : 'bg-transparent'}`}
          onPress={() => setActiveTab('TREASURES')}
        >
          <Text className={`font-bold ${activeTab === 'TREASURES' ? 'text-white' : 'text-gray-500'}`}>
            Treasures ({treasuresData?.totalCount || 0})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="flex-1 px-2 pt-4">
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            numColumns={2}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center mt-20">
                <Text className="text-gray-400 text-lg">No items collected yet.</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}
