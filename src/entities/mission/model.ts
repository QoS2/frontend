import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '../../shared/api/httpClient';
import {
  MissionStep,
  MissionStepSchema,
  MissionSubmitRequest,
  MissionSubmitResponse,
  MissionSubmitResponseSchema,
} from '../../shared/api/mission.contracts';
import { ApiError } from '../../shared/api/auth.contracts';

// --- API Functions ---
const fetchMissionStep = async (stepId: string): Promise<MissionStep> => {
  const response = await httpClient.get<unknown>(`/api/v1/content-steps/${stepId}/mission`);
  return MissionStepSchema.parse(response);
};

const submitMission = async ({ runId, stepId, data }: { runId: number; stepId: string; data: MissionSubmitRequest }): Promise<MissionSubmitResponse> => {
   const response = await httpClient.post<unknown>(
        `/api/v1/tour-runs/${runId}/missions/${stepId}/submit`,
        data
    );
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
      if (data.isCorrect) {
          // Maybe refetch mission step to show completed state
          queryClient.invalidateQueries({ queryKey: ['mission', variables.stepId] });
      }
    },
  });
};
