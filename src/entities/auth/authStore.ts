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
  _hasHydrated: boolean;
  // Actions
  setAccessToken: (token: string | null) => void;
  setHasHydrated: (state: boolean) => void;
  login: (token: string) => void;
  logout: () => void;
}

// --- Store Creation ---
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      _hasHydrated: false,

      setAccessToken: (token) => set({ accessToken: token }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      login: (token) => set({ accessToken: token }),
      logout: () => {
        set({ accessToken: null });
        // 상태 초기화
        import('@features/ai-chat').then(m => m.useChatStore.getState().resetChat());
        import('@features/run-progress/runProgressStore').then(m => m.useRunProgressStore.getState().reset());
      },
    }),
    {
      name: 'auth-storage-v1',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({ accessToken: state.accessToken }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// hydration 완료 여부를 구독하는 셀렉터
export const useHasHydrated = () => useAuthStore((state) => state._hasHydrated);
