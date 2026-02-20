import { 
  RunState, 
  ProximityResponse, 
  ChatSessionResponse,
  ChatHistoryResponse,
  ChatMessageResponse,
  NextSpotResponse
} from '../../shared/api/run.contracts';

export const MOCK_RUN_STATE: RunState = {
  runId: 101,
  tourId: 1,
  status: 'IN_PROGRESS',
  mode: 'START',
  currentSpotId: 1, // 광화문
  progress: {
    completedCount: 0,
    totalCount: 8,
    completedSpotIds: [],
  },
  startSpot: {
    spotId: 1,
    title: '광화문',
    lat: 37.576,
    lng: 126.977,
    radiusM: 60,
  }
};

export const MOCK_PROXIMITY_RESPONSE: ProximityResponse = {
  event: 'PROXIMITY',
  contentType: 'GUIDE',
  sessionId: 201,
  context: {
    refType: 'SPOT',
    refId: 1,
    placeName: '광화문',
    spotType: 'MAIN'
  },
  message: {
    turnId: 501,
    role: 'GUIDE',
    source: 'SCRIPT',
    text: "광화문에 오신 것을 환영합니다. 이곳은 경복궁의 정문으로...",
    assets: [],
    delayMs: 1500,
    action: {
      type: 'AUTO_NEXT',
      nextApi: '/api/v1/chat-sessions/201/turns/502'
    }
  }
};

export const MOCK_CHAT_SESSION: ChatSessionResponse = {
  sessionId: 201,
  status: 'ACTIVE',
  lastTurnId: 505
};

export const MOCK_CHAT_HISTORY: ChatHistoryResponse = {
  sessionId: 201,
  status: 'ACTIVE',
  nextScriptApi: '/api/v1/chat-sessions/201/turns/503',
  hasNextScript: true,
  turns: [
    {
      turnId: 501,
      role: 'USER',
      source: 'USER',
      text: '이 건물의 역사가 궁금해요',
      assets: [],
      createdAt: '2026-02-11T10:30:00Z'
    },
    {
      turnId: 502,
      role: 'GUIDE',
      source: 'SCRIPT',
      text: '근정전은 1395년 태조에 의해 건축된 조선의 정전입니다...',
      assets: [{ id: 1, type: 'IMAGE', url: 'https://s3.example.com/image.jpg' }],
      delayMs: 1500,
      action: { type: 'AUTO_NEXT', nextApi: '/api/v1/chat-sessions/201/turns/503' },
      createdAt: '2026-02-11T10:30:05Z'
    }
  ]
};

export const MOCK_CHAT_RESPONSE: ChatMessageResponse = {
  userTurnId: 503,
  userText: '질문 내용',
  aiTurnId: 504,
  aiText: 'AI의 답변입니다.',
  nextScriptApi: '/api/v1/chat-sessions/201/turns/505',
  hasNextScript: true
};

export const MOCK_NEXT_SPOT: NextSpotResponse = {
  runId: 101,
  status: 'IN_PROGRESS',
  hasNextSpot: true,
  nextSpot: {
    spotId: 3,
    spotType: 'MAIN',
    title: '근정전',
    lat: 37.579,
    lng: 126.977,
    radiusM: 50,
    orderIndex: 2
  },
  progress: {
    completedCount: 1,
    totalCount: 8,
    completedSpotIds: [1]
  }
};
