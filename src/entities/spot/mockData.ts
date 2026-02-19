import { SpotDetail, GuideSegment } from '../../shared/api/spot.contracts';

export const MOCK_SPOT_DETAIL: SpotDetail = {
  id: 1,
  name: 'Gwanghwamun Gate',
  description: 'The main gate of Gyeongbokgung Palace, featuring 3 arched gates.',
  imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Gwanghwamun_Gate_2022.jpg/1200px-Gwanghwamun_Gate_2022.jpg',
  type: 'HISTORICAL',
  location: { lat: 37.5759, lng: 126.9768 },
  estimatedTimeMinutes: 15,
};

export const MOCK_SPOT_GUIDE: GuideSegment[] = [
  {
    segmentId: 'seg_1',
    spotId: 1,
    title: 'The Gate of Light',
    content: 'Gwanghwamun means "May the light of enlightenment cover the world".',
    order: 1,
  },
  {
    segmentId: 'seg_2',
    spotId: 1,
    title: 'Haitai Statues',
    content: 'Look at the mythical creatures guarding the gate. They protect against fire.',
    order: 2,
  },
];
