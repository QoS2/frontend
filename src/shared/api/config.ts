export const API_FLAGS = {
  // false = Use Mock Data
  // true = Use Real API
  AUTH: false,
  TOUR: true,
  RUN: true,
  CHAT: true,
  MISSION: true,
  COLLECTION: true,
  GUIDE: true,
  LOCATION: true,
  SPOT: true,
} as const;

export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080',
  TIMEOUT: 15000,
};
