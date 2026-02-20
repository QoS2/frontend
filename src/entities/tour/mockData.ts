import { RunResponse } from '../../shared/api/tour.contracts';

export const MOCK_RUN_RESPONSE: RunResponse = {
  runId: 101,
  tourId: 1,
  status: 'IN_PROGRESS',
  mode: 'START',
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
    type: 'MAIN',
  },
};
