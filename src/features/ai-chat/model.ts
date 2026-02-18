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
  activeContentId: string | null;
  guideProgress: Record<string, number>; // contentId -> segmentIndex

  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setStreaming: (isStreaming: boolean) => void;
  streamReply: (fullText: string) => void;
  welcomeMarker: (marker: { id: string; title: string; description: string }) => void;
  markAsWelcomed: (markerId: string) => void;
  
  // New Methods for Guide Persistence
  startGuide: (contentId: string) => void;
  updateProgress: (contentId: string, index: number) => void;
  resetChat: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isStreaming: false,
  welcomedMarkerIds: [],
  activeContentId: null,
  guideProgress: {},

  addMessage: (msg) =>
    set((state) => {
      // Idempotency: Don't add identical content twice in a row
      const lastMsg = state.messages[state.messages.length - 1];
      if (
        lastMsg &&
        lastMsg.sender === msg.sender &&
        lastMsg.type === msg.type &&
        lastMsg.text === msg.text
      ) {
          // If actions exist, compare them too
          if (!msg.actions || JSON.stringify(msg.actions) === JSON.stringify(lastMsg.actions)) {
            return state;
          }
      }

      return {
        messages: [
            ...state.messages,
            {
                ...msg,
                id: Math.random().toString(36).substring(7),
                timestamp: Date.now(),
            },
        ],
      };
    }),

  setStreaming: (isStreaming) => set({ isStreaming }),

  streamReply: (fullText) => {
    // Prevent duplicate streams or empty text
    if (!fullText || get().isStreaming) return; 
    
    // Idempotency check: don't restart same text if it's already the last message
    const lastMsg = get().messages[get().messages.length - 1];
    if (lastMsg?.sender === 'ai' && lastMsg.text === fullText) return;

    const id = Math.random().toString(36).substring(7);
    const timestamp = Date.now();

    set((state) => ({
      isStreaming: true,
      messages: [...state.messages, { id, sender: 'ai', type: 'text', text: '', timestamp }]
    }));
    
    let currentText = '';
    const speed = 10; 
    let charIndex = 0;

    const interval = setInterval(() => {
      if (charIndex < fullText.length) {
        currentText += fullText[charIndex];
        charIndex++;
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
    // Legacy support or specific use case
    const { welcomedMarkerIds, messages, streamReply, markAsWelcomed } = get();
    if (messages.length === 0 && !welcomedMarkerIds.includes(marker.id)) {
      markAsWelcomed(marker.id);
      streamReply(`Welcome to ${marker.title}! ${marker.description}`);
    }
  },


  startGuide: (contentId) => {
      const { activeContentId } = get();
      if (activeContentId !== contentId) {
          // New guide started: clear everything
          set({ 
              messages: [], 
              activeContentId: contentId,
              isStreaming: false 
          });
      }
      // If same guide, do nothing (preserve messages)
  },

  updateProgress: (contentId, index) => 
      set((state) => ({
          guideProgress: { ...state.guideProgress, [contentId]: index }
      })),

  markAsWelcomed: (markerId) => 
    set((state) => ({ 
      welcomedMarkerIds: Array.from(new Set([...state.welcomedMarkerIds, markerId])) 
    })),

  resetChat: () => set({ 
      messages: [], 
      welcomedMarkerIds: [], 
      activeContentId: null, 
      guideProgress: {},
      isStreaming: false
  }),
}));
