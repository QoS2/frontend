import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API_FLAGS } from '../../shared/api/config';
import { httpClient } from '../../shared/api/httpClient';
import {
  MissionStep,
  MissionStepSchema,
  MissionSubmitRequest,
  MissionSubmitResponse,
  MissionSubmitResponseSchema,
} from '../../shared/api/mission.contracts';
import { ApiError } from '../../shared/api/auth.contracts';

import { MOCK_MISSION_QUIZ, MOCK_MISSION_PHOTO } from './mockData';

// --- API Functions ---
const fetchMissionStep = async (stepId: string): Promise<MissionStep> => {
  if (!API_FLAGS.MISSION) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    // Determine mock type based on ID
    if (stepId.includes('photo')) {
        return MissionStepSchema.parse({ ...MOCK_MISSION_PHOTO, stepId });
    }
    return MissionStepSchema.parse({ ...MOCK_MISSION_QUIZ, stepId });
  }
  const response = await httpClient.get<unknown>(`/api/v1/content-steps/${stepId}/mission`);
  return MissionStepSchema.parse(response);
};

const submitMission = async ({ runId, stepId, data }: { runId: number; stepId: string; data: MissionSubmitRequest }): Promise<MissionSubmitResponse> => {
   if (!API_FLAGS.MISSION) {
     await new Promise((resolve) => setTimeout(resolve, 800));
     
     // Mock logic check
     const isSuccess = data.type === 'QUIZ' ? (data.answer === 'opt_1') : true;

     return MissionSubmitResponseSchema.parse({
       success: isSuccess,
       message: isSuccess ? 'Correct Answer!' : 'Try Again...',
       reward: isSuccess ? { xp: 50, badgeUrl: 'badge_gwanghwamun.png' } : undefined,
       nextStepId: isSuccess ? null : stepId, // Retry if failed
     });
   }
   const response = await httpClient.post<unknown>(`/api/v1/tour-runs/${runId}/steps/${stepId}/missions/submit`, { json: data });
   return MissionSubmitResponseSchema.parse(response);
};

// --- Hooks ---
export const useMissionStep = (stepId?: string) => {
  return useQuery<MissionStep, ApiError>({
    queryKey: ['mission', stepId],
    queryFn: () => fetchMissionStep(stepId!),
    enabled: !!stepId,
  });
};

export const useSubmitMission = () => {
  const queryClient = useQueryClient();
  return useMutation<MissionSubmitResponse, ApiError, { runId: number; stepId: string; data: MissionSubmitRequest }>({
    mutationFn: submitMission,
    onSuccess: (data, variables) => {
      // Invalidate mission state or run progress
      // queryClient.invalidateQueries({ queryKey: ['run', variables.runId] });
      if (data.success) {
          // Maybe refetch mission step to show completed state
          queryClient.invalidateQueries({ queryKey: ['mission', variables.stepId] });
      }
    },
  });
};
