import { create } from 'zustand';

interface PopupInfo {
  type: 'PHOTO' | 'TREASURE';
  markerId: string;
  markerTitle: string;
}

interface DiscoveryPopupState {
  popupInfo: PopupInfo | null;
  /**
   * If true, it means the user has dismissed the popup for a specific marker session.
   * This is to prevent the popup from reappearing immediately while still inside the geofence.
   */
  dismissedMarkerId: string | null;

  showPopup: (info: PopupInfo) => void;
  dismissPopup: () => void;
  clearDismissed: () => void;
}

export const initialState: Pick<DiscoveryPopupState, 'popupInfo' | 'dismissedMarkerId'> = {
  popupInfo: null,
  dismissedMarkerId: null,
};

export const useDiscoveryPopupStore = create<DiscoveryPopupState>((set) => ({
  ...initialState,

  showPopup: (info) => set({ popupInfo: info }),
  dismissPopup: () => set((state) => ({ 
    popupInfo: null, 
    dismissedMarkerId: state.popupInfo?.markerId || null 
  })),
  clearDismissed: () => set({ dismissedMarkerId: null }),
}));
