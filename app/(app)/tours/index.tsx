import React from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TourListWidget } from '@widgets/tour-list/ui/TourListWidget';
import { useAuthStore } from '@entities/auth/authStore';
import { TouchableOpacity, Text, View, Alert } from 'react-native';
import { LogOut } from 'lucide-react-native';

export default function TourListPage() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleTourPress = (tourId: number) => {
    router.push(`/tours/${tourId}`);
  };

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: () => logout() }
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <View className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-gray-100">
        <Text className="text-xl font-bold bg-white text-slate-900">Available Tours</Text>
        <TouchableOpacity onPress={handleLogout} className="p-2" hitSlop={10}>
          <LogOut size={24} color="#64748b" />
        </TouchableOpacity>
      </View>
      <TourListWidget onTourPress={handleTourPress} />
    </SafeAreaView>
  );
}
