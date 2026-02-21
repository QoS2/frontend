import { create } from 'zustand';

interface TourState {
  activeTourId: number | null;
  setActiveTourId: (id: number | null) => void;
}

export const useTourStore = create<TourState>((set) => ({
  activeTourId: null,
  setActiveTourId: (id) => set({ activeTourId: id }),
}));
