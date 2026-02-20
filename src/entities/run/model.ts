import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API_FLAGS } from '../../shared/api/config';
import { httpClient } from '../../shared/api/httpClient';
import {
  RunState,
  RunStateSchema,
  ProximityRequest,
  ProximityResponse,
  ProximityResponseSchema,
  ChatSessionResponse,
  ChatSessionResponseSchema,
  ChatHistoryResponse,
  ChatHistoryResponseSchema,
  ChatMessageRequest,
  ChatMessageResponse,
  ChatMessageResponseSchema,
  NextSpotResponse,
  NextSpotResponseSchema,
  ChatTurn,
} from '../../shared/api/run.contracts';
import { ApiError } from '../../shared/api/auth.contracts';
import { 
  MOCK_RUN_STATE, 
  MOCK_PROXIMITY_RESPONSE, 
  MOCK_CHAT_SESSION, 
  MOCK_CHAT_HISTORY, 
  MOCK_CHAT_RESPONSE, 
  MOCK_NEXT_SPOT 
} from './mockData';

// --- API Functions ---

const fetchRunState = async (runId: number): Promise<RunState> => {
  if (!API_FLAGS.RUN) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return RunStateSchema.parse({ ...MOCK_RUN_STATE, runId });
  }
  const response = await httpClient.get<unknown>(`/api/v1/tour-runs/${runId}`);
  return RunStateSchema.parse(response);
};

const checkProximity = async ({ runId, data }: { runId: number; data: ProximityRequest }): Promise<ProximityResponse | null> => {
  if (!API_FLAGS.RUN) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (!MOCK_PROXIMITY_RESPONSE) return null;
    return ProximityResponseSchema.parse(MOCK_PROXIMITY_RESPONSE);
  }
  const response = await httpClient.post<unknown>(
    `/api/v1/tour-runs/${runId}/proximity`,
    data
  );
  if (!response) return null; // 204 No Content
  return ProximityResponseSchema.parse(response);
};

const fetchChatSession = async ({ runId, spotId }: { runId: number; spotId: number }): Promise<ChatSessionResponse> => {
  if (!API_FLAGS.CHAT) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return ChatSessionResponseSchema.parse(MOCK_CHAT_SESSION);
  }
  const response = await httpClient.get<unknown>(`/api/v1/tour-runs/${runId}/spots/${spotId}/chat-session`);
  return ChatSessionResponseSchema.parse(response);
};

const fetchChatHistory = async (sessionId: number): Promise<ChatHistoryResponse> => {
  if (!API_FLAGS.CHAT) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return ChatHistoryResponseSchema.parse(MOCK_CHAT_HISTORY);
  }
  const response = await httpClient.get<unknown>(`/api/v1/chat-sessions/${sessionId}/turns`);
  return ChatHistoryResponseSchema.parse(response);
};

const fetchNextTurn = async ({ sessionId, turnId }: { sessionId: number; turnId: number }): Promise<ChatTurn> => {
  if (!API_FLAGS.CHAT) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return MOCK_CHAT_HISTORY.turns[0] as ChatTurn; // Mock
  }
  const response = await httpClient.get<unknown>(`/api/v1/chat-sessions/${sessionId}/turns/${turnId}`);
  return response as ChatTurn;
};

const sendMessage = async ({ sessionId, data }: { sessionId: number; data: ChatMessageRequest }): Promise<ChatMessageResponse> => {
  if (!API_FLAGS.CHAT) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return ChatMessageResponseSchema.parse({
      ...MOCK_CHAT_RESPONSE,
      userText: data.text,
    });
  }
  const response = await httpClient.post<unknown>(`/api/v1/chat-sessions/${sessionId}/messages`, data);
  return ChatMessageResponseSchema.parse(response);
};

const fetchNextSpot = async (runId: number): Promise<NextSpotResponse> => {
  if (!API_FLAGS.RUN) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return NextSpotResponseSchema.parse(MOCK_NEXT_SPOT);
  }
  const response = await httpClient.get<unknown>(`/api/v1/tour-runs/${runId}/next-spot`);
  return NextSpotResponseSchema.parse(response);
};

// --- Hooks ---

export const useRunState = (runId?: number) => {
  return useQuery<RunState, ApiError>({
    queryKey: ['run', runId],
    queryFn: () => fetchRunState(runId!),
    enabled: !!runId,
    refetchInterval: 5000,
  });
};

export const useProximityCheck = () => {
  return useMutation<ProximityResponse | null, ApiError, { runId: number; data: ProximityRequest }>({
    mutationFn: checkProximity,
  });
};

export const useChatSession = (runId?: number, spotId?: number) => {
  return useQuery<ChatSessionResponse, ApiError>({
    queryKey: ['chat-session', runId, spotId],
    queryFn: () => fetchChatSession({ runId: runId!, spotId: spotId! }),
    enabled: !!runId && !!spotId,
  });
};

export const useChatHistory = (sessionId?: number) => {
  return useQuery<ChatHistoryResponse, ApiError>({
    queryKey: ['chat-history', sessionId],
    queryFn: () => fetchChatHistory(sessionId!),
    enabled: !!sessionId,
  });
};

export const useSendMessage = () => {
  return useMutation<ChatMessageResponse, ApiError, { sessionId: number; data: ChatMessageRequest }>({
    mutationFn: sendMessage,
  });
};

export const useNextTurn = () => {
  return useMutation<ChatTurn, ApiError, { sessionId: number; turnId: number }>({
    mutationFn: fetchNextTurn,
  });
};

export const useNextSpot = (runId?: number) => {
  return useQuery<NextSpotResponse, ApiError>({
    queryKey: ['next-spot', runId],
    queryFn: () => fetchNextSpot(runId!),
    enabled: !!runId,
  });
};
