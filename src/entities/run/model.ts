import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API_FLAGS } from '../../shared/api/config';
import { httpClient } from '../../shared/api/httpClient';
import {
  RunState,
  RunStateSchema,
  ProximityRequest,
  ProximityResponse,
  ProximityResponseSchema,
  ChatMessage,
  ChatHistoryResponseSchema,
  SendMessageRequest,
  ChatMessageSchema,
} from '../../shared/api/run.contracts';
import { ApiError } from '../../shared/api/auth.contracts';
import { MOCK_RUN_STATE, MOCK_CHAT_HISTORY } from './mockData';

// --- API Functions ---

const fetchRunState = async (runId: number): Promise<RunState> => {
  if (!API_FLAGS.RUN) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return RunStateSchema.parse({ ...MOCK_RUN_STATE, runId });
  }
  const response = await httpClient.get<unknown>(`/api/v1/runs/${runId}`);
  return RunStateSchema.parse(response);
};

const checkProximity = async ({ runId, data }: { runId: number; data: ProximityRequest }): Promise<ProximityResponse> => {
  if (!API_FLAGS.RUN) {
    // [MOCK] Simulate distance calculation
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    // Simple mock logic: if lat/lng matches target roughly, return ARRIVED
    // For now, let's assume if lat > 37.5, it's close (just for testing trigger)
    const isClose = data.lat > 0; // Always true for now unless we need specific logit
    
    // In real app, we would calculate distance here or server does it
    // Let's toggle status based on a random factor or state for testing?
    // Actually, let's make it always return FAR unless we trigger 'Arrive' action manually
    // But for polling, maybe just return calculated distance.
    
    return ProximityResponseSchema.parse({
      status: 'FAR',
      distanceMeters: 150,
      event: undefined,
    });
  }
  return httpClient.post<ProximityResponse>(
        `/api/v1/runs/${runId}/proximity`,
        {
          latitude: data.lat,
          longitude: data.lng,
          targetSpotId: data.targetSpotId
        }
    );
};

const fetchChatHistory = async (runId: number): Promise<ChatMessage[]> => {
  if (!API_FLAGS.CHAT) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return ChatHistoryResponseSchema.parse(MOCK_CHAT_HISTORY);
  }
  const response = await httpClient.get<unknown>(`/api/v1/runs/${runId}/chat`);
  return ChatHistoryResponseSchema.parse(response);
};

const sendMessage = async ({ runId, data }: { runId: number; data: SendMessageRequest }): Promise<ChatMessage> => {
  if (!API_FLAGS.CHAT) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const newMessage: ChatMessage = {
      messageId: `msg_${Date.now()}`,
      runId,
      sender: 'USER',
      type: 'TEXT',
      content: data.content,
      timestamp: new Date().toISOString(),
    };
    return ChatMessageSchema.parse(newMessage);
  }
  const response = await httpClient.post<unknown>(`/api/v1/runs/${runId}/chat`, data);
  return ChatMessageSchema.parse(response);
};

// --- Hooks ---

export const useRunState = (runId: number) => {
  return useQuery<RunState, ApiError>({
    queryKey: ['run', runId],
    queryFn: () => fetchRunState(runId),
    enabled: !!runId,
    refetchInterval: 5000, // Poll every 5s for status updates
  });
};

export const useProximityCheck = () => {
  return useMutation<ProximityResponse, ApiError, { runId: number; data: ProximityRequest }>({
    mutationFn: checkProximity,
  });
};

export const useChatHistory = (runId: number) => {
  return useQuery<ChatMessage[], ApiError>({
    queryKey: ['run', runId, 'chat'],
    queryFn: () => fetchChatHistory(runId),
    enabled: !!runId,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation<ChatMessage, ApiError, { runId: number; data: SendMessageRequest }>({
    mutationFn: sendMessage,
    onSuccess: (newMessage, variables) => {
      // Optimistic update or just invalidate
      queryClient.setQueryData(['run', variables.runId, 'chat'], (old: ChatMessage[] | undefined) => {
        return old ? [...old, newMessage] : [newMessage];
      });
      
      // If mock, simulate guide reply
      if (!API_FLAGS.CHAT) {
        setTimeout(() => {
          const reply: ChatMessage = {
             messageId: `msg_reply_${Date.now()}`,
             runId: variables.runId,
             sender: 'GUIDE',
             type: 'TEXT',
             content: '네, 알겠습니다. (Mock Reply)',
             timestamp: new Date().toISOString(),
          };
           queryClient.setQueryData(['run', variables.runId, 'chat'], (old: ChatMessage[] | undefined) => {
            return old ? [...old, reply] : [reply];
          });
        }, 1000);
      }
    },
  });
};
