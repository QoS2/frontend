import { RunState, ChatMessage } from '../../shared/api/run.contracts';

export const MOCK_RUN_STATE: RunState = {
  runId: 101,
  tourId: 1,
  status: 'IN_PROGRESS',
  currentSpotId: 1, // 광화문
  progress: {
    completedCount: 0,
    totalCount: 8,
    completedSpotIds: [],
  },
};

export const MOCK_CHAT_HISTORY: ChatMessage[] = [
  {
    messageId: 'msg_001',
    runId: 101,
    sender: 'GUIDE',
    type: 'TEXT',
    content: '안녕하세요! 경복궁 투어에 오신 것을 환영합니다. 지금 광화문 앞에 계신가요?',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    messageId: 'msg_002',
    runId: 101,
    sender: 'USER',
    type: 'TEXT',
    content: '네, 도착했습니다.',
    timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
  },
];
