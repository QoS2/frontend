import { create } from 'zustand';

interface TourState {
  activeTourId: number | null;
  setActiveTourId: (id: number | null) => void;
}

export const initialState: Pick<TourState, 'activeTourId'> = {
  activeTourId: null,
};

export const useTourStore = create<TourState>((set) => ({
  ...initialState,
  setActiveTourId: (id) => set({ activeTourId: id }),
}));
