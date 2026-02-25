import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@shared/api/httpClient';
import { useTourStore } from './store';
import {
  TourListResponseSchema,
  TourDetailSchema,
  RunResponseSchema,
  TourListItem,
  TourDetail,
  RunResponse,
  RunActionSchema,
} from '../../shared/api/tour.contracts';
import { ApiError, ApiErrorSchema } from '../../shared/api/auth.contracts';

// --- API Functions ---

const fetchTours = async (): Promise<TourListItem[]> => {
  // [REAL]
  const response = await httpClient.get<unknown>('/api/v1/tours');
  try {
    return TourListResponseSchema.parse(response);
  } catch (err) {
    console.error('API Response Schema Validation Error (fetchTours):', err);
    throw err; // React Query will still catch this and fail/retry, but now we'll see it in console
  }
};

const fetchTourDetail = async (tourId: number): Promise<TourDetail> => {
  // [REAL]
  const response = await httpClient.get<unknown>(`/api/v1/tours/${tourId}`);
  try {
    return TourDetailSchema.parse(response);
  } catch (err) {
    console.error(`API Response Schema Validation Error (fetchTourDetail ${tourId}):`, err);
    throw err;
  }
};

const unlockTourApi = async (tourId: number): Promise<void> => {
  // [REAL]
  await httpClient.post(`/api/v1/tours/${tourId}/access/unlock`);
};

const startTourApi = async ({ tourId, mode }: { tourId: number; mode: 'START' | 'CONTINUE' }): Promise<RunResponse> => {
  // [REAL]
  const response = await httpClient.post<unknown>(`/api/v1/tours/${tourId}/runs`, {
    mode
  });
  return RunResponseSchema.parse(response);
};



export const useCurrentRun = () => {
  const activeTourId = useTourStore((state) => state.activeTourId);
  const { data: tourDetail, isLoading: isTourDetailLoading } = useTourDetail(activeTourId ?? 0);
  const currentRun = tourDetail?.currentRun;
  const runId = currentRun?.runId;
  const isRunMode = !!runId && !!currentRun;

  return {
    activeTourId,
    tourDetail,
    isTourDetailLoading,
    currentRun,
    runId,
    isRunMode,
  };
};

export const useTours = () => {
  return useQuery<TourListItem[], ApiError>({
    queryKey: ['tours'],
    queryFn: fetchTours,
    // staleTime: 1000 * 60 * 10, // 10 minutes - Caching disabled
  });
};

export const useTourDetail = (tourId: number) => {
  return useQuery<TourDetail, ApiError>({
    queryKey: ['tour', tourId],
    queryFn: () => fetchTourDetail(tourId),
    enabled: !!tourId,
    // staleTime: 1000 * 60 * 10, // 10 minutes - Caching disabled
  });
};

export const useUnlockTour = () => {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, number>({
    mutationFn: unlockTourApi,
    onSuccess: (_, tourId) => {
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      queryClient.invalidateQueries({ queryKey: ['tours'] });
    },
  });
};

export const useStartTour = () => {
  const queryClient = useQueryClient();
  return useMutation<RunResponse, ApiError, { tourId: number; mode: 'START' | 'CONTINUE' }>({
    mutationFn: startTourApi,
    onSuccess: (data, variables) => {
      // Invalidate tour detail to reflect new 'currentRun' state if backend updates it
      queryClient.invalidateQueries({ queryKey: ['tour', variables.tourId] });
      // You might also want to set global 'activeRun' state here
    },
  });
};
