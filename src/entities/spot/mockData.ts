import { SpotDetail, SpotGuideResponse } from '../../shared/api/spot.contracts';

export const MOCK_SPOT_DETAIL: SpotDetail = {
  spotId: 1,
  type: 'MAIN',
  title: 'Gwanghwamun Gate',
  titleKr: '광화문',
  description: 'The main gate of Gyeongbokgung Palace, featuring 3 arched gates.',
  thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Gwanghwamun_Gate_2022.jpg/1200px-Gwanghwamun_Gate_2022.jpg',
  lat: 37.5759,
  lng: 126.9768,
  address: '161 Sajik-ro, Jongno-gu, Seoul',
};

export const MOCK_SPOT_GUIDE: SpotGuideResponse = {
  stepId: 101,
  stepTitle: '광화문',
  nextAction: 'NEXT',
  segments: [
    {
      id: 1,
      segIdx: 1,
      text: 'Gwanghwamun means "May the light of enlightenment cover the world".',
    },
    {
      id: 2,
      segIdx: 2,
      text: 'Look at the mythical creatures guarding the gate. They protect against fire.',
    },
  ]
};
