import { Link } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white">
      <View className="items-center space-y-4">
        <Text className="text-2xl font-bold text-gray-900">Quest of Seoul</Text>
        <Text className="text-gray-500 mb-8">Welcome to the adventure!</Text>

        <Link href="/map" asChild>
          <TouchableOpacity className="bg-blue-500 px-6 py-3 rounded-full">
            <Text className="text-white font-semibold">Go to Map</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}
