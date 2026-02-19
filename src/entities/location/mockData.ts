import { LocationMarker } from '../../shared/api/contracts';

export const MOCK_MARKERS: LocationMarker[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    type: 'PLACE',
    coordinate: { latitude: 37.5759, longitude: 126.9768 }, // Gwanghwamun
    radius: 50,
    title: 'Gwanghwamun Gate',
    description: 'The main gate of Gyeongbokgung Palace.',
    contentId: '550e8400-e29b-41d4-a716-446655440011',
    thumbnailUrl: 'https://placehold.co/100x100.png',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    type: 'SUB_PLACE',
    coordinate: { latitude: 37.574, longitude: 126.9768 }, // Gwanghwamun Square
    radius: 30,
    title: 'Statue of Admiral Yi Sun-sin',
    description: 'A statue dedicated to the naval commander.',
    contentId: null,
    thumbnailUrl: 'https://placehold.co/100x100.png',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440020',
    type: 'PHOTO',
    coordinate: { latitude: 37.5765, longitude: 126.9770 }, // Slightly north of Gwanghwamun
    radius: 30,
    title: 'Hidden Photo Spot',
    description: 'Best angle for Gwanghwamun.',
    contentId: '550e8400-e29b-41d4-a716-446655440022',
    thumbnailUrl: 'https://placehold.co/100x100.png',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440021',
    type: 'TREASURE',
    coordinate: { latitude: 37.5755, longitude: 126.9760 }, // Slightly west
    radius: 30,
    title: 'Secret Treasure',
    description: 'Find the hidden gem!',
    contentId: '550e8400-e29b-41d4-a716-446655440023',
    thumbnailUrl: 'https://placehold.co/100x100.png',
  },
];
