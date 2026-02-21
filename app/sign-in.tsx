import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Redirect } from 'expo-router';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useLogin, useAuthToken } from '@entities/auth/model';

export default function SignInPage() {
  const accessToken = useAuthToken();
  const { mutate: login, isPending, error } = useLogin();

  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('test@example.com');
  const [showPassword, setShowPassword] = useState(false);

  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  if (accessToken) {
    return <Redirect href="/(app)/tours" />;
  }

  const handleSignIn = () => {
    login({ email, password }, {
      onSuccess: () => {}
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-6">
      <View className="flex-1 justify-center">

        {/* Header Section */}
        <View className="mb-10 items-center">
          <Text className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Quest of Seoul
          </Text>
          <Text className="text-lg text-slate-500 mt-2">
            서울의 숨겨진 이야기 속으로
          </Text>
        </View>

        {/* Form Section */}
        <View className="gap-4">
          {/* Email Input - 동적 className 대신 style prop 사용 (NativeWind CssInterop 충돌 방지) */}
          <View
            className="flex-row items-center border rounded-2xl px-4 py-3.5"
            style={isEmailFocused ? styles.inputFocused : styles.inputDefault}
          >
            <Mail size={20} color={isEmailFocused ? '#3b82f6' : '#94a3b8'} />
            <TextInput
              className="flex-1 ml-3 text-base text-slate-900"
              placeholder="이메일 주소"
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setIsEmailFocused(true)}
              onBlur={() => setIsEmailFocused(false)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password Input */}
          <View
            className="flex-row items-center border rounded-2xl px-4 py-3.5"
            style={isPasswordFocused ? styles.inputFocused : styles.inputDefault}
          >
            <Lock size={20} color={isPasswordFocused ? '#3b82f6' : '#94a3b8'} />
            <TextInput
              className="flex-1 mx-3 text-base text-slate-900"
              placeholder="비밀번호"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={10}>
              {showPassword ? (
                <EyeOff size={20} color="#94a3b8" />
              ) : (
                <Eye size={20} color="#94a3b8" />
              )}
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          {error && (
            <Text className="text-red-500 text-sm mt-1 px-1">
              {error.message || '로그인에 실패했습니다.'}
            </Text>
          )}

          {/* Login Button */}
          <TouchableOpacity
            className="bg-blue-600 rounded-2xl py-4 mt-2 items-center justify-center flex-row shadow-sm shadow-blue-200"
            activeOpacity={0.8}
            onPress={handleSignIn}
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-base">로그인</Text>
            )}
          </TouchableOpacity>
        </View>

      </View>

      {/* Footer Section */}
      <View className="mb-8 items-center justify-center flex-row">
        <Text className="text-slate-500 text-base">계정이 없으신가요? </Text>
        <TouchableOpacity onPress={() => router.push('/sign-up')} hitSlop={10}>
          <Text className="text-blue-600 font-bold text-base">회원가입</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  inputDefault: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
  },
  inputFocused: {
    backgroundColor: '#ffffff',
    borderColor: '#3b82f6',
  },
});
