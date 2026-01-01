
export enum SchoolLevel {
  Creche = 'Creche',
  Nursery = 'Nursery',
  KG = 'KG',
  JHS = 'JHS',
  LBS = 'LBS',
  UBS = 'UBS'
}

export enum Term {
  Term1 = 'Term 1',
  Term2 = 'Term 2',
  Term3 = 'Term 3'
}

export enum TaskType {
  ClassExercise = 'Class Exercise',
  Homework = 'Homework',
  ProjectWork = 'Project Work',
  Practical = 'Practical',
  SBA = 'SBA (CAT)'
}

export enum SBA_CAT {
  CAT1 = 'CAT 1',
  CAT2 = 'CAT 2',
  CAT3 = 'CAT 3',
  NONE = 'None'
}

export interface SubjectConfig {
  core: string[];
  elective: string[];
}

export interface FacilitatorLoad {
  subject: string;
  assignedClass: string;
}

export interface FacilitatorAssignment {
  id: string;
  name: string;
  assignments: FacilitatorLoad[];
  periods: Record<string, Record<string, string>>;
}

export interface CATParameter {
  type: 'Individual' | 'Group';
  maxScore: number;
  weight: number;
  date: string;
  questionType: 'Objective' | 'Essay' | 'Practical' | 'Project';
}

export interface PupilSBAScore {
  id: string;
  name: string;
  cat1: number;
  cat2: number;
  cat3: number;
}

export interface DailyScore {
  max: number;
  score: number | null;
  reason: string;
}

export interface PupilExerciseScore {
  id: string;
  pupilName: string;
  week: number;
  monday: DailyScore;
  tuesday: DailyScore;
  wednesday: DailyScore;
  thursday: DailyScore;
  friday: DailyScore;
  isClosed: boolean;
}

export interface ExerciseRecord {
  id: string;
  timestamp: string;
  schoolName: string;
  academicYear: string;
  term: Term;
  week: string;
  weekStartDate: string;
  weekEndDate: string;
  level: SchoolLevel;
  assignedClass: string;
  subject: string;
  teacherName: string;
  strand: string;
  subStrand: string;
  indicators: string;
  materials: string;
  pageReferences: string;
  pedagogicalAlignment: {
    numQuestions: number;
    typeOfQuestions: string;
    bloomsAlignment: string;
    correctionMarked: boolean;
  };
  workAudit: {
    hasDate: boolean;
    hasExNumber: boolean;
    goodHandwriting: boolean;
    spellingChecked: boolean;
    textureChecked: boolean;
  };
  challenges: string;
  improvementStrategies: string;
  pupilScores: PupilExerciseScore[];
}

export interface SBAConfig {
  subject: string;
  assignedClass: string;
  cat1: CATParameter;
  cat2: CATParameter;
  cat3: CATParameter;
  pupils: PupilSBAScore[];
}

export interface SupervisionRecord {
  id: string;
  timestamp: string;
  teacherName: string;
  staffId: string;
  classSubject: string;
  topic: string;
  date: string;
  duration: string;
  strands: string;
  indicators: string;
  classSize: number;
  schemeStatus: 'Attached' | 'Not Attached';
  planScores: { [key: string]: number };
  obsScores: { [key: string]: number };
  qualitative: {
    strengths: string;
    areasForImprovement: string;
    reflectiveEvidence: string;
    learnerPatterns: string;
  };
  decision: string;
  supervisorComments: string;
  supervisorName: string;
  signatureDate: string;
}
