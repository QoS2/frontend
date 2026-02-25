import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserProgress, initialState as userProgressInitial } from '../../entities/user/model';
import { useTourStore, initialState as tourInitial } from '../../entities/tour/store';
import { useChatStore, initialState as chatInitial } from '../../features/ai-chat/model';
import { useRunProgressStore, initialState as runProgressInitial } from '../../features/run-progress/runProgressStore';
import { useMapNavigationStore, initialState as mapNavigationInitial } from '../../features/map-navigation/model';
import { useDiscoveryPopupStore, initialState as discoveryPopupInitial } from '../../features/discovery-popup/model';
import { useActionOverlayStore, initialState as actionOverlayInitial } from '../../features/action-overlay/useActionOverlayStore';
import { useBottomSheetStore, initialState as bottomSheetInitial } from '../../features/bottom-sheet/model';

export function resetAllStores() {
  console.log('[resetAllStores] Starting store reset...');

  // 1. In-memory stores - 초기 상태로 리셋
  useTourStore.setState(tourInitial);
  useChatStore.setState(chatInitial);
  useRunProgressStore.setState(runProgressInitial);
  useMapNavigationStore.setState(mapNavigationInitial);
  useDiscoveryPopupStore.setState(discoveryPopupInitial);
  useActionOverlayStore.setState(actionOverlayInitial);
  useBottomSheetStore.setState(bottomSheetInitial);

  // 2. Persisted store - 메모리 상태를 먼저 리셋하고, AsyncStorage를 직접 삭제
  //    persist.clearStorage()는 비동기이므로 persist 미들웨어의 자동 저장과 
  //    Race Condition이 발생할 수 있음. 
  //    따라서 AsyncStorage에서 키를 직접 삭제하여 확실히 제거.
  useUserProgress.setState(userProgressInitial);
  AsyncStorage.removeItem('user-progress-storage')
    .then(() => console.log('[resetAllStores] AsyncStorage user-progress-storage removed'))
    .catch((err) => console.error('[resetAllStores] Failed to remove user-progress-storage:', err));

  console.log('[resetAllStores] All stores reset complete');
}
