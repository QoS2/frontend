import { GuideContent } from '../../shared/api/contracts';

export const MOCK_CONTENT: Record<string, GuideContent> = {
  '550e8400-e29b-41d4-a716-446655440022': {
    id: '550e8400-e29b-41d4-a716-446655440022',
    title: 'Hidden Photo Spot',
    description: 'Take a picture here!',
    script: 'You found a great photo spot!',
    events: [],
    quests: [],
  },
  '550e8400-e29b-41d4-a716-446655440023': {
    id: '550e8400-e29b-41d4-a716-446655440023',
    title: 'Secret Treasure',
    description: 'You found a treasure!',
    script: 'Wow, a hidden treasure!',
    events: [],
    quests: [],
  },
  '550e8400-e29b-41d4-a716-446655440011': {
    id: '550e8400-e29b-41d4-a716-446655440011',
    title: 'Gwanghwamun Story',
    description: 'Learn about the history of the main gate of Gyeongbokgung Palace.',
    script: 'Welcome to Gwanghwamun Gate! This is the main gate of Gyeongbokgung Palace. It has been restored to its original glory.', 
    events: [
      {
        id: 'evt-1',
        triggerIndex: 10,
        type: 'MEDIA',
        data: { mediaUrl: 'https://placehold.co/400x300.png', mediaType: 'IMAGE' } // Shows image of the gate early on
      },
      {
        id: 'evt-2',
        triggerIndex: 60, // Trigger after introducing the history
        type: 'QUEST',
        data: { questId: 'quest-3' } // Start a quiz about the gate
      },
      {
        id: 'evt-3',
        triggerIndex: 110, // Near the end of the script
        type: 'CAMERA',
        data: { targetName: 'Gwanghwamun Signboard' } // Ask user to take a photo
      }
    ],
    steps: [
      {
        id: 'step-1',
        title: 'The Great Gate',
        content: 'Gwanghwamun is the main gate of Gyeongbokgung Palace...',
      },
    ],
    quests: [
      {
        id: 'quest-1',
        type: 'MULTIPLE_CHOICE',
        question: 'Immortalized in white in the Museum is the Beast that changed the Great West Gate forever. What is it?',
        options: ['The Silver Dragon', 'The White Tiger', 'The Golden Phoenix'],
        answer: 'The Silver Dragon',
        hint: 'It has scales and can fly!',
      },
      {
        id: 'quest-2',
        type: 'SELECT_IMAGE',
        question: 'Which of these photos matches the Gwanghwamun gate architecture?',
        options: [
          'https://picsum.photos/id/10/400/400',
          'https://picsum.photos/id/11/400/400',
          'https://picsum.photos/id/12/400/400',
          'https://picsum.photos/id/13/400/400'
        ],
        answer: 'https://picsum.photos/id/10/400/400',
        hint: 'Look for the three arched gates.',
      },
      {
        id: 'quest-3',
        type: 'FILL_BLANKS',
        question: "What is the name of the spiritual mythical creature that guards the palace? (Starts with 'H')",
        options: [],
        answer: 'Haetae',
        hint: 'It looks like a lion with scales and a horn.',
      },
    ],
  },
};
