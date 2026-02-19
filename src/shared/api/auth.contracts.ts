import { z } from 'zod';

// --- Common Error Schema ---
export const ApiErrorSchema = z.object({
  error: z.string(),
  errorCode: z.string(),
  message: z.string(),
  timestamp: z.string().optional(),
  path: z.string().optional(),
  errors: z.record(z.string(), z.string()).optional(), // Field-specific errors
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

// --- Auth Schemas ---

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  expiresIn: z.number(),
  tokenType: z.enum(['Bearer']),
});

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  nickname: z.string().min(1, 'Nickname is required'),
});

export const RegisterResponseSchema = LoginResponseSchema; // Same response structure

export const MeResponseSchema = z.object({
  userId: z.string().uuid(),
  // Add other user fields as needed in the future
});

export const TokenResponseSchema = LoginResponseSchema; // OAuth exchange response

// --- Types ---
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
export type MeResponse = z.infer<typeof MeResponseSchema>;
export type TokenResponse = z.infer<typeof TokenResponseSchema>;
