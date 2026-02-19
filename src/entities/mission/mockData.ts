import { MissionStep } from '../../shared/api/mission.contracts';

export const MOCK_MISSION_QUIZ: MissionStep = {
  stepId: 'step_quiz_1',
  title: 'History Quiz',
  description: 'What year was Gwanghwamun originally built?',
  type: 'QUIZ',
  status: 'OPEN',
  quiz: {
    question: 'Select the correct year:',
    options: [
      { id: 'opt_1', text: '1395' }, // Correct
      { id: 'opt_2', text: '1446' },
      { id: 'opt_3', text: '1592' },
      { id: 'opt_4', text: '1867' },
    ],
  },
};

export const MOCK_MISSION_PHOTO: MissionStep = {
  stepId: 'step_photo_1',
  title: 'Statue Photo',
  description: 'Take a photo of the Haitai statue with the gate in the background.',
  type: 'PHOTO',
  status: 'OPEN',
  photo: {
    targetDescription: 'Haitai Statue',
  },
};
