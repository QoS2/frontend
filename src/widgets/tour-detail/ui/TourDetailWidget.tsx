import React from 'react';
import { View, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Text } from '../../../shared/ui'; 
import { useTourDetail, useUnlockTour, useStartTour } from '../../../entities/tour/model';

interface TourDetailWidgetProps {
  tourId: number;
  onBack: () => void;
  onRunStart: (runId: number) => void;
}

export const TourDetailWidget = ({ tourId, onBack, onRunStart }: TourDetailWidgetProps) => {
  const { data: tour, isLoading, error } = useTourDetail(tourId);
  const unlockMutation = useUnlockTour();
  const startMutation = useStartTour();

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error || !tour) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500 text-lg mb-3">Failed to load tour detail</Text>
        <TouchableOpacity onPress={onBack} className="p-2.5 bg-gray-200 rounded-lg">
           <Text className="text-sm">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isLocked = tour.access.status === 'LOCKED' && !tour.access.hasAccess;
  const isRunning = tour.currentRun?.status === 'IN_PROGRESS';

  const handlePrimaryAction = () => {
    if (isLocked) {
      unlockMutation.mutate(tourId, {
        onSuccess: () => Alert.alert('Unlocked!', 'You can now start this tour.'),
        onError: () => Alert.alert('Error', 'Failed to unlock tour.'),
      });
    } else if (isRunning && tour.currentRun) {
      // Continue existing run
      onRunStart(tour.currentRun.runId);
    } else {
      // Start new run
      startMutation.mutate({ tourId, mode: 'START' }, {
        onSuccess: (data) => onRunStart(data.runId),
        onError: () => Alert.alert('Error', 'Failed to start tour.'),
      });
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero Image */}
        <Image 
          source={{ uri: tour.thumbnails[0] }} 
          className="w-full h-64 bg-gray-200"
        />
        <TouchableOpacity 
          className="absolute top-10 right-5 bg-black/50 w-9 h-9 rounded-full items-center justify-center"
          onPress={onBack}
        >
          <Text className="text-white text-lg font-bold">✕</Text>
        </TouchableOpacity>

        <View className="p-5 -mt-5 bg-white rounded-t-3xl">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-2xl font-bold text-gray-900 flex-1">{tour.title}</Text>
            {isLocked && (
              <Text className="text-red-400 font-bold bg-red-50 px-2 py-1 rounded-lg overflow-hidden">
                🔒 Locked
              </Text>
            )}
          </View>
          
          <Text className="text-gray-500 text-base leading-6 mb-5">{tour.description}</Text>
          
          <View className="flex-row bg-gray-50 rounded-xl p-4 justify-around mb-6">
            <View className="items-center">
               <Text className="text-lg font-bold text-gray-900">{tour.counts.main}</Text>
               <Text className="text-xs text-gray-400 mt-1">Spots</Text>
            </View>
            <View className="items-center">
               <Text className="text-lg font-bold text-gray-900">{tour.info.estimated_duration_min}m</Text>
               <Text className="text-xs text-gray-400 mt-1">Duration</Text>
            </View>
            <View className="items-center">
               <Text className="text-lg font-bold text-gray-900">{tour.currentRun ? 'Run' : '-'}</Text>
               <Text className="text-xs text-gray-400 mt-1">Status</Text>
            </View>
          </View>

          {/* Spots Preview */}
          <Text className="text-lg font-bold mb-3 text-gray-900">Course Preview</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            {tour.mapSpots.map((spot) => (
              <View key={spot.spotId} className="w-28 mr-3">
                <Image 
                  source={{ uri: spot.thumbnailUrl || 'https://via.placeholder.com/100' }} 
                  className="w-28 h-20 rounded-lg bg-gray-200 mb-2"
                />
                <Text className="text-xs font-medium text-gray-800" numberOfLines={1}>{spot.title}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Footer Action */}
      <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 pb-8">
        <TouchableOpacity 
          className={`py-4 rounded-xl items-center ${isLocked ? 'bg-red-600' : 'bg-blue-600'}`}
          onPress={handlePrimaryAction}
          disabled={unlockMutation.isPending || startMutation.isPending}
        >
          {unlockMutation.isPending || startMutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-base font-bold">
              {isLocked ? 'Unlock Tour' : isRunning ? 'Continue Tour' : 'Start Tour'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};
