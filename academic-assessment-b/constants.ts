
import { SchoolLevel, SubjectConfig } from './types';

export const SUBJECT_LISTS: Record<SchoolLevel, SubjectConfig> = {
  [SchoolLevel.Creche]: {
    core: ['Sensory Play', 'Physical Development', 'Communication & Language', 'Personal, Social & Emotional Development'],
    elective: ['Creative Arts', 'Music & Movement']
  },
  [SchoolLevel.Nursery]: {
    core: ['Numeracy', 'Literacy', 'Environmental Studies', 'Health & Safety'],
    elective: ['Rhymes & Songs', 'Coloring & Drawing', 'French (Intro)']
  },
  [SchoolLevel.KG]: {
    core: ['Our World Our People', 'Language and Literacy', 'Mathematics', 'Science'],
    elective: ['Creative Arts', 'Religious & Moral Education', 'ICT (Exposure)']
  },
  [SchoolLevel.JHS]: {
    core: ['Social Studies', 'English Language', 'Science', 'Mathematics'],
    elective: ['Computing', 'Religious and Moral Education', 'Creative Arts and Designing', 'Career Technology', 'French', 'Ghana Language Option (Twi)']
  },
  [SchoolLevel.LBS]: {
    core: ['History', 'English Language', 'Science', 'Mathematics'],
    elective: ['ICT', 'Religious and Moral Education', 'Creative Arts and Designing', 'Creative Arts', 'French', 'Ghana Language Option (Twi)']
  },
  [SchoolLevel.UBS]: {
    core: ['History', 'English Language', 'Science', 'Mathematics'],
    elective: ['ICT', 'Religious and Moral Education', 'Creative Arts and Designing', 'Creative Arts', 'French', 'Ghana Language Option (Twi)']
  }
};

export const LEVELS = [
  { id: SchoolLevel.Creche, label: 'Creche' },
  { id: SchoolLevel.Nursery, label: 'Nursery (1-2)' },
  { id: SchoolLevel.KG, label: 'Kindergarten (1-2)' },
  { id: SchoolLevel.LBS, label: 'Lower Basic (1-3)' },
  { id: SchoolLevel.UBS, label: 'Upper Basic (4-6)' },
  { id: SchoolLevel.JHS, label: 'Junior High School' }
];

export const ALL_CLASSES = [
  'Creche', 'Nursery 1', 'Nursery 2', 'Kindergarten 1', 'Kindergarten 2',
  'Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6',
  'Basic 7', 'Basic 8', 'Basic 9'
];

export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const PERIOD_TIMES = {
  P1: '08:00 - 08:40',
  P2: '08:40 - 09:20',
  P3: '09:20 - 10:00',
  P4: '10:20 - 11:00',
  P5: '11:00 - 11:40',
  P6: '11:40 - 12:20',
  P7: '13:00 - 13:40',
  P8: '13:40 - 14:20'
};