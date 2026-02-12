import React from 'react';
import { CommonCollectionLayout } from '@shared/ui/CommonCollectionLayout';


const MOCK_PLACES = [
  {
    id: '1',
    title: 'Gwanghwamun',
    subtitle: 'Place 001',
    imageUrl: 'https://placehold.co/400x400/png?text=Gwanghwamun',
    audioUrl: 'mock_audio.mp3',
  },
  {
    id: '2',
    title: 'N Seoul Tower',
    subtitle: 'Place 002',
    imageUrl: 'https://placehold.co/400x400/png?text=N+Tower',
    audioUrl: 'mock_audio.mp3',
  },
  {
    id: '3',
    title: 'Bukchon Hanok',
    subtitle: 'Place 003',
    imageUrl: 'https://placehold.co/400x400/png?text=Hanok',
    audioUrl: 'mock_audio.mp3',
  },
  {
    id: '4',
    title: 'Dongdaemun DDP',
    subtitle: 'Place 004',
    imageUrl: 'https://placehold.co/400x400/png?text=DDP',
  }
];

export function PlacePage() {

  return (
    <CommonCollectionLayout
      title="Place Collection"
      items={MOCK_PLACES}
    />
  );
}
