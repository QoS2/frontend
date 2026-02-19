import {
  PlaceCollectionResponse,
  TreasureCollectionResponse,
  PhotoSpotsResponse,
} from '../../shared/api/collection.contracts';

export const MOCK_PLACES: PlaceCollectionResponse = {
  items: [
    {
      id: 'place-1',
      name: 'Gwanghwamun Gate',
      description: 'Acquired on 2023-10-01',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Gwanghwamun_Gate_2022.jpg/1200px-Gwanghwamun_Gate_2022.jpg',
      acquiredAt: '2023-10-01T10:00:00Z',
    },
    {
      id: 'place-2',
      name: 'N Seoul Tower',
      description: 'Acquired on 2023-10-02',
      imageUrl: 'https://english.visitseoul.net/comm/getImage?srvcId=POST&parentSn=5087&fileTy=POSTTHUMB&fileNo=1',
      acquiredAt: '2023-10-02T14:30:00Z',
    },
  ],
  totalCount: 2,
};

export const MOCK_TREASURES: TreasureCollectionResponse = {
  items: [
    {
      id: 'treasure-1',
      name: 'Golden Key',
      description: 'Found hidden in the palace.',
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/2534/2534882.png',
      acquiredAt: '2023-10-01T11:00:00Z',
    },
  ],
  totalCount: 1,
};

export const MOCK_PHOTO_SPOTS: PhotoSpotsResponse = {
  items: [
    {
      id: 'photo-1',
      spotId: 1,
      title: 'Gwanghwamun Signboard',
      description: 'Take a photo of the signboard.',
      exampleImageUrl: 'https://placehold.co/400x300/png',
      isCompleted: true,
      mySubmissionUrl: 'https://placehold.co/400x300/png?text=My+Photo',
    },
    {
      id: 'photo-2',
      spotId: 2,
      title: 'Sejong Statue',
      description: 'Pose with King Sejong.',
      exampleImageUrl: 'https://placehold.co/400x300/png',
      isCompleted: false,
    },
  ],
};
