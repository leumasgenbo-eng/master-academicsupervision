
import { 
  Department, ClassLevel, Stream, TimeSlot, Subject, 
  TimetableEntry, Conflict, SchedulingRule, FacilitatorConfig 
} from './types.ts';
import { 
  DAYS, DEPARTMENTS_STRUCTURE, BREAK_SUBJECTS 
} from './constants.ts';

export class SchedulerService {
  static generateAllTimetables(
    rules: SchedulingRule[], 
    slots: TimeSlot[], 
    facilitators: FacilitatorConfig[],
    streamConfig: Record<ClassLevel, Stream[]>,
    subjectsByDept: Record<Department, Subject[]>,
    customaryActivities: Subject[],
    supportSlots: TimeSlot[] = [],
    interventionSubjects: Subject[] = []
  ): TimetableEntry[] {
    const allEntries: TimetableEntry[] = [];

    Object.entries(DEPARTMENTS_STRUCTURE).forEach(([dept, classes]) => {
      classes.forEach((lvl) => {
        const availableStreams = streamConfig[lvl as ClassLevel] || ['None'];
        availableStreams.forEach((stream) => {
          const classKey = stream === 'None' ? `${lvl}` : `${lvl}-${stream}`;
          
          // Generate Standard
          allEntries.push(...this.generateClassTimetable(
            dept as Department, 
            lvl as ClassLevel, 
            stream, 
            classKey, 
            rules, 
            slots, 
            facilitators,
            subjectsByDept[dept as Department] || [],
            customaryActivities
          ));

          // Generate Support (Intervention) if provided
          if (supportSlots.length > 0 && interventionSubjects.length > 0) {
            allEntries.push(...this.generateSupportTimetable(
              dept as Department,
              lvl as ClassLevel,
              stream,
              classKey,
              supportSlots,
              facilitators,
              interventionSubjects
            ));
          }
        });
      });
    });

    return allEntries;
  }

  private static generateSupportTimetable(
    dept: Department,
    lvl: ClassLevel,
    stream: Stream,
    classKey: string,
    slots: TimeSlot[],
    facilitators: FacilitatorConfig[],
    subjects: Subject[]
  ): TimetableEntry[] {
    const entries: TimetableEntry[] = [];
    
    DAYS.forEach((day) => {
      slots.forEach((slot, idx) => {
        const seed = Array.from(classKey + day + slot.label).reduce((a, b) => a + b.charCodeAt(0), 0);
        const subject = subjects[seed % subjects.length];
        
        // Pick a relevant teacher for the department
        const teacher = facilitators.find(f => f.department === dept) || { name: 'Intervention Specialist' };
        
        entries.push({
          day,
          slot,
          subject,
          teacherId: typeof teacher === 'string' ? teacher : teacher.name,
          classKey,
          isIntervention: true
        });
      });
    });

    return entries;
  }

  private static generateClassTimetable(
    dept: Department, 
    lvl: ClassLevel, 
    stream: Stream, 
    classKey: string,
    rules: SchedulingRule[],
    slots: TimeSlot[],
    facilitators: FacilitatorConfig[],
    subjects: Subject[],
    customaryActivities: Subject[]
  ): TimetableEntry[] {
    const entries: TimetableEntry[] = [];
    
    const demandTracker: Record<string, number> = {};
    subjects.forEach(s => {
      const config = facilitators.find(f => f.department === dept && f.subjectId === s.id);
      demandTracker[s.id] = config ? config.periodsPerWeek : 4;
    });

    DAYS.forEach((day) => {
      let lastSubjectId = '';

      slots.forEach((slot) => {
        let subject: Subject;

        const activeRule = rules.find(r => 
          r.isActive && 
          (r.targetDept === 'ALL' || r.targetDept === dept) && 
          r.day === day && 
          r.slotLabel === slot.label
        );

        if (slot.isAssembly) {
          subject = BREAK_SUBJECTS.find(s => s.id === 'assembly')!;
        } else if (slot.isBreak) {
          subject = slot.label.includes('Snack') 
            ? BREAK_SUBJECTS.find(s => s.id === 'snack')!
            : BREAK_SUBJECTS.find(s => s.id === 'lunch')!;
        } else if (activeRule) {
          subject = customaryActivities.find(s => s.id === activeRule.subjectId) || (subjects.length > 0 ? subjects[0] : BREAK_SUBJECTS[0]);
        } else {
          if (subjects.length === 0) {
            subject = BREAK_SUBJECTS[0];
          } else {
            let candidates = subjects.filter(s => s.id !== lastSubjectId && demandTracker[s.id] > 0);
            
            if (candidates.length === 0) {
               candidates = subjects.filter(s => s.id !== lastSubjectId);
            }
            if (candidates.length === 0) candidates = subjects;
            
            const seed = Array.from(classKey + day + slot.label).reduce((a, b) => a + b.charCodeAt(0), 0);
            subject = candidates[seed % candidates.length];
            
            if (demandTracker[subject.id] > 0) demandTracker[subject.id]--;
            lastSubjectId = subject.id;
          }
        }

        const teacherId = this.assignTeacher(dept, subject, day, facilitators);
        entries.push({ day, slot, subject, teacherId, classKey });
      });
    });

    return entries;
  }

  private static assignTeacher(
    dept: Department, 
    subject: Subject, 
    day: string, 
    facilitators: FacilitatorConfig[]
  ): string {
    if (subject.category === 'Break' || subject.id === 'assembly') return 'None';
    
    const assignedFacilitator = facilitators.find(f => 
      f.department === dept && 
      f.subjectId === subject.id && 
      f.availableDays.includes(day)
    );

    if (assignedFacilitator) return assignedFacilitator.name;

    if (dept === Department.UPPER_BASIC || dept === Department.JHS) {
        const crossFacilitator = facilitators.find(f => 
            (f.department === Department.UPPER_BASIC || f.department === Department.JHS) &&
            f.subjectId === subject.id &&
            f.availableDays.includes(day)
        );
        if (crossFacilitator) return crossFacilitator.name;
    }

    return 'Staff Pool';
  }

  static detectConflicts(allEntries: TimetableEntry[]): Conflict[] {
    const conflicts: Conflict[] = [];
    const grouped: Record<string, TimetableEntry[]> = {};

    allEntries.forEach(entry => {
      if (entry.teacherId === 'None' || entry.teacherId === 'Staff Pool') return;
      const key = `${entry.teacherId}-${entry.day}-${entry.slot.startTime}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(entry);
    });

    Object.values(grouped).forEach(entries => {
      if (entries.length > 1) {
        const hasHighSeverity = entries.some(e => 
          e.classKey.includes('Basic 7') || e.classKey.includes('Basic 8') || e.classKey.includes('Basic 9') ||
          e.classKey.includes('Basic 4') || e.classKey.includes('Basic 5') || e.classKey.includes('Basic 6')
        );

        conflicts.push({
          teacherId: entries[0].teacherId,
          day: entries[0].day,
          startTime: entries[0].slot.startTime,
          classKeys: entries.map(e => e.classKey),
          severity: hasHighSeverity ? 'high' : 'normal'
        });
      }
    });

    return conflicts;
  }
}