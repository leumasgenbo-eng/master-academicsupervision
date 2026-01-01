
export enum Department {
  CRECHE = 'Creche',
  NURSERY = 'Nursery',
  KG = 'Kindergarten',
  LOWER_BASIC = 'Lower Basic',
  UPPER_BASIC = 'Upper Basic',
  JHS = 'Junior High School'
}

export type ClassLevel = 
  | 'Creche'
  | 'Nursery 1' | 'Nursery 2'
  | 'KG 1' | 'KG 2'
  | 'Basic 1' | 'Basic 2' | 'Basic 3'
  | 'Basic 4' | 'Basic 5' | 'Basic 6'
  | 'Basic 7' | 'Basic 8' | 'Basic 9';

export type Stream = 'None' | 'A' | 'B' | 'C';

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Pending';
export type UsageStatus = 'Correct' | 'Unused' | 'Misused' | 'Pending';

export interface Subject {
  id: string;
  name: string;
  category: 'Core' | 'Elective' | 'Activity' | 'Break' | 'Intervention';
  color: string;
  goal?: string; // e.g. "Fluency", "Critical Thinking"
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  label: string;
  isBreak?: boolean;
  isAssembly?: boolean;
  isSupport?: boolean; // Early morning or After school
}

export interface SchedulingRule {
  id: string;
  name: string;
  targetDept: Department | 'ALL';
  day: string;
  slotLabel: string;
  subjectId: string;
  isActive: boolean;
}

export interface TimetableEntry {
  day: string;
  slot: TimeSlot;
  subject: Subject;
  teacherId: string;
  classKey: string;
  isIntervention?: boolean;
}

export interface ComplianceLog {
  attendance: AttendanceStatus;
  usage: UsageStatus;
  notes?: string;
}

export interface FacilitatorConfig {
  id: string;
  name: string;
  department: Department;
  subjectId: string;
  availableDays: string[];
  periodsPerWeek: number;
}

export interface Conflict {
  teacherId: string;
  day: string;
  startTime: string;
  classKeys: string[];
  severity: 'normal' | 'high'; 
}

export interface InterventionPlan {
  classLevel: ClassLevel;
  focusAreas: string[];
  studentCount: number;
}

export interface SchoolConfig {
  name: string;
  logoUrl: string;
  authorizer: string;
  term: string;
  academicYear: string;
}
