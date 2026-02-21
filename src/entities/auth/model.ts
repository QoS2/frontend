import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from './authStore';
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
  const response = await httpClient.post<LoginResponse>(
      '/api/v1/auth/login',
      data,
      { isPublic: true }
    );
  return LoginResponseSchema.parse(response);
};

const registerApi = async (data: RegisterRequest): Promise<LoginResponse> => {
  const response = await httpClient.post<LoginResponse>(
        '/api/v1/auth/register',
        data,
        { isPublic: true }
    );
  return RegisterResponseSchema.parse(response);
};

const meApi = async (): Promise<MeResponse> => {
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
