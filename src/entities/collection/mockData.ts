import {
  PlaceCollectionResponse,
  TreasureCollectionResponse,
  PhotoSpotsResponse,
} from '../../shared/api/collection.contracts';

export const MOCK_PLACES: PlaceCollectionResponse = {
  totalCollected: 2,
  totalAvailable: 20,
  items: [
    {
      spotId: 1,
      tourId: 101,
      tourTitle: 'Gyeongbokgung Tour',
      type: 'MAIN',
      title: 'Gwanghwamun Gate',
      description: 'Acquired on 2023-10-01',
      thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Gwanghwamun_Gate_2022.jpg/1200px-Gwanghwamun_Gate_2022.jpg',
      collectedAt: '2023-10-01T10:00:00Z',
      orderIndex: 1,
      collected: true,
    },
    {
      spotId: 2,
      tourId: 101,
      tourTitle: 'Gyeongbokgung Tour',
      type: 'MAIN',
      title: 'Geunjeongjeon Hall',
      description: 'Acquired on 2023-10-02',
      thumbnailUrl: 'https://english.visitseoul.net/comm/getImage?srvcId=POST&parentSn=5087&fileTy=POSTTHUMB&fileNo=1',
      collectedAt: '2023-10-02T14:30:00Z',
      orderIndex: 2,
      collected: true,
    },
  ],
};

export const MOCK_TREASURES: TreasureCollectionResponse = {
  totalCollected: 1,
  totalAvailable: 5,
  items: [
    {
      spotId: 10,
      tourId: 101,
      tourTitle: 'Gyeongbokgung Tour',
      title: 'Golden Key',
      description: 'Found hidden in the palace.',
      thumbnailUrl: 'https://cdn-icons-png.flaticon.com/512/2534/2534882.png',
      gotAt: '2023-10-01T11:00:00Z',
      orderIndex: 1,
      collected: true,
    },
  ],
};

export const MOCK_PHOTO_SPOTS: PhotoSpotsResponse = [
  {
    spotId: 1,
    tourId: 101,
    tourTitle: 'Gyeongbokgung Tour',
    title: 'Gwanghwamun Signboard',
    description: 'Take a photo of the signboard.',
    latitude: 37.576,
    longitude: 126.977,
    thumbnailUrl: 'https://placehold.co/400x300/png',
    userPhotoCount: 1,
    samplePhotos: [{ id: 1, url: 'https://placehold.co/400x300/png?text=Sample' }],
    collected: true,
  },
  {
    spotId: 2,
    tourId: 101,
    tourTitle: 'Gyeongbokgung Tour',
    title: 'Sejong Statue',
    description: 'Pose with King Sejong.',
    latitude: 37.576,
    longitude: 126.977,
    thumbnailUrl: 'https://placehold.co/400x300/png',
    userPhotoCount: 0,
    samplePhotos: [],
    collected: false,
  },
];
