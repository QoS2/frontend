import { create } from 'zustand';
import { ChatTurn } from '@shared/api/run.contracts';

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
  
  // Turn-by-turn Session State
  activeSessionId: number | null;
  currentTurn: ChatTurn | null;
  playedTurnIds: number[];

  setCurrentTarget: (target: TargetSpot | null) => void;
  setIsAtTarget: (value: boolean) => void;
  markCompleted: (spotId: number) => void;
  setSession: (sessionId: number | null, initialTurn: ChatTurn | null) => void;
  setCurrentTurn: (turn: ChatTurn | null) => void;
  markTurnAsPlayed: (turnId: number) => void;
  reset: () => void;
}

export const initialState: Pick<RunProgressState, 'currentTarget' | 'isAtTarget' | 'completedSpotIds' | 'activeSessionId' | 'currentTurn' | 'playedTurnIds'> = {
  currentTarget: null,
  isAtTarget: false,
  completedSpotIds: [],
  activeSessionId: null,
  currentTurn: null,
  playedTurnIds: [],
};

export const useRunProgressStore = create<RunProgressState>((set) => ({
  ...initialState,

  setCurrentTarget: (target) => set({ currentTarget: target }),
  setIsAtTarget: (value) => set({ isAtTarget: value }),
  markCompleted: (spotId) => set((state) => ({
    completedSpotIds: state.completedSpotIds.includes(spotId) 
      ? state.completedSpotIds 
      : [...state.completedSpotIds, spotId]
  })),
  setSession: (sessionId, initialTurn) => set({ 
    activeSessionId: sessionId, 
    currentTurn: initialTurn,
    playedTurnIds: [] // Reset played turns for new session
  }),
  setCurrentTurn: (turn) => set({ currentTurn: turn }),
  markTurnAsPlayed: (turnId) => set((state) => ({
    playedTurnIds: state.playedTurnIds.includes(turnId)
      ? state.playedTurnIds
      : [...state.playedTurnIds, turnId]
  })),
  reset: () => set({ 
    currentTarget: null, 
    isAtTarget: false, 
    completedSpotIds: [],
    activeSessionId: null,
    currentTurn: null,
    playedTurnIds: []
  }),
}));
