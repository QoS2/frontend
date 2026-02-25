import { create } from 'zustand';

type BottomSheetView = 'chat' | 'guide-list';

interface BottomSheetState {
  currentView: BottomSheetView;
  setView: (view: BottomSheetView) => void;
}

export const initialState: Pick<BottomSheetState, 'currentView'> = {
  currentView: 'chat',
};

export const useBottomSheetStore = create<BottomSheetState>((set) => ({
  ...initialState,
  setView: (view) => set({ currentView: view }),
}));
