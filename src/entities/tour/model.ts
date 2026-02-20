import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API_FLAGS } from '../../shared/api/config';
import { httpClient } from '../../shared/api/httpClient';
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
import { MOCK_TOUR_DETAIL, MOCK_TOUR_LIST, MOCK_RUN_RESPONSE } from './mockData';

// --- API Functions ---

const fetchTours = async (): Promise<TourListItem[]> => {
  if (!API_FLAGS.TOUR) {
    // [MOCK]
    await new Promise((resolve) => setTimeout(resolve, 800));
    return TourListResponseSchema.parse(MOCK_TOUR_LIST);
  }
  // [REAL]
  const response = await httpClient.get<unknown>('/api/v1/tours', { isPublic: true });
  try {
    return TourListResponseSchema.parse(response);
  } catch (err) {
    console.error('API Response Schema Validation Error (fetchTours):', err);
    throw err; // React Query will still catch this and fail/retry, but now we'll see it in console
  }
};

const fetchTourDetail = async (tourId: number): Promise<TourDetail> => {
  if (!API_FLAGS.TOUR) {
    // [MOCK]
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Simulate finding the tour or returning default mock
    const detail = { ...MOCK_TOUR_DETAIL, tourId }; 
    return TourDetailSchema.parse(detail);
  }
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
  if (!API_FLAGS.TOUR) {
    // [MOCK]
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return;
  }
  // [REAL]
  await httpClient.post(`/api/v1/tours/${tourId}/access/unlock`);
};

const startTourApi = async ({ tourId, mode }: { tourId: number; mode: 'START' | 'CONTINUE' }): Promise<RunResponse> => {
  if (!API_FLAGS.RUN) { // Use RUN flag for execution logic
    // [MOCK]
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return RunResponseSchema.parse({
      ...MOCK_RUN_RESPONSE,
      tourId,
      mode,
    });
  }
  // [REAL]
  const response = await httpClient.post<unknown>('/api/v1/tour-runs', {
    tourId,
    mode: 'CONTINUE'
  });
  return RunResponseSchema.parse(response);
};

// --- Hooks ---

export const useTours = () => {
  return useQuery<TourListItem[], ApiError>({
    queryKey: ['tours'],
    queryFn: fetchTours,
  });
};

export const useTourDetail = (tourId: number) => {
  return useQuery<TourDetail, ApiError>({
    queryKey: ['tour', tourId],
    queryFn: () => fetchTourDetail(tourId),
    enabled: !!tourId,
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
