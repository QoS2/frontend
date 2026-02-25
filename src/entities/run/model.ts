import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
// --- API Functions ---



const checkProximity = async ({ runId, data }: { runId: number; data: ProximityRequest }): Promise<ProximityResponse | null> => {
  const response = await httpClient.post<unknown>(
    `/api/v1/tour-runs/${runId}/proximity`,
    data
  );
  if (!response) return null; // 204 No Content
  return ProximityResponseSchema.parse(response);
};

export const fetchChatSession = async ({ runId, spotId }: { runId: number; spotId: number }): Promise<ChatSessionResponse> => {
  const response = await httpClient.get<unknown>(`/api/v1/tour-runs/${runId}/spots/${spotId}/chat-session`);
  return ChatSessionResponseSchema.parse(response);
};

export const fetchChatHistory = async (sessionId: number): Promise<ChatHistoryResponse> => {
  const response = await httpClient.get<unknown>(`/api/v1/chat-sessions/${sessionId}/turns`);
  return ChatHistoryResponseSchema.parse(response);
};

const fetchNextTurn = async ({ sessionId, turnId }: { sessionId: number; turnId: number }): Promise<ChatTurn> => {
  const response = await httpClient.get<unknown>(`/api/v1/chat-sessions/${sessionId}/turns/${turnId}`);
  return response as ChatTurn;
};

const fetchNextTurnByUrl = async (nextApi: string): Promise<ChatTurn> => {
  const response = await httpClient.get<unknown>(nextApi);
  return response as ChatTurn;
};

const sendMessage = async ({ sessionId, data }: { sessionId: number; data: ChatMessageRequest }): Promise<ChatMessageResponse> => {
  const response = await httpClient.post<unknown>(`/api/v1/chat-sessions/${sessionId}/messages`, data);
  return ChatMessageResponseSchema.parse(response);
};

const fetchNextSpot = async (runId: number): Promise<NextSpotResponse> => {
  const response = await httpClient.get<unknown>(`/api/v1/tour-runs/${runId}/next-spot`);
  return NextSpotResponseSchema.parse(response);
};

// --- Hooks ---

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
    // staleTime: 1000 * 60 * 10, // 10 minutes - Caching disabled
  });
};

export const useChatHistory = (sessionId?: number) => {
  return useQuery<ChatHistoryResponse, ApiError>({
    queryKey: ['chat-history', sessionId],
    queryFn: () => fetchChatHistory(sessionId!),
    // staleTime: 1000 * 60 * 5, // 5 minutes - Caching disabled
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

export const useNextTurnByUrl = () => {
  return useMutation<ChatTurn, ApiError, string>({
    mutationFn: fetchNextTurnByUrl,
  });
};

export const useNextSpot = (runId?: number) => {
  return useQuery<NextSpotResponse, ApiError>({
    queryKey: ['next-spot', runId],
    queryFn: () => fetchNextSpot(runId!),
    // staleTime: 1000 * 60 * 5, // 5 minutes - Caching disabled
  });
};
