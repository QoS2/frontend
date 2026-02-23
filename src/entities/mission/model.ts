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
      // 투어 진행 상태나 다음 스팟 정보를 최신화하도록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['tour-run', variables.runId, 'next-spot'] });
      queryClient.invalidateQueries({ queryKey: ['tour'] });
      
      if (data.isCorrect) {
          // 미션 성공 시 해당 미션 단계 정보도 갱신
          queryClient.invalidateQueries({ queryKey: ['mission', variables.stepId] });
      }
    },
  });
};
