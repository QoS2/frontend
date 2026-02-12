import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import {View, Pressable} from 'react-native';
import {ChevronLeft} from 'lucide-react-native';
import {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import { Text } from '@shared/ui';
import type { BottomSheetStackParamList } from '@features/bottom-sheet';

type GuideChatRouteProp = RouteProp<BottomSheetStackParamList, 'GuideChat'>;

export function GuideChatWidget() {
  const route = useRoute<GuideChatRouteProp>();
  const navigation = useNavigation();
  const { stepId, title } = route.params;

  return (
    <View className="flex-1 bg-white">
      {/* 헤더 */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
        <Pressable onPress={() => navigation.goBack()} className="active:opacity-70">
          <ChevronLeft size={24} color="#000" />
        </Pressable>
        <Text className="ml-3 text-lg font-bold">{title}</Text>
      </View>

      {/* 채팅 메시지 영역 */}
      <BottomSheetScrollView className="flex-1 px-4">
        <Text className="text-center text-gray-500 mt-4">
          {stepId} 채팅 시작
        </Text>
        {/* TODO: 실제 채팅 메시지 렌더링 */}
      </BottomSheetScrollView>
    </View>
  );
}
