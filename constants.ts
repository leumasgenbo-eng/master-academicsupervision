
import { Subject, TimeSlot, Department, ClassLevel } from './types.ts';

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const DEPARTMENTS_STRUCTURE: Record<Department, ClassLevel[]> = {
  [Department.CRECHE]: ['Creche'],
  [Department.NURSERY]: ['Nursery 1', 'Nursery 2'],
  [Department.KG]: ['KG 1', 'KG 2'],
  [Department.LOWER_BASIC]: ['Basic 1', 'Basic 2', 'Basic 3'],
  [Department.UPPER_BASIC]: ['Basic 4', 'Basic 5', 'Basic 6'],
  [Department.JHS]: ['Basic 7', 'Basic 8', 'Basic 9']
};

export const SUPPORT_TIME_SLOTS: TimeSlot[] = [
  { startTime: '06:30', endTime: '07:30', label: 'Early Bird Mastery', isSupport: true },
  { startTime: '15:30', endTime: '16:15', label: 'After-School Clinic 1', isSupport: true },
  { startTime: '16:15', endTime: '17:00', label: 'After-School Clinic 2', isSupport: true },
];

export const INTERVENTION_SUBJECTS: Subject[] = [
  { id: 'int-read', name: 'Reading Mastery', category: 'Intervention', color: 'bg-violet-600 text-white', goal: 'Fluency & Phonetics' },
  { id: 'int-write', name: 'Creative Writing', category: 'Intervention', color: 'bg-fuchsia-600 text-white', goal: 'Composition & Grammar' },
  { id: 'int-logic', name: 'Logic & Puzzles', category: 'Intervention', color: 'bg-amber-500 text-white', goal: 'Problem Solving' },
  { id: 'int-alert', name: 'Cognitive Alertness', category: 'Intervention', color: 'bg-rose-500 text-white', goal: 'Memory & Speed' },
  { id: 'int-drill', name: 'Arithmetic Drills', category: 'Intervention', color: 'bg-emerald-600 text-white', goal: 'Accuracy' },
];

export const TIME_SLOTS: TimeSlot[] = [
  { startTime: '08:00', endTime: '08:30', label: 'Morning Assembly', isAssembly: true },
  { startTime: '08:30', endTime: '09:10', label: 'Period 1' },
  { startTime: '09:10', endTime: '09:50', label: 'Period 2' },
  { startTime: '09:50', endTime: '10:20', label: 'Snack Break', isBreak: true },
  { startTime: '10:20', endTime: '11:00', label: 'Period 3' },
  { startTime: '11:00', endTime: '11:40', label: 'Period 4' },
  { startTime: '11:40', endTime: '12:40', label: 'Lunch Break', isBreak: true },
  { startTime: '12:40', endTime: '13:20', label: 'Period 5' },
  { startTime: '13:20', endTime: '14:00', label: 'Period 6' },
  { startTime: '14:00', endTime: '14:40', label: 'Period 7' },
  { startTime: '14:40', endTime: '15:00', label: 'Afternoon Assembly', isAssembly: true },
];

export const SUBJECTS_BY_DEPT: Record<Department, Subject[]> = {
  [Department.CRECHE]: [
    { id: 'lit', name: 'Language & Literacy', category: 'Core', color: 'bg-blue-100 border-blue-300' },
    { id: 'num', name: 'Numeracy', category: 'Core', color: 'bg-green-100 border-green-300' },
    { id: 'env', name: 'Environmental Studies', category: 'Core', color: 'bg-yellow-100 border-yellow-300' },
    { id: 'art', name: 'Creative Arts', category: 'Elective', color: 'bg-purple-100 border-purple-300' },
    { id: 'mus', name: 'Music & Movement', category: 'Activity', color: 'bg-pink-100 border-pink-300' },
    { id: 'phy', name: 'Physical Dev', category: 'Activity', color: 'bg-orange-100 border-orange-300' },
    { id: 'soc', name: 'Social & Emotional', category: 'Activity', color: 'bg-indigo-100 border-indigo-300' },
    { id: 'mor', name: 'Moral Education', category: 'Activity', color: 'bg-teal-100 border-teal-300' },
  ],
  [Department.NURSERY]: [
     { id: 'lit', name: 'Language & Literacy', category: 'Core', color: 'bg-blue-100 border-blue-300' },
    { id: 'num', name: 'Numeracy', category: 'Core', color: 'bg-green-100 border-green-300' },
    { id: 'env', name: 'Environmental Studies', category: 'Core', color: 'bg-yellow-100 border-yellow-300' },
    { id: 'art', name: 'Creative Arts', category: 'Elective', color: 'bg-purple-100 border-purple-300' },
    { id: 'mus', name: 'Music & Movement', category: 'Activity', color: 'bg-pink-100 border-pink-300' },
    { id: 'phy', name: 'Physical Dev', category: 'Activity', color: 'bg-orange-100 border-orange-300' },
  ],
  [Department.KG]: [
    { id: 'lit', name: 'Language & Literacy', category: 'Core', color: 'bg-blue-100 border-blue-300' },
    { id: 'num', name: 'Numeracy', category: 'Core', color: 'bg-green-100 border-green-300' },
    { id: 'env', name: 'Environmental Studies', category: 'Core', color: 'bg-yellow-100 border-yellow-300' },
    { id: 'owop', name: 'Our World Our People', category: 'Core', color: 'bg-red-100 border-red-300' },
    { id: 'ict', name: 'ICT Basic', category: 'Elective', color: 'bg-slate-100 border-slate-300' },
    { id: 'art', name: 'Creative Arts', category: 'Elective', color: 'bg-purple-100 border-purple-300' },
  ],
  [Department.LOWER_BASIC]: [
    { id: 'eng', name: 'English Language', category: 'Core', color: 'bg-blue-200 border-blue-400' },
    { id: 'mat', name: 'Mathematics', category: 'Core', color: 'bg-green-200 border-green-400' },
    { id: 'sci', name: 'Science', category: 'Core', color: 'bg-emerald-200 border-emerald-400' },
    { id: 'his', name: 'History', category: 'Core', color: 'bg-amber-200 border-amber-400' },
    { id: 'rme', name: 'RME', category: 'Elective', color: 'bg-indigo-200 border-indigo-400' },
    { id: 'gha', name: 'Ghanaian Lang', category: 'Elective', color: 'bg-orange-200 border-orange-400' },
    { id: 'ict', name: 'ICT', category: 'Elective', color: 'bg-slate-200 border-slate-400' },
    { id: 'art', name: 'Creative Arts', category: 'Elective', color: 'bg-purple-200 border-purple-400' },
  ],
  [Department.UPPER_BASIC]: [
    { id: 'eng', name: 'English Language', category: 'Core', color: 'bg-blue-200 border-blue-400' },
    { id: 'mat', name: 'Mathematics', category: 'Core', color: 'bg-green-200 border-green-400' },
    { id: 'sci', name: 'Science', category: 'Core', color: 'bg-emerald-200 border-emerald-400' },
    { id: 'his', name: 'History', category: 'Core', color: 'bg-amber-200 border-amber-400' },
    { id: 'rme', name: 'RME', category: 'Elective', color: 'bg-indigo-200 border-indigo-400' },
    { id: 'gha', name: 'Ghanaian Lang', category: 'Elective', color: 'bg-orange-200 border-orange-400' },
    { id: 'ict', name: 'ICT', category: 'Elective', color: 'bg-slate-200 border-slate-400' },
    { id: 'art', name: 'Creative Arts', category: 'Elective', color: 'bg-purple-200 border-purple-400' },
  ],
  [Department.JHS]: [
    { id: 'eng', name: 'English Language', category: 'Core', color: 'bg-blue-300 border-blue-500' },
    { id: 'mat', name: 'Mathematics', category: 'Core', color: 'bg-green-300 border-green-500' },
    { id: 'sci', name: 'Integrated Science', category: 'Core', color: 'bg-emerald-300 border-emerald-500' },
    { id: 'soc', name: 'Social Studies', category: 'Core', color: 'bg-amber-300 border-amber-500' },
    { id: 'rme', name: 'RME', category: 'Core', color: 'bg-indigo-300 border-indigo-500' },
    { id: 'com', name: 'Computing', category: 'Core', color: 'bg-slate-300 border-slate-500' },
    { id: 'bdt', name: 'BDT', category: 'Elective', color: 'bg-violet-300 border-violet-500' },
    { id: 'fre', name: 'French', category: 'Elective', color: 'bg-cyan-300 border-cyan-500' },
    { id: 'art', name: 'Visual Arts', category: 'Elective', color: 'bg-purple-300 border-purple-500' },
  ]
};

export const CUSTOMARY_ACTIVITIES: Subject[] = [
  { id: 'worship', name: 'Worship', category: 'Activity', color: 'bg-yellow-400 border-yellow-600 font-bold' },
  { id: 'extra', name: 'Extra-Curricular', category: 'Activity', color: 'bg-sky-200 border-sky-400' },
  { id: 'library', name: 'Library', category: 'Activity', color: 'bg-lime-200 border-lime-400' },
  { id: 'club', name: 'Club Activity', category: 'Activity', color: 'bg-rose-200 border-rose-400' },
  { id: 'hymns', name: 'Singing & Hymns', category: 'Activity', color: 'bg-indigo-400 text-white border-indigo-600' },
  { id: 'plc', name: 'PLC Meeting', category: 'Activity', color: 'bg-black text-white border-gray-800' },
];

export const BREAK_SUBJECTS: Subject[] = [
  { id: 'snack', name: 'Snack Break', category: 'Break', color: 'bg-gray-100 border-gray-200 italic' },
  { id: 'lunch', name: 'Lunch Break', category: 'Break', color: 'bg-gray-200 border-gray-300 italic' },
  { id: 'assembly', name: 'Assembly', category: 'Activity', color: 'bg-slate-400 text-white border-slate-600' },
];