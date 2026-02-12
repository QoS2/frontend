import { create } from 'zustand';

export type MessageType = 'text' | 'image' | 'action';

export interface ChatAction {
  label: string;
  actionId: string;
  data?: any;
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  type: MessageType;
  text?: string;
  imageUrl?: any;
  actions?: ChatAction[];
  timestamp: number;
  tags?: string[];
}

interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  welcomedMarkerIds: string[];
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setStreaming: (isStreaming: boolean) => void;
  streamReply: (fullText: string) => void;
  welcomeMarker: (marker: { id: string; title: string; description: string }) => void;
  markAsWelcomed: (markerId: string) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isStreaming: false,
  welcomedMarkerIds: [],

  addMessage: (msg) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...msg,
          id: Math.random().toString(36).substring(7),
          timestamp: Date.now(),
        },
      ],
    })),

  setStreaming: (isStreaming) => set({ isStreaming }),

  streamReply: (fullText) => {
    const id = Math.random().toString(36).substring(7);
    const timestamp = Date.now();

    // Batch initial state changes to minimize renders and prevent race conditions
    set((state) => ({
      isStreaming: true,
      messages: [...state.messages, { id, sender: 'ai', type: 'text', text: '', timestamp }]
    }));

    let currentText = '';
    const speed = 20;
    const interval = setInterval(() => {
      if (currentText.length < fullText.length) {
        currentText += fullText[currentText.length];
        set((state) => ({
          messages: state.messages.map((m) => (m.id === id ? { ...m, text: currentText } : m)),
        }));
      } else {
        clearInterval(interval);
        set({ isStreaming: false });
      }
    }, speed);
  },

  welcomeMarker: (marker) => {
    const { welcomedMarkerIds, messages, streamReply, markAsWelcomed } = get();
    
    // Final atomic check before triggering
    if (messages.length === 0 && !welcomedMarkerIds.includes(marker.id)) {
      markAsWelcomed(marker.id);
      streamReply(`Welcome to ${marker.title}! ${marker.description}`);
    }
  },

  markAsWelcomed: (markerId) => 
    set((state) => ({ 
      welcomedMarkerIds: Array.from(new Set([...state.welcomedMarkerIds, markerId])) 
    })),

  clearMessages: () => set({ messages: [], welcomedMarkerIds: [] }),
}));
