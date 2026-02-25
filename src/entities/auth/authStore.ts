import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { resetAllStores } from '../../shared/lib/resetAllStores';
import { queryClient } from '../../_app/providers/QueryProvider';

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
      login: (token) => {
        console.log('[AuthStore] Login triggered - cleaning up previous state');
        // 1. 토큰 교체를 가장 먼저 수행 (새 토큰으로 Refetch 하도록)
        set({ accessToken: token });
        
        // 2. 이전 계정 Zustand 상태 초기화
        resetAllStores();
        
        // 3. React Query: 캐시를 완전히 초기화(Initial State)하고 마운트된 쿼리들을 Refetch
        // invalidateQueries는 기존 데이터를 살려둔 채 background 갱신만 시도하여 라우팅과 충돌 소지가 있으나,
        // resetQueries는 메모리 내 데이터를 날리고 새롭게 로딩 상태부터 시작하도록 확실히 강제합니다.
        queryClient.resetQueries(); 
      },
      logout: () => {
        console.log('[AuthStore] Logout triggered - starting cleanup');
        set({ accessToken: null });
        
        try {
          // 모든 Zustand store 일괄 재설정
          resetAllStores();
          console.log('[AuthStore] resetAllStores completed');
        } catch (error) {
          console.error('[AuthStore] Failed to reset stores:', error);
        }

        try {
          // React Query 캐시 비우기 (clear()는 observer를 끊어버리므로 removeQueries() 사용)
          queryClient.removeQueries();
          console.log('[AuthStore] queryClient.removeQueries completed');
        } catch (error) {
          console.error('[AuthStore] Failed to clear query cache:', error);
        }
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
