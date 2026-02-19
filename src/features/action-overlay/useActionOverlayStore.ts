import { create } from 'zustand';

interface ActionInfo {
  type: string;
  contentId: string;
  questId?: string;
  targetName?: string;
  rewardId?: string;
  runId?: number;
}

interface ActionOverlayState {
  activeAction: ActionInfo | null;
  openAction: (action: ActionInfo) => void;
  closeAction: () => void;
}

export const useActionOverlayStore = create<ActionOverlayState>((set) => ({
  activeAction: null,
  openAction: (action) => set({ activeAction: action }),
  closeAction: () => set({ activeAction: null }),
}));
