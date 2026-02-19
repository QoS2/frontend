import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

// --- Secure Storage Implementation ---
// Adapter to make SecureStore compatible with Zustand's StateStorage
const secureStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return SecureStore.getItemAsync(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    return SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    return SecureStore.deleteItemAsync(name);
  },
};

// --- Auth Store Interface ---
interface AuthState {
  accessToken: string | null;
  // Actions
  setAccessToken: (token: string | null) => void;
  login: (token: string) => void;
  logout: () => void;
}

// --- Store Creation ---
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,

      setAccessToken: (token) => set({ accessToken: token }),
      login: (token) => set({ accessToken: token }),
      logout: () => {
        set({ accessToken: null });
        // Optional: Clear other auth-related state if needed
      },
    }),
    {
      name: 'auth-storage-v1', // Unique name for storage key
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({ accessToken: state.accessToken }), // Only persist accessToken
    }
  )
);
