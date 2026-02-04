import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Text } from '../../src/shared/ui/Text';

export default function StepDetailScreen() {
  const { id } = useLocalSearchParams();
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-xl">Step Detail: {id}</Text>
    </View>
  );
}
