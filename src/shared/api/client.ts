import {
  GetMarkersResponseSchema,
  GetContentResponseSchema,
  ChatResponseSchema,
  ChatRequest,
  LocationMarker,
  GuideContent
} from './contracts';

// Mock Data
const MOCK_MARKERS: LocationMarker[] = [
  {
    id: '1',
    type: 'PLACE',
    coordinate: { latitude: 37.5759, longitude: 126.9768 }, // Gwanghwamun
    radius: 50,
    title: 'Gwanghwamun Gate',
    description: 'The main gate of Gyeongbokgung Palace.',
    contentId: 'content-1',
    thumbnailUrl: 'https://placehold.co/100x100.png',
  },
  {
    id: '2',
    type: 'SUB_PLACE',
    coordinate: { latitude: 37.574, longitude: 126.9768 }, // Gwanghwamun Square
    radius: 30,
    title: 'Statue of Admiral Yi Sun-sin',
    description: 'A statue dedicated to the naval commander.',
    contentId: null,
    thumbnailUrl: 'https://placehold.co/100x100.png',
  }
];

const MOCK_CONTENT: Record<string, GuideContent> = {
  'content-1': {
    id: 'content-1',
    script: "Welcome to Gwanghwamun Gate! This is the main gate of Gyeongbokgung Palace. It has been restored to its original glory.",
    mediaMap: [
      { triggerIndex: 0, mediaUrl: 'https://placehold.co/400x300.png', type: 'IMAGE' },
      { triggerIndex: 50, mediaUrl: 'https://placehold.co/400x300/orange/white.png', type: 'IMAGE' }
    ],
    quests: [
      {
        id: 'q1',
        type: 'MULTIPLE_CHOICE',
        question: 'When was this gate originally built?',
        options: ['1395', '1950', '2010'],
        answer: '1395',
        rewardMint: 50
      }
    ]
  }
};

export const apiClient = {
  getMarkers: async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return GetMarkersResponseSchema.parse(MOCK_MARKERS);
  },

  getGuideContent: async (contentId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const content = MOCK_CONTENT[contentId];
    if (!content) throw new Error('Content not found');
    return GetContentResponseSchema.parse(content);
  },

  sendChatMessage: async (payload: ChatRequest) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const response = {
      reply: `AI Response to: "${payload.message}". This gate is very historical.`
    };
    return ChatResponseSchema.parse(response);
  }
};
