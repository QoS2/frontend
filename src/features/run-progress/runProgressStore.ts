import { create } from 'zustand';

export interface TargetSpot {
  spotId: number;
  title: string;
  lat: number;
  lng: number;
  radiusM: number;
  orderIndex?: number;
}

interface RunProgressState {
  currentTarget: TargetSpot | null;
  isAtTarget: boolean;
  completedSpotIds: number[];
  
  setCurrentTarget: (target: TargetSpot | null) => void;
  setIsAtTarget: (value: boolean) => void;
  markCompleted: (spotId: number) => void;
  reset: () => void;
}

export const useRunProgressStore = create<RunProgressState>((set) => ({
  currentTarget: null,
  isAtTarget: false,
  completedSpotIds: [],

  setCurrentTarget: (target) => set({ currentTarget: target }),
  setIsAtTarget: (value) => set({ isAtTarget: value }),
  markCompleted: (spotId) => set((state) => ({
    completedSpotIds: state.completedSpotIds.includes(spotId) 
      ? state.completedSpotIds 
      : [...state.completedSpotIds, spotId]
  })),
  reset: () => set({ currentTarget: null, isAtTarget: false, completedSpotIds: [] }),
}));
