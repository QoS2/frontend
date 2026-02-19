import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
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
    <View style={styles.container}>
      <View style={styles.headerRow}> 
        <Text style={styles.header}>Auth Test</Text>
        <Button title="Close" onPress={onClose} color="#666" />
      </View>
      
      <View style={styles.statusSection}>
        <Text>Token: {token ? '✅ Present' : '❌ Missing'}</Text>
        {token && <Text style={styles.tokenText}>{token.slice(0, 15)}...</Text>}
        
        <Text>User: {isUserLoading ? 'Loading...' : user ? `ID: ${user.userId}` : 'Not Logged In'}</Text>
        {userError && <Text style={styles.errorText}>User Error: {JSON.stringify(userError)}</Text>}
      </View>

      <View style={styles.actionSection}>
        <Button 
          title={loginMutation.isPending ? "Logging in..." : "Login (Mock)"} 
          onPress={handleLogin} 
          disabled={loginMutation.isPending}
        />
        <View style={{ height: 10 }} />
        <Button 
          title={registerMutation.isPending ? "Registering..." : "Register (Mock)"} 
          onPress={handleRegister} 
          disabled={registerMutation.isPending}
        />
        <View style={{ height: 10 }} />
        <Button 
          title="Logout" 
          onPress={logout} 
          color="red"
        />
      </View>

      {loginMutation.error && (
        <Text style={styles.errorText}>Login Error: {JSON.stringify(loginMutation.error)}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    margin: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusSection: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  tokenText: {
    fontSize: 10,
    color: 'gray',
  },
  actionSection: {
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
});
