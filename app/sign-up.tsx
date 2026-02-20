import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import { useRegister } from '@entities/auth/model';

export default function SignUpPage() {
  const router = useRouter();
  const { mutate: register, isPending, error } = useRegister();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Focus states
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isNicknameFocused, setIsNicknameFocused] = useState(false);

  const handleSignUp = () => {
    register({ email, password, nickname }, {
      onSuccess: () => {
        // Automatically redirects through Stack.Protected after setting token
      }
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-6">
      
      {/* Top Navigation */}
      <View className="mt-4 mb-6">
        <TouchableOpacity onPress={() => router.back()} hitSlop={15} className="w-10 h-10 justify-center">
          <ArrowLeft size={24} color="#0f172a" />
        </TouchableOpacity>
      </View>

      <View className="flex-1">
        
        {/* Header Section */}
        <View className="mb-10">
          <Text className="text-3xl font-bold text-slate-900">
            계정 만들기
          </Text>
          <Text className="text-base text-slate-500 mt-2">
            서울 탐험을 시작하기 위한 준비
          </Text>
        </View>

        {/* Form Section */}
        <View className="gap-4">
          
          {/* Email Input */}
          <View 
            className={`flex-row items-center border rounded-2xl px-4 py-3.5 ${
              isEmailFocused ? 'bg-white border-blue-500 shadow-sm' : 'bg-slate-50 border-slate-200'
            }`}
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
            className={`flex-row items-center border rounded-2xl px-4 py-3.5 ${
              isPasswordFocused ? 'bg-white border-blue-500 shadow-sm' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <Lock size={20} color={isPasswordFocused ? '#3b82f6' : '#94a3b8'} />
            <TextInput
              className="flex-1 mx-3 text-base text-slate-900"
              placeholder="비밀번호 (8자 이상)"
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

          {/* Nickname Input */}
          <View 
            className={`flex-row items-center border rounded-2xl px-4 py-3.5 ${
              isNicknameFocused ? 'bg-white border-blue-500 shadow-sm' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <User size={20} color={isNicknameFocused ? '#3b82f6' : '#94a3b8'} />
            <TextInput
              className="flex-1 ml-3 text-base text-slate-900"
              placeholder="닉네임 (선택)"
              placeholderTextColor="#94a3b8"
              value={nickname}
              onChangeText={setNickname}
              onFocus={() => setIsNicknameFocused(true)}
              onBlur={() => setIsNicknameFocused(false)}
            />
          </View>

          {/* Error Message */}
          {error && (
            <Text className="text-red-500 text-sm mt-1 px-1">
              {error.message || '회원가입에 실패했습니다.'}
            </Text>
          )}

          {/* Sign Up Button */}
          <TouchableOpacity
            className="bg-blue-600 rounded-2xl py-4 mt-4 items-center justify-center flex-row shadow-sm shadow-blue-200"
            activeOpacity={0.8}
            onPress={handleSignUp}
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-base">가입하기</Text>
            )}
          </TouchableOpacity>
        </View>

      </View>

      {/* Footer Section */}
      <View className="mb-8 items-center justify-center flex-row">
        <Text className="text-slate-500 text-base">이미 계정이 있으신가요? </Text>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Text className="text-blue-600 font-bold text-base">로그인</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
