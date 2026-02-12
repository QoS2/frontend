import React from 'react';
import { View } from 'react-native';
import { Footprints } from 'lucide-react-native';
import { Text } from '@shared/ui';
import { useRouter } from 'expo-router';

interface TopNavBarProps {
  destination?: string;
  distance?: string;
}

export function TopNavBar({ destination, distance }: TopNavBarProps) {
  const router = useRouter();

  return (
    <View className="bg-white">
      {/* Movement Banner */}
      {destination && (
        <View className="bg-[#7CB9E3] flex-row items-center justify-between px-5 py-3">
          <View className="flex-row items-center flex-1">
            <Footprints size={20} color="#fff" />
            <Text className="text-white font-medium ml-2">
              Moving to {destination}
            </Text>
          </View>
          {distance && (
            <Text className="text-white font-bold">{distance}</Text>
          )}
        </View>
      )}
    </View>
  );
}
