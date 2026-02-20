import { MissionStep } from '../../shared/api/mission.contracts';

export const MOCK_MISSION_QUIZ: MissionStep = {
  stepId: 'step_quiz_1',
  missionId: 101,
  title: 'History Quiz',
  missionType: 'QUIZ',
  status: 'OPEN',
  prompt: 'What year was Gwanghwamun originally built?',
  optionsJson: {
    choices: [
      { id: 'opt_1', text: '1395' }, // Correct
      { id: 'opt_2', text: '1446' },
      { id: 'opt_3', text: '1592' },
      { id: 'opt_4', text: '1867' },
    ],
  },
};

export const MOCK_MISSION_PHOTO: MissionStep = {
  stepId: 'step_photo_1',
  missionId: 102,
  title: 'Statue Photo',
  missionType: 'PHOTO',
  status: 'OPEN',
  prompt: 'Find the mythical creature.',
  optionsJson: {
    instruction: 'Take a photo of the Haitai statue with the gate in the background.',
  },
};
