import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from './authStore';
import { API_FLAGS } from '../../shared/api/config';
import { httpClient } from '../../shared/api/httpClient';
import {
  LoginRequest,
  LoginResponse,
  LoginResponseSchema,
  RegisterRequest,
  RegisterResponseSchema,
  MeResponse,
  MeResponseSchema,
  ApiError,
} from '../../shared/api/auth.contracts';

// --- API Functions (Internal) ---

const loginApi = async (data: LoginRequest): Promise<LoginResponse> => {
  if (!API_FLAGS.AUTH) {
    // [MOCK] Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Validate mock response against schema
    return LoginResponseSchema.parse({
      accessToken: 'mock-jwt-token-xyz-123',
      expiresIn: 86400,
      tokenType: 'Bearer',
    });
  }
  
  // [REAL]
  const response = await httpClient.post<LoginResponse>(
      '/api/v1/auth/login',
      data,
      { isPublic: true }
    );
  return LoginResponseSchema.parse(response);
};

const registerApi = async (data: RegisterRequest): Promise<LoginResponse> => {
  if (!API_FLAGS.AUTH) {
    // [MOCK]
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return RegisterResponseSchema.parse({
      accessToken: 'mock-jwt-token-register-abc',
      expiresIn: 86400,
      tokenType: 'Bearer',
    });
  }

  // [REAL]
  const response = await httpClient.post<LoginResponse>(
        '/api/v1/auth/register',
        data,
        { isPublic: true }
    );
  return RegisterResponseSchema.parse(response);
};

const meApi = async (): Promise<MeResponse> => {
  if (!API_FLAGS.AUTH) {
    // [MOCK]
    await new Promise((resolve) => setTimeout(resolve, 500));
    return MeResponseSchema.parse({
      userId: '550e8400-e29b-41d4-a716-446655440000', // Mock UUID
    });
  }

  // [REAL]
  const response = await httpClient.get<unknown>('/api/v1/auth/me');
  return MeResponseSchema.parse(response);
};

// --- React Query Hooks ---

export const useAuthToken = () => useAuthStore((state) => state.accessToken);

export const useLogin = () => {
  const login = useAuthStore((state) => state.login);
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, ApiError, LoginRequest>({
    mutationFn: loginApi,
    onSuccess: (data) => {
      // 1. Store token
      login(data.accessToken);
      // 2. Invalidate user query
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
};

export const useRegister = () => {
  const login = useAuthStore((state) => state.login);
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, ApiError, RegisterRequest>({
    mutationFn: registerApi,
    onSuccess: (data) => {
      login(data.accessToken);
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
};

export const useMe = () => {
  const accessToken = useAuthToken();
  const logout = useAuthStore((state) => state.logout);

  return useQuery<MeResponse, ApiError>({
    queryKey: ['auth', 'me'],
    queryFn: meApi,
    enabled: !!accessToken,
    retry: false, // Don't retry on 401
  });
};
