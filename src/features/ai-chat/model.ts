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
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setStreaming: (isStreaming: boolean) => void;
  streamReply: (fullText: string) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isStreaming: false,

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

    set({ isStreaming: true });

    // Add empty message first
    set((state) => ({
      messages: [...state.messages, { id, sender: 'ai', type: 'text', text: '', timestamp }],
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

  clearMessages: () => set({ messages: [] }),
}));
