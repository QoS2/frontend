import { create } from 'zustand';

interface MapNavigationState {
  activeMarkerId: string | null; // Marker the user is currently within radius of
  triggeredMarkerId: string | null; // Marker that has met the 3s dwell time
  
  setActiveMarkerId: (id: string | null) => void;
  setTriggeredMarkerId: (id: string | null) => void;
  reset: () => void;
}

export const useMapNavigationStore = create<MapNavigationState>((set) => ({
  activeMarkerId: null,
  triggeredMarkerId: null,

  setActiveMarkerId: (id) => set({ activeMarkerId: id }),
  setTriggeredMarkerId: (id) => set({ triggeredMarkerId: id }),
  reset: () => set({ activeMarkerId: null, triggeredMarkerId: null }),
}));
