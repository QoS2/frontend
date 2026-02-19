import React from 'react';
import { View, FlatList, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
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
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load tours</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: TourListItem }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => onTourPress(item.id)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
      <View style={styles.infoContainer}>
        <View style={styles.headerRow}>
           <Text style={styles.title}>{item.title}</Text>
           {item.accessStatus === 'LOCKED' && <Text style={styles.lockedBadge}>🔒</Text>}
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>⏱ {item.estimatedDurationMin} min</Text>
          <Text style={styles.metaText}>📍 {item.counts.main} spots</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Available Tours</Text>
      <FlatList
        data={tours}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    padding: 16,
    backgroundColor: 'white',
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  itemContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnail: {
    width: '100%',
    height: 180,
    backgroundColor: '#eee',
  },
  infoContainer: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  lockedBadge: {
    fontSize: 16,
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});
