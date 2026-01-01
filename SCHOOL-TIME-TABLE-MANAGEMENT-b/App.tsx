
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Department, ClassLevel, Stream, TimetableEntry, Conflict, SchedulingRule, TimeSlot, FacilitatorConfig, AttendanceStatus, UsageStatus, ComplianceLog, Subject, SchoolConfig } from './types.ts';
import { DEPARTMENTS_STRUCTURE, DAYS, TIME_SLOTS, SUBJECTS_BY_DEPT, CUSTOMARY_ACTIVITIES, SUPPORT_TIME_SLOTS, INTERVENTION_SUBJECTS } from './constants.ts';
import { SchedulerService } from './schedulerService.ts';

const DEFAULT_RULES: SchedulingRule[] = [
  { id: '1', name: 'Morning Worship', targetDept: 'ALL', day: 'Monday', slotLabel: 'Period 1', subjectId: 'worship', isActive: true },
  { id: '2', name: 'Mid-week Hymns', targetDept: 'ALL', day: 'Wednesday', slotLabel: 'Period 1', subjectId: 'hymns', isActive: true },
  { id: '3', name: 'JHS Club Activity', targetDept: Department.JHS, day: 'Thursday', slotLabel: 'Period 7', subjectId: 'club', isActive: true },
  { id: '4', name: 'Staff PLC Meeting', targetDept: 'ALL', day: 'Friday', slotLabel: 'Period 6', subjectId: 'plc', isActive: true },
  { id: '5', name: 'Library Time', targetDept: Department.LOWER_BASIC, day: 'Tuesday', slotLabel: 'Period 4', subjectId: 'library', isActive: true },
];

const INITIAL_FACILITATORS: FacilitatorConfig[] = [
  { id: 'f1', name: 'Mr. Mensah', department: Department.JHS, subjectId: 'mat', availableDays: DAYS, periodsPerWeek: 5 },
  { id: 'f2', name: 'Mrs. Owusu', department: Department.JHS, subjectId: 'eng', availableDays: DAYS, periodsPerWeek: 5 },
  { id: 'f3', name: 'Dr. Appiah', department: Department.UPPER_BASIC, subjectId: 'sci', availableDays: ['Monday', 'Wednesday', 'Friday'], periodsPerWeek: 4 },
];

const INITIAL_STREAM_CONFIG: Record<ClassLevel, Stream[]> = Object.values(DEPARTMENTS_STRUCTURE).flat().reduce((acc, lvl) => {
  const singleStreamLevels: ClassLevel[] = ['Creche', 'Nursery 1', 'Nursery 2', 'KG 1', 'KG 2'];
  acc[lvl] = singleStreamLevels.includes(lvl) ? ['None'] : ['A', 'B', 'C'];
  return acc;
}, {} as Record<ClassLevel, Stream[]>);

const INITIAL_SCHOOL_CONFIG: SchoolConfig = {
  name: 'EduSched International Academy',
  logoUrl: 'https://cdn-icons-png.flaticon.com/512/2941/2941658.png',
  authorizer: 'Prof. Kofi Arhin (Headteacher)',
  term: 'First Term',
  academicYear: '2024/2025'
};

const App: React.FC = () => {
  const [view, setView] = useState<'timetable' | 'desk' | 'compliance' | 'curriculum' | 'support'>('timetable');
  const [selectedDept, setSelectedDept] = useState<Department>(Department.JHS);
  const [selectedLevel, setSelectedLevel] = useState<ClassLevel>('Basic 7');
  const [selectedStream, setSelectedStream] = useState<Stream>('A');
  const [activeComplianceDay, setActiveComplianceDay] = useState<string>(DAYS[0]);
  
  const [subjectsByDept, setSubjectsByDept] = useState<Record<Department, Subject[]>>(SUBJECTS_BY_DEPT);
  const [customaryActivities, setCustomaryActivities] = useState<Subject[]>(CUSTOMARY_ACTIVITIES);
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig>(INITIAL_SCHOOL_CONFIG);

  const [newSubName, setNewSubName] = useState('');
  const [newSubCategory, setNewSubCategory] = useState<'Core' | 'Elective' | 'Activity'>('Core');
  const [newSubDept, setNewSubDept] = useState<Department | 'Customary'>(Department.JHS);
  
  const [rules, setRules] = useState<SchedulingRule[]>(DEFAULT_RULES);
  const [slots, setSlots] = useState<TimeSlot[]>(TIME_SLOTS);
  const [facilitators, setFacilitators] = useState<FacilitatorConfig[]>(INITIAL_FACILITATORS);
  const [streamConfig, setStreamConfig] = useState<Record<ClassLevel, Stream[]>>(INITIAL_STREAM_CONFIG);
  
  const [complianceLogs, setComplianceLogs] = useState<Record<string, ComplianceLog>>({});
  const [allData, setAllData] = useState<TimetableEntry[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [isRulesLocked, setIsRulesLocked] = useState<boolean>(false);
  const [isSlotsLocked, setIsSlotsLocked] = useState<boolean>(false);
  const [isFacilitatorsLocked, setIsFacilitatorsLocked] = useState<boolean>(false);
  const [isStreamLocked, setIsStreamLocked] = useState<boolean>(false);
  const [isCurriculumLocked, setIsCurriculumLocked] = useState<boolean>(false);

  const [newSlotLabel, setNewSlotLabel] = useState('');
  const [newSlotStart, setNewSlotStart] = useState('08:00');
  const [newSlotEnd, setNewSlotEnd] = useState('08:40');
  const [newSlotIsBreak, setNewSlotIsBreak] = useState(false);
  const [newSlotIsAssembly, setNewSlotIsAssembly] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const data = SchedulerService.generateAllTimetables(
        rules, slots, facilitators, streamConfig, subjectsByDept, customaryActivities,
        SUPPORT_TIME_SLOTS, INTERVENTION_SUBJECTS
      );
      setAllData(data);
      setConflicts(SchedulerService.detectConflicts(data));
      setLastGenerated(new Date().toLocaleTimeString());
      setIsGenerating(false);
    }, 600);
  };

  useEffect(() => {
    handleGenerate();
  }, []);

  useEffect(() => {
    const available = streamConfig[selectedLevel] || ['None'];
    if (!available.includes(selectedStream)) {
      setSelectedStream(available[0]);
    }
  }, [selectedLevel, streamConfig, selectedStream]);

  const currentClassKey = selectedStream === 'None' ? `${selectedLevel}` : `${selectedLevel}-${selectedStream}`;
  
  const currentTimetable = useMemo(() => {
    return allData.filter(d => d.classKey === currentClassKey && !d.isIntervention);
  }, [allData, currentClassKey]);

  const currentSupportTimetable = useMemo(() => {
    return allData.filter(d => d.classKey === currentClassKey && d.isIntervention);
  }, [allData, currentClassKey]);

  const complianceEntries = useMemo(() => {
    return allData.filter(d => d.day === activeComplianceDay && !d.slot.isBreak && d.subject.id !== 'assembly');
  }, [allData, activeComplianceDay]);

  const complianceStats = useMemo(() => {
    // Added explicit type cast to ComplianceLog[] to resolve property access errors on 'unknown'
    const logs = Object.values(complianceLogs) as ComplianceLog[];
    if (logs.length === 0) return { attendance: 100, usage: 100, absent: 0, misused: 0 };
    const presentCount = logs.filter(l => l.attendance === 'Present' || l.attendance === 'Late').length;
    const correctCount = logs.filter(l => l.usage === 'Correct').length;
    return {
      attendance: Math.round((presentCount / logs.length) * 100),
      usage: Math.round((correctCount / logs.length) * 100),
      absent: logs.filter(l => l.attendance === 'Absent').length,
      misused: logs.filter(l => l.usage === 'Misused').length
    };
  }, [complianceLogs]);

  const getConflictDetails = (day: string, startTime: string) => {
    return conflicts.find(c => c.day === day && c.startTime === startTime && c.classKeys.includes(currentClassKey));
  };

  const updateCompliance = (classKey: string, slotTime: string, updates: Partial<ComplianceLog>) => {
    const key = `${activeComplianceDay}-${classKey}-${slotTime}`;
    setComplianceLogs(prev => ({ ...prev, [key]: { attendance: 'Pending', usage: 'Pending', ...(prev[key] || {}), ...updates } }));
  };

  const addSubject = () => {
    if (isCurriculumLocked || !newSubName) return;
    const newId = newSubName.toLowerCase().replace(/\s+/g, '-').substring(0, 10) + Math.floor(Math.random()*100);
    const newSub: Subject = {
      id: newId,
      name: newSubName,
      category: newSubCategory,
      color: 'bg-slate-100 border-slate-300'
    };

    if (newSubDept === 'Customary') {
      setCustomaryActivities([...customaryActivities, newSub]);
    } else {
      setSubjectsByDept({
        ...subjectsByDept,
        [newSubDept]: [...(subjectsByDept[newSubDept] || []), newSub]
      });
    }
    setNewSubName('');
  };

  const removeSubject = (dept: Department | 'Customary', id: string) => {
    if (isCurriculumLocked) return;
    if (dept === 'Customary') {
      setCustomaryActivities(customaryActivities.filter(s => s.id !== id));
    } else {
      setSubjectsByDept({
        ...subjectsByDept,
        [dept]: subjectsByDept[dept].filter(s => s.id !== id)
      });
    }
  };

  const updateFacilitator = (id: string, updates: Partial<FacilitatorConfig>) => {
    if (isFacilitatorsLocked) return;
    setFacilitators(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const toggleStreamMode = (lvl: ClassLevel) => {
    if (isStreamLocked) return;
    setStreamConfig(prev => {
      const current = prev[lvl];
      return { ...prev, [lvl]: current.includes('None') ? ['A', 'B', 'C'] : ['None'] };
    });
  };

  const addFacilitator = () => {
    const currentDeptSubs = subjectsByDept[Department.JHS] || [];
    const newFac: FacilitatorConfig = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Facilitator',
      department: Department.JHS,
      subjectId: currentDeptSubs.length > 0 ? currentDeptSubs[0].id : 'none',
      availableDays: DAYS,
      periodsPerWeek: 4
    };
    setFacilitators([...facilitators, newFac]);
  };

  const addSlot = () => {
    if (isSlotsLocked || !newSlotLabel) return;
    const newSlot: TimeSlot = { 
      label: newSlotLabel, 
      startTime: newSlotStart, 
      endTime: newSlotEnd, 
      isBreak: newSlotIsBreak,
      isAssembly: newSlotIsAssembly
    };
    setSlots([...slots, newSlot]);
    setNewSlotLabel('');
  };

  const removeSlot = (index: number) => {
    if (isSlotsLocked) return;
    const newSlots = [...slots];
    newSlots.splice(index, 1);
    setSlots(newSlots);
  };

  const moveSlot = (index: number, direction: 'up' | 'down') => {
    if (isSlotsLocked) return;
    const newSlots = [...slots];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slots.length) return;
    const [removed] = newSlots.splice(index, 1);
    newSlots.splice(targetIndex, 0, removed);
    setSlots(newSlots);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSchoolConfig({ ...schoolConfig, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-slate-900 text-white shadow-xl p-4 no-print sticky top-0 z-50">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-inner cursor-pointer" onClick={() => setView('desk')}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <div className="cursor-pointer" onClick={() => setView('desk')}>
              <h1 className="text-xl font-bold tracking-tight">{schoolConfig.name}</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Institutional Governance Hub</p>
            </div>
          </div>

          <nav className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
            <button onClick={() => setView('timetable')} className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${view === 'timetable' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>Academic</button>
            <button onClick={() => setView('support')} className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${view === 'support' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>Support Lab</button>
            <button onClick={() => setView('curriculum')} className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${view === 'curriculum' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>Curriculum</button>
            <button onClick={() => setView('compliance')} className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${view === 'compliance' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>Compliance</button>
            <button onClick={() => setView('desk')} className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${view === 'desk' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>Management</button>
          </nav>

          <div className="flex gap-2">
            <button onClick={handleGenerate} disabled={isGenerating} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase transition-all shadow-lg ${isGenerating ? 'bg-slate-700 opacity-50 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}>
              <svg className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14H11V21L20 10H13Z" /></svg>
              {isGenerating ? 'Generating...' : 'Generate Plan'}
            </button>
            <button onClick={handlePrint} className="bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded text-xs font-bold border border-slate-600">Print</button>
          </div>
        </div>
      </header>

      {view === 'timetable' ? (
        <main className="flex-1 container mx-auto p-4 flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-64 space-y-4 no-print">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 text-center flex flex-col items-center group cursor-pointer hover:border-indigo-300 transition-colors" onClick={() => setView('desk')}>
              <div className="relative">
                <img src={schoolConfig.logoUrl} alt="Logo" className="w-16 h-16 object-contain mb-3" onError={(e) => (e.currentTarget.style.display = 'none')} />
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </div>
              </div>
              <h3 className="text-xs font-black text-slate-800 uppercase leading-tight mb-1">{schoolConfig.name}</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase">{schoolConfig.term} • {schoolConfig.academicYear}</p>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">Departments</label>
              <div className="space-y-1">
                {Object.values(Department).map(d => (
                  <button key={d} onClick={() => { setSelectedDept(d); setSelectedLevel(DEPARTMENTS_STRUCTURE[d][0]); }} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${selectedDept === d ? 'bg-indigo-50 text-indigo-700 border-l-2 border-indigo-600' : 'hover:bg-slate-50'}`}>{d}</button>
                ))}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">Class Selection</label>
              <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value as ClassLevel)} className="w-full text-xs font-bold p-2 bg-slate-50 border rounded-lg mb-2">
                {DEPARTMENTS_STRUCTURE[selectedDept].map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
              </select>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">Streams</label>
              <div className="flex gap-1">
                {(streamConfig[selectedLevel] || ['None']).map(s => (
                  <button key={s} onClick={() => setSelectedStream(s)} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${selectedStream === s ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{s === 'None' ? 'Single' : s}</button>
                ))}
              </div>
            </div>
          </aside>

          <section className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto relative group">
            <button onClick={() => setView('desk')} className="absolute top-4 right-4 no-print opacity-0 group-hover:opacity-100 transition-opacity bg-slate-100 hover:bg-slate-200 p-2 rounded-lg border flex items-center gap-2 text-[10px] font-black uppercase text-slate-600">
               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
               Edit Details
            </button>
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <img src={schoolConfig.logoUrl} className="w-12 h-12 object-contain hidden md:block" alt="School Logo" />
                 <div>
                    <h2 className="text-xl font-black text-slate-900 leading-none mb-1">{schoolConfig.name}</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{schoolConfig.term} — {schoolConfig.academicYear} Academic Cycle</p>
                 </div>
              </div>
              <div className="text-right hidden sm:block">
                 <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Official Timetable</div>
                 <div className="text-lg font-black text-slate-800">{selectedLevel}{selectedStream !== 'None' ? ` Stream ${selectedStream}` : ''}</div>
              </div>
            </div>

            <table className="w-full border-collapse">
              <thead><tr className="bg-slate-50 border-b">
                <th className="p-3 text-left text-[10px] font-black text-slate-400 uppercase border-r tracking-widest">Session</th>
                {DAYS.map(day => <th key={day} className="p-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{day}</th>)}
              </tr></thead>
              <tbody>
                {slots.map((slot, idx) => (
                  <tr key={idx} className={`${slot.isBreak ? 'bg-slate-50/50' : 'border-b last:border-0'}`}>
                    <td className="p-3 border-r min-w-[120px]">
                      <div className="text-[11px] font-black text-slate-900">{slot.label}</div>
                      <div className="text-[9px] font-bold text-slate-400 tabular-nums">{slot.startTime} - {slot.endTime}</div>
                    </td>
                    {DAYS.map(day => {
                      const entry = currentTimetable.find(e => e.day === day && e.slot.startTime === slot.startTime);
                      if (!entry) return <td key={day} className="p-2"></td>;
                      const conflict = getConflictDetails(day, slot.startTime);
                      return (
                        <td key={day} className={`p-2 transition-all group relative border-l border-white/20 ${entry.subject.color} ${conflict ? 'ring-2 ring-rose-500 ring-inset shadow-lg z-10' : ''}`}>
                          <div className="flex flex-col h-full min-h-[50px] justify-between">
                            <span className="text-[10px] font-black leading-[1.1] mb-1">{entry.subject.name}</span>
                            <span className="text-[8px] font-bold opacity-70 truncate italic">{entry.teacherId}</span>
                            {conflict && <div className="absolute -top-1 -right-1 bg-rose-600 text-white text-[7px] px-1 rounded font-black border border-white">CLASH</div>}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-12 flex justify-between items-end border-t pt-8">
               <div className="text-[10px] text-slate-400 italic font-medium">Generated via EduSched Pro on {new Date().toLocaleDateString()}</div>
               <div className="text-right border-t-2 border-slate-900 pt-2 min-w-[200px]">
                  <div className="text-xs font-black text-slate-900">{schoolConfig.authorizer}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Authorized Signature / Stamp</div>
               </div>
            </div>
          </section>
        </main>
      ) : view === 'support' ? (
        <main className="flex-1 container mx-auto p-8 overflow-y-auto">
          <div className="flex flex-col lg:flex-row gap-8 mb-8">
            <div className="flex-1 bg-violet-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
               <div className="absolute -right-10 -bottom-10 opacity-10">
                 <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7L12 12L22 7L12 2Z M2 17L12 22L22 17L12 12L2 17Z"/></svg>
               </div>
               <div className="flex items-center gap-4 mb-4">
                  <img src={schoolConfig.logoUrl} className="w-10 h-10 object-contain invert" alt="School Logo" />
                  <h2 className="text-3xl font-black tracking-tight">Support Lab & Clinic</h2>
               </div>
               <p className="text-violet-200 text-sm font-medium max-w-lg">Intensification programs addressing reading, writing, cognitive alertness, and logical reasoning through differential learning pathways at {schoolConfig.name}.</p>
               <div className="mt-6 flex gap-3">
                 <span className="bg-violet-800 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-violet-700">{schoolConfig.term} Cycle</span>
                 <span className="bg-violet-800 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-violet-700">{schoolConfig.academicYear} Session</span>
               </div>
            </div>
            
            <div className="lg:w-80 bg-white p-6 rounded-3xl shadow-sm border space-y-4">
               <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Active Focus Areas</h3>
               <div className="space-y-2">
                 {INTERVENTION_SUBJECTS.map(s => (
                   <div key={s.id} className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                     <div className={`w-3 h-3 rounded-full ${s.color}`}></div>
                     <div>
                       <div className="text-[10px] font-black text-slate-900">{s.name}</div>
                       <div className="text-[8px] font-bold text-slate-500 uppercase">{s.goal}</div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>

          <section className="bg-white rounded-3xl shadow-sm border p-8 overflow-x-auto">
             <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-black text-slate-900">{selectedLevel} Special Clinic</h3>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    {(streamConfig[selectedLevel] || ['None']).map(s => (
                      <button key={s} onClick={() => setSelectedStream(s)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${selectedStream === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>{s}</button>
                    ))}
                  </div>
                </div>
             </div>

             <table className="w-full border-collapse">
                <thead><tr className="border-b">
                   <th className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinic Session</th>
                   {DAYS.map(day => <th key={day} className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{day}</th>)}
                </tr></thead>
                <tbody>
                   {SUPPORT_TIME_SLOTS.map((slot, idx) => (
                     <tr key={idx} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                       <td className="p-4 border-r">
                         <div className="text-xs font-black text-slate-900">{slot.label}</div>
                         <div className="text-[9px] font-bold text-violet-600 uppercase tabular-nums">{slot.startTime} - {slot.endTime}</div>
                       </td>
                       {DAYS.map(day => {
                         const entry = currentSupportTimetable.find(e => e.day === day && e.slot.startTime === slot.startTime);
                         if (!entry) return <td key={day} className="p-4 text-center text-[8px] text-slate-300 font-bold uppercase">Rest Session</td>;
                         return (
                           <td key={day} className="p-4">
                              <div className={`rounded-2xl p-4 shadow-sm border-2 ${entry.subject.color} ring-4 ring-transparent hover:ring-violet-200 transition-all cursor-pointer`}>
                                 <div className="text-[11px] font-black mb-1 flex items-center justify-between">
                                    {entry.subject.name}
                                    <svg className="w-3 h-3 opacity-50" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.536 14.95a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zM15 11a1 1 0 11-2 0 1 1 0 012 0z"/></svg>
                                 </div>
                                 <div className="text-[9px] font-bold opacity-90 mb-2 uppercase tracking-tight">{entry.subject.goal}</div>
                                 <div className="flex items-center justify-between pt-2 border-t border-black/10">
                                   <span className="text-[8px] font-black uppercase opacity-60">Lead: {entry.teacherId}</span>
                                   <div className="flex -space-x-1">
                                      {[1,2,3].map(i => <div key={i} className="w-3 h-3 rounded-full border border-white bg-slate-300"></div>)}
                                   </div>
                                 </div>
                              </div>
                           </td>
                         );
                       })}
                     </tr>
                   ))}
                </tbody>
             </table>
          </section>
        </main>
      ) : view === 'curriculum' ? (
        <main className="flex-1 container mx-auto p-8 overflow-y-auto pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border p-6 relative">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-6 bg-indigo-600 rounded"></span>
                    Curriculum Inventory
                  </h3>
                  <button onClick={() => setIsCurriculumLocked(!isCurriculumLocked)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border ${isCurriculumLocked ? 'bg-rose-50 text-rose-600 shadow-sm' : 'bg-slate-50 text-slate-600'}`}>
                    {isCurriculumLocked ? 'Locked' : 'Unlocked'}
                  </button>
                </div>

                <div className={`mb-8 p-4 bg-slate-50 rounded-xl border border-slate-200 ${isCurriculumLocked ? 'opacity-50 pointer-events-none' : ''}`}>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block tracking-widest">Add Learning Area / Subject</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <input placeholder="Subject Name" value={newSubName} onChange={(e) => setNewSubName(e.target.value)} className="text-xs font-bold p-2 rounded-lg border focus:ring-2 focus:ring-indigo-500" />
                    <select value={newSubCategory} onChange={(e) => setNewSubCategory(e.target.value as any)} className="text-xs font-bold p-2 rounded-lg border">
                      <option value="Core">Core Subject</option>
                      <option value="Elective">Elective Area</option>
                      <option value="Activity">Customary Activity</option>
                    </select>
                    <select value={newSubDept} onChange={(e) => setNewSubDept(e.target.value as any)} className="text-xs font-bold p-2 rounded-lg border">
                      <option value="Customary">Global Activity</option>
                      {Object.values(Department).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <button onClick={addSubject} className="w-full py-2 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase hover:bg-indigo-700 transition-colors">Register Subject</button>
                </div>

                <div className="space-y-6">
                  {Object.entries(subjectsByDept).map(([dept, subs]) => (
                    <div key={dept} className="border-b last:border-0 pb-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{dept} Curriculum</h4>
                      <div className="flex flex-wrap gap-2">
                        {subs.map(s => (
                          <div key={s.id} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border shadow-sm group transition-all hover:border-indigo-200">
                            <div className={`w-2 h-2 rounded-full ${s.category === 'Core' ? 'bg-indigo-500' : 'bg-emerald-500'}`}></div>
                            <span className="text-xs font-bold text-slate-700">{s.name}</span>
                            <button onClick={() => removeSubject(dept as Department, s.id)} className="text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <button onClick={handleGenerate} className="w-full bg-emerald-600 text-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-3 hover:bg-emerald-500 transition-all border-4 border-emerald-400">
                <svg className={`w-12 h-12 ${isGenerating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                <div className="text-center">
                  <span className="text-xl font-black uppercase block tracking-tight">Sync & Generate</span>
                  <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Update all class timetables</span>
                </div>
              </button>
            </div>
          </div>
        </main>
      ) : view === 'compliance' ? (
        <main className="flex-1 container mx-auto p-8 overflow-y-auto pb-24">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl">
              <span className="text-[10px] font-black text-emerald-600 uppercase mb-1 block">Staff Attendance</span>
              <div className="text-3xl font-black text-emerald-900">{complianceStats.attendance}%</div>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl">
              <span className="text-[10px] font-black text-indigo-600 uppercase mb-1 block">Schedule Compliance</span>
              <div className="text-3xl font-black text-indigo-900">{complianceStats.usage}%</div>
            </div>
            <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl">
              <span className="text-[10px] font-black text-rose-600 uppercase mb-1 block">Missed Periods</span>
              <div className="text-3xl font-black text-rose-900">{complianceStats.absent}</div>
            </div>
            <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl">
              <span className="text-[10px] font-black text-amber-600 uppercase mb-1 block">Misused Slots</span>
              <div className="text-3xl font-black text-amber-900">{complianceStats.misused}</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span className="w-2 h-6 bg-indigo-600 rounded"></span>
                Operational Control
              </h3>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {DAYS.map(day => (
                  <button key={day} onClick={() => setActiveComplianceDay(day)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${activeComplianceDay === day ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{day.substring(0,3)}</button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b"><tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="pb-3 px-4">Time / Class</th>
                  <th className="pb-3 px-4">Facilitator / Subject</th>
                  <th className="pb-3 px-4">Attendance</th>
                  <th className="pb-3 px-4">Usage</th>
                  <th className="pb-3 px-4">Notes</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {complianceEntries.map((entry, i) => {
                    const logKey = `${activeComplianceDay}-${entry.classKey}-${entry.slot.startTime}`;
                    const log = complianceLogs[logKey] || { attendance: 'Pending', usage: 'Pending', notes: '' };
                    return (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="text-xs font-black text-slate-900">{entry.slot.startTime}</div>
                          <div className="text-[9px] font-bold text-indigo-600">{entry.classKey}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-xs font-bold text-slate-700">{entry.teacherId}</div>
                          <div className="text-[9px] font-black text-slate-400 uppercase">{entry.subject.name}</div>
                        </td>
                        <td className="py-4 px-4">
                          <select value={log.attendance} onChange={(e) => updateCompliance(entry.classKey, entry.slot.startTime, { attendance: e.target.value as AttendanceStatus })} className={`text-[10px] font-black p-1.5 rounded-lg border-none outline-none ring-1 ${log.attendance === 'Present' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : log.attendance === 'Absent' ? 'bg-rose-50 text-rose-700 ring-rose-200' : log.attendance === 'Late' ? 'bg-amber-50 text-amber-700 ring-amber-200' : 'bg-slate-50 text-slate-400 ring-slate-200'}`}>
                            <option value="Pending">Pending</option>
                            <option value="Present">Present</option>
                            <option value="Late">Late</option>
                            <option value="Absent">Absent</option>
                          </select>
                        </td>
                        <td className="py-4 px-4">
                          <select value={log.usage} onChange={(e) => updateCompliance(entry.classKey, entry.slot.startTime, { usage: e.target.value as UsageStatus })} className={`text-[10px] font-black p-1.5 rounded-lg border-none outline-none ring-1 ${log.usage === 'Correct' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : log.usage === 'Misused' ? 'bg-rose-50 text-rose-700 ring-rose-200' : log.usage === 'Unused' ? 'bg-slate-200 text-slate-600 ring-slate-300' : 'bg-slate-50 text-slate-400 ring-slate-200'}`}>
                            <option value="Pending">Pending</option>
                            <option value="Correct">Correct</option>
                            <option value="Misused">Misused</option>
                            <option value="Unused">Unused</option>
                          </select>
                        </td>
                        <td className="py-4 px-4">
                          <input placeholder="..." value={log.notes} onChange={(e) => updateCompliance(entry.classKey, entry.slot.startTime, { notes: e.target.value })} className="w-full text-[10px] bg-slate-50 border-none p-2 rounded-lg" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      ) : (
        <main className="flex-1 container mx-auto p-8 overflow-y-auto pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Institutional Branding Desk */}
              <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 p-8">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 mb-8">
                  <span className="w-2 h-6 bg-emerald-600 rounded"></span>
                  School Identity Desk
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">School Legal Name</label>
                      <input 
                        value={schoolConfig.name} 
                        onChange={(e) => setSchoolConfig({...schoolConfig, name: e.target.value})}
                        className="w-full text-sm font-bold p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Identity Logo</label>
                      <div className="flex gap-2">
                        <input 
                          value={schoolConfig.logoUrl} 
                          onChange={(e) => setSchoolConfig({...schoolConfig, logoUrl: e.target.value})}
                          className="flex-1 text-sm font-bold p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                          placeholder="Image URL..."
                        />
                        <button onClick={() => fileInputRef.current?.click()} className="bg-indigo-600 text-white px-4 rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-indigo-200">
                          Upload
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Headteacher / Registrar</label>
                      <input 
                        value={schoolConfig.authorizer} 
                        onChange={(e) => setSchoolConfig({...schoolConfig, authorizer: e.target.value})}
                        className="w-full text-sm font-bold p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                      />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Active Academic Term</label>
                        <select 
                          value={schoolConfig.term} 
                          onChange={(e) => setSchoolConfig({...schoolConfig, term: e.target.value})}
                          className="w-full text-sm font-bold p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none"
                        >
                          <option>First Term</option>
                          <option>Second Term</option>
                          <option>Third Term</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Academic Year</label>
                        <input 
                          value={schoolConfig.academicYear} 
                          onChange={(e) => setSchoolConfig({...schoolConfig, academicYear: e.target.value})}
                          className="w-full text-sm font-bold p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                          placeholder="2024/2025"
                        />
                      </div>
                   </div>
                </div>
                <div className="mt-8 flex items-center gap-6 p-6 bg-emerald-50/50 rounded-3xl border-2 border-dashed border-emerald-200">
                   <img src={schoolConfig.logoUrl} className="w-20 h-20 object-contain bg-white p-3 rounded-2xl shadow-sm" alt="Institutional Preview" onError={(e) => (e.currentTarget.src = 'https://placehold.co/100x100?text=Logo')} />
                   <div>
                      <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Live Branding Preview</div>
                      <div className="text-xl font-black text-slate-800 leading-tight">{schoolConfig.name}</div>
                      <div className="text-xs font-bold text-slate-500 flex items-center gap-2">
                        <span>{schoolConfig.academicYear} Cycle</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span>{schoolConfig.term}</span>
                      </div>
                   </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-slate-900">Stream Exclusion</h3>
                  <button onClick={() => setIsStreamLocked(!isStreamLocked)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all border ${isStreamLocked ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-600'}`}>{isStreamLocked ? 'Locked' : 'Unlocked'}</button>
                </div>
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 ${isStreamLocked ? 'opacity-50 pointer-events-none' : ''}`}>
                  {/* Fix: Added explicit type casting to [string, ClassLevel[]][] to resolve '.map' error on 'unknown' classes */}
                  {(Object.entries(DEPARTMENTS_STRUCTURE) as [string, ClassLevel[]][]).map(([dept, classes]) => (
                    <div key={dept} className="space-y-2">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{dept}</h4>
                      {classes.map(lvl => (
                        <div key={lvl} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                          <span className="text-xs font-bold text-slate-700">{lvl}</span>
                          <button onClick={() => toggleStreamMode(lvl)} className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${streamConfig[lvl]?.includes('None') ? 'bg-slate-200 text-slate-500' : 'bg-orange-50 text-orange-600'}`}>{streamConfig[lvl]?.includes('None') ? 'Exclusion' : 'Multi'}</button>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <button onClick={handleGenerate} disabled={isGenerating} className={`w-full p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 transition-all border-4 ${isGenerating ? 'bg-slate-700 border-slate-600 opacity-50 cursor-not-allowed' : 'bg-emerald-600 border-emerald-400 hover:bg-emerald-500'}`}>
                <svg className={`w-12 h-12 text-white ${isGenerating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14H11V21L20 10H13Z" /></svg>
                <div className="text-center text-white">
                  <span className="text-xl font-black uppercase block tracking-tight">{isGenerating ? 'Compiling...' : 'Commit & Rebuild'}</span>
                  <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Update Institutional Timetables</span>
                </div>
              </button>
              
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6"><h3 className="text-xl font-black text-slate-900 flex items-center gap-2"><span className="w-2 h-6 bg-indigo-600 rounded"></span>Slot Manager</h3><button onClick={() => setIsSlotsLocked(!isSlotsLocked)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all border ${isSlotsLocked ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-600'}`}>{isSlotsLocked ? 'Locked' : 'Unlocked'}</button></div>
                <div className={`mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200 ${isSlotsLocked ? 'opacity-50 pointer-events-none' : ''}`}><label className="text-[10px] font-black text-slate-400 uppercase mb-3 block tracking-widest">Create Time Period</label><div className="grid grid-cols-2 gap-3 mb-3"><div className="col-span-2"><input placeholder="Label" value={newSlotLabel} onChange={(e) => setNewSlotLabel(e.target.value)} className="w-full text-xs font-bold p-2 rounded-lg border focus:ring-2 focus:ring-indigo-500" /></div><div className="space-y-1"><span className="text-[8px] font-black text-slate-400 uppercase">Start</span><input type="time" value={newSlotStart} onChange={(e) => setNewSlotStart(e.target.value)} className="w-full text-xs p-2 rounded-lg border"/></div><div className="space-y-1"><span className="text-[8px] font-black text-slate-400 uppercase">End</span><input type="time" value={newSlotEnd} onChange={(e) => setNewSlotEnd(e.target.value)} className="w-full text-xs p-2 rounded-lg border"/></div></div><div className="flex gap-4 mb-4"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={newSlotIsBreak} onChange={(e) => {setNewSlotIsBreak(e.target.checked); if(e.target.checked) setNewSlotIsAssembly(false);}} className="rounded text-indigo-600"/><span className="text-[10px] font-bold text-slate-600">Break?</span></label><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={newSlotIsAssembly} onChange={(e) => {setNewSlotIsAssembly(e.target.checked); if(e.target.checked) setNewSlotIsBreak(false);}} className="rounded text-indigo-600"/><span className="text-[10px] font-bold text-slate-600">Assembly?</span></label></div><button onClick={addSlot} className="w-full py-2 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase hover:bg-indigo-700 transition-colors shadow-sm">Add Slot</button></div>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default App;
