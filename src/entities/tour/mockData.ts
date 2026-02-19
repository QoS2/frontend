import { TourListItem, TourDetail, RunResponse } from '../../shared/api/tour.contracts';

export const MOCK_TOUR_LIST: TourListItem[] = [
  {
    id: 1,
    externalKey: 'gyeongbokgung',
    title: '경복궁 핵심 투어',
    description: '조선의 대표 궁궐을 둘러보는 핵심 코스입니다.',
    thumbnailUrl: 'https://picsum.photos/id/1018/800/600',
    estimatedDurationMin: 90,
    accessStatus: 'UNLOCKED',
    tags: [{ id: 1, name: '역사', slug: 'history' }],
    counts: { main: 8, sub: 12, photo: 5, treasure: 3, missions: 4 },
  },
  {
    id: 2,
    externalKey: 'changdeokgung',
    title: '창덕궁 탐험',
    description: '유네스코 세계문화유산 창덕궁 투어',
    thumbnailUrl: 'https://picsum.photos/id/1015/800/600',
    estimatedDurationMin: 120,
    accessStatus: 'LOCKED',
    tags: [],
    counts: { main: 10, sub: 5, photo: 2, treasure: 0, missions: 5 },
  },
];

export const MOCK_TOUR_DETAIL: TourDetail = {
  tourId: 1,
  title: '경복궁 핵심 투어',
  description: '조선의 대표 궁궐을 둘러보는 핵심 코스입니다.',
  tags: [{ id: 1, name: '역사', slug: 'history' }],
  counts: { main: 8, sub: 12, photo: 5, treasure: 3, missions: 4 },
  info: {
    entrance_fee: { adult: 3000, child: 1500 },
    available_hours: [{ day: 'weekday', open: '09:00', close: '18:00' }],
    estimated_duration_min: 90,
  },
  goodToKnow: ['한복 입장 무료', '편한 신발 추천'],
  startSpot: {
    spotId: 1,
    title: '광화문',
    lat: 37.576,
    lng: 126.977,
    radiusM: 60,
    type: 'MAIN',
  },
  mapSpots: [
    {
      spotId: 1,
      type: 'MAIN',
      title: '광화문',
      lat: 37.576,
      lng: 126.977,
      thumbnailUrl: 'https://picsum.photos/id/1016/200/200',
      isHighlight: true,
    },
    {
      spotId: 9,
      type: 'TREASURE',
      title: '비밀의 문',
      lat: 37.579,
      lng: 126.975,
      thumbnailUrl: null,
      isHighlight: false,
    },
  ],
  access: { status: 'UNLOCKED', hasAccess: true },
  thumbnails: [
    'https://picsum.photos/id/1018/800/600',
    'https://picsum.photos/id/1015/800/600',
  ],
  currentRun: null, // Initially no run
  actions: {
    primaryButton: 'CONTINUE',
    secondaryButton: 'GPS_TO_START',
    moreActions: ['RESTART'],
  },
};

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
