import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserProgressState {
  currentStepId: string | null;
  visitedPlaceIds: string[];
  textProgressIndex: number;
  completedQuestIds: string[];
  inventory: any[]; // Define specific type if needed
  totalMint: number;

  // Actions
  setCurrentStep: (stepId: string | null) => void;
  addVisitedPlace: (placeId: string) => void;
  updateTextProgress: (index: number) => void;
  completeQuest: (questId: string, reward: number) => void;
}

export const useUserProgress = create<UserProgressState>()(
  persist(
    (set) => ({
      currentStepId: null,
      visitedPlaceIds: [],
      textProgressIndex: 0,
      completedQuestIds: [],
      inventory: [],
      totalMint: 0,

      setCurrentStep: (stepId) => set({ currentStepId: stepId }),
      addVisitedPlace: (placeId) =>
        set((state) => ({
          visitedPlaceIds: [...new Set([...state.visitedPlaceIds, placeId])],
        })),
      updateTextProgress: (index) => set({ textProgressIndex: index }),
      completeQuest: (questId, reward) =>
        set((state) => ({
          completedQuestIds: [...new Set([...state.completedQuestIds, questId])],
          totalMint: state.totalMint + reward,
        })),
    }),
    {
      name: 'user-progress-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
