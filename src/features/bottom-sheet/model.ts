import { create } from 'zustand';

type BottomSheetView = 'chat' | 'guide-list';

interface BottomSheetState {
  currentView: BottomSheetView;
  setView: (view: BottomSheetView) => void;
}

export const useBottomSheetStore = create<BottomSheetState>((set) => ({
  currentView: 'chat',
  setView: (view) => set({ currentView: view }),
}));
