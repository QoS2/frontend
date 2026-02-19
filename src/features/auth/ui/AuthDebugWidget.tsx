import React, { useState } from 'react';
import { View, Text, Button, ScrollView } from 'react-native';
import { useAuthToken, useLogin, useRegister, useMe } from '../../../entities/auth/model';
import { useAuthStore } from '../../../entities/auth/authStore';

export const AuthDebugWidget = ({ onClose }: { onClose: () => void }) => {
  const token = useAuthToken();
  const { data: user, isLoading: isUserLoading, error: userError } = useMe();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logout = useAuthStore((state) => state.logout);

  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');

  const handleLogin = () => {
    loginMutation.mutate({ email, password });
  };

  const handleRegister = () => {
    registerMutation.mutate({ email, password, nickname: 'NewUser' });
  };

  return (
    <View className="p-4 bg-gray-100 rounded-lg m-4 border border-gray-300">
      <View className="flex-row justify-between items-center mb-2.5"> 
        <Text className="text-lg font-bold">Auth Test</Text>
        <Button title="Close" onPress={onClose} color="#666" />
      </View>
      
      <View className="mb-4 p-2.5 bg-white rounded">
        <Text>Token: {token ? '✅ Present' : '❌ Missing'}</Text>
        {token && <Text className="text-xs text-gray-500">{token.slice(0, 15)}...</Text>}
        
        <Text>User: {isUserLoading ? 'Loading...' : user ? `ID: ${user.userId}` : 'Not Logged In'}</Text>
        {userError && <Text className="text-red-500 text-xs mt-1">User Error: {JSON.stringify(userError)}</Text>}
      </View>

      <View className="mb-2.5">
        <Button 
          title={loginMutation.isPending ? "Logging in..." : "Login (Mock)"} 
          onPress={handleLogin} 
          disabled={loginMutation.isPending}
        />
        <View className="h-2.5" />
        <Button 
          title={registerMutation.isPending ? "Registering..." : "Register (Mock)"} 
          onPress={handleRegister} 
          disabled={registerMutation.isPending}
        />
        <View className="h-2.5" />
        <Button 
          title="Logout" 
          onPress={logout} 
          color="red"
        />
      </View>

      {loginMutation.error && (
        <Text className="text-red-500 text-xs mt-1">Login Error: {JSON.stringify(loginMutation.error)}</Text>
      )}
    </View>
  );
};
