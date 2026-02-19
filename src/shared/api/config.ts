export const API_FLAGS = {
  // false = Use Mock Data
  // true = Use Real API
  AUTH: false,
  TOUR: false,
  RUN: false,
  MISSION: false,
  COLLECTION: false,
} as const;

export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080',
  TIMEOUT: 15000,
};
