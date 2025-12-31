
import React, { useState, useEffect, useMemo } from 'react';
import { SchoolLevel, Term, TaskType, SBA_CAT, ExerciseRecord, FacilitatorAssignment, PupilExerciseScore, DailyScore } from '../types';
import { SUBJECT_LISTS, LEVELS, ALL_CLASSES, DAYS_OF_WEEK } from '../constants';

const ExerciseVetting: React.FC = () => {
  const dynamicSubjects = useMemo(() => {
    const saved = localStorage.getItem('edutrack_subjects');
    if (!saved) return SUBJECT_LISTS;
    try {
      const parsed = JSON.parse(saved);
      return { ...SUBJECT_LISTS, ...parsed };
    } catch (e) {
      return SUBJECT_LISTS;
    }
  }, []);

  const facilitators = useMemo<FacilitatorAssignment[]>(() => {
    const saved = localStorage.getItem('edutrack_facilitators');
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch (e) {
      return [];
    }
  }, []);

  const [formData, setFormData] = useState<Partial<ExerciseRecord>>({
    schoolName: '',
    academicYear: '2023/2024',
    term: Term.Term1,
    week: '1',
    weekStartDate: '',
    weekEndDate: '',
    level: SchoolLevel.LBS,
    assignedClass: 'Basic 1',
    subject: '',
    teacherName: '',
    strand: '',
    subStrand: '',
    indicators: '',
    materials: '',
    pageReferences: '',
    pedagogicalAlignment: {
      numQuestions: 0,
      typeOfQuestions: 'Objective',
      bloomsAlignment: 'Knowledge',
      correctionMarked: false,
    },
    workAudit: {
      hasDate: false,
      hasExNumber: false,
      goodHandwriting: false,
      spellingChecked: false,
      textureChecked: false,
    },
    challenges: '',
    improvementStrategies: ''
  });

  const createInitialDailyScore = (): DailyScore => ({ max: 10, score: null, reason: 'None' });

  const [pupilScores, setPupilScores] = useState<PupilExerciseScore[]>([
    { 
      id: '1', 
      pupilName: 'Kofi Mensah', 
      week: 1, 
      monday: createInitialDailyScore(),
      tuesday: createInitialDailyScore(),
      wednesday: createInitialDailyScore(),
      thursday: createInitialDailyScore(),
      friday: createInitialDailyScore(),
      isClosed: false 
    }
  ]);

  const defaultReasons = [
    'None',
    'Absent',
    'Left book home',
    'Missing book',
    'Misplaced book',
    'Incomplete work',
    'Poor attitude',
    'Learning difficulty'
  ];

  const bloomsLevels = ['Knowledge', 'Understanding', 'Application', 'Analysis', 'Synthesis', 'Evaluation'];
  const questionTypes = ['Objective', 'Essay', 'True/False', 'Matching', 'Practical', 'Project'];

  const updatePupilScore = (id: string, day: string, field: keyof DailyScore, value: any) => {
    setPupilScores(prev => prev.map(p => {
      if (p.id === id && !p.isClosed) {
        const dayKey = day.toLowerCase() as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
        return { ...p, [dayKey]: { ...p[dayKey], [field]: value } };
      }
      return p;
    }));
  };

  const closeWeek = () => {
    if (confirm("Closing the week will lock all scores for this record. Proceed?")) {
      setPupilScores(prev => prev.map(p => ({ ...p, isClosed: true })));
    }
  };

  const addPupilRow = () => {
    const name = prompt("Enter Pupil Name:");
    if (name) {
      setPupilScores(prev => [...prev, {
        id: Date.now().toString(),
        pupilName: name,
        week: Number(formData.week),
        monday: createInitialDailyScore(),
        tuesday: createInitialDailyScore(),
        wednesday: createInitialDailyScore(),
        thursday: createInitialDailyScore(),
        friday: createInitialDailyScore(),
        isClosed: false
      }]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : (type === 'number' ? Number(value) : value)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: ExerciseRecord = {
      ...formData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      pupilScores: pupilScores,
    } as ExerciseRecord;
    
    const existing = JSON.parse(localStorage.getItem('exercise_records') || '[]');
    localStorage.setItem('exercise_records', JSON.stringify([newRecord, ...existing]));
    alert('Full Academic Record with Pedagogical Vetting & Weekly Scores committed successfully!');
  };

  const currentLevelSubjects = useMemo(() => {
    if (!formData.level) return [];
    const config = dynamicSubjects[formData.level] as { core: string[], elective: string[] };
    if (!config) return [];
    return [...config.core, ...config.elective];
  }, [formData.level, dynamicSubjects]);

  const getClassLevel = (className: string): SchoolLevel => {
    if (['Basic 7', 'Basic 8', 'Basic 9'].includes(className)) return SchoolLevel.JHS;
    if (['Basic 4', 'Basic 5', 'Basic 6'].includes(className)) return SchoolLevel.UBS;
    if (['Basic 1', 'Basic 2', 'Basic 3'].includes(className)) return SchoolLevel.LBS;
    return SchoolLevel.LBS; 
  };

  const filteredClasses = useMemo(() => {
    if (!formData.level) return ALL_CLASSES;
    return ALL_CLASSES.filter(c => getClassLevel(c) === formData.level);
  }, [formData.level]);

  return (
    <div className="max-w-[98%] mx-auto py-6 px-4">
      <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-700">
        <header className="text-center mb-8 bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Comprehensive Academic Monitor</h1>
          <p className="text-blue-200 font-bold uppercase text-xs tracking-[0.3em] opacity-80">Institutional Quality Assurance & Pupil Progress Desk</p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Section A: Basic Info */}
          <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
            <h2 className="text-[12px] font-black text-blue-600 uppercase tracking-[0.25em] mb-6 flex items-center gap-4">
              <span className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-[12px] text-blue-600">A</span>
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">School Name</label>
                <input name="schoolName" required value={formData.schoolName} onChange={handleChange} className="w-full border-2 border-slate-50 rounded-2xl p-4 text-sm font-bold bg-slate-50 focus:bg-white focus:border-blue-400 outline-none transition-all" placeholder="Enter Full Institution Name" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">School Level</label>
                <select name="level" value={formData.level} onChange={handleChange} className="w-full border-2 border-slate-50 rounded-2xl p-4 text-sm font-bold bg-slate-50">
                  {LEVELS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Class</label>
                <select name="assignedClass" value={formData.assignedClass} onChange={handleChange} className="w-full border-2 border-slate-50 rounded-2xl p-4 text-sm font-bold bg-slate-50">
                  {filteredClasses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Subject</label>
                <select name="subject" required value={formData.subject} onChange={handleChange} className="w-full border-2 border-slate-50 rounded-2xl p-4 text-sm font-bold bg-slate-50">
                  <option value="">Select Subject</option>
                  {currentLevelSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Week Number</label>
                <input name="week" type="number" value={formData.week} onChange={handleChange} className="w-full border-2 border-slate-50 rounded-2xl p-4 text-sm font-bold bg-slate-50" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Week Start Date</label>
                <input name="weekStartDate" type="date" value={formData.weekStartDate} onChange={handleChange} className="w-full border-2 border-slate-50 rounded-2xl p-4 text-sm font-bold bg-slate-50" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Week End Date</label>
                <input name="weekEndDate" type="date" value={formData.weekEndDate} onChange={handleChange} className="w-full border-2 border-slate-50 rounded-2xl p-4 text-sm font-bold bg-slate-50" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Facilitator / Teacher</label>
                <select name="teacherName" required value={formData.teacherName} onChange={handleChange} className="w-full border-2 border-slate-50 rounded-2xl p-4 text-sm font-bold bg-slate-50">
                   <option value="">Select Facilitator</option>
                   {facilitators.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Section B: Curriculum Alignment */}
          <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
            <h2 className="text-[12px] font-black text-indigo-600 uppercase tracking-[0.25em] mb-6 flex items-center gap-4">
              <span className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-[12px] text-indigo-600">B</span>
              Curriculum Alignment
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Strand</label>
                <input name="strand" required value={formData.strand} onChange={handleChange} className="w-full border-2 border-slate-50 rounded-2xl p-4 text-sm font-bold bg-slate-50" placeholder="Main Learning Area" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Sub-Strand</label>
                <input name="subStrand" required value={formData.subStrand} onChange={handleChange} className="w-full border-2 border-slate-50 rounded-2xl p-4 text-sm font-bold bg-slate-50" placeholder="Specific Domain" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Learning Indicators</label>
                <textarea name="indicators" value={formData.indicators} onChange={handleChange} className="w-full border-2 border-slate-50 rounded-2xl p-4 text-sm font-medium bg-slate-50 h-24" placeholder="Codes and descriptions..." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">TLMs / Materials</label>
                  <input name="materials" value={formData.materials} onChange={handleChange} className="w-full border-2 border-slate-50 rounded-2xl p-4 text-sm font-bold bg-slate-50" placeholder="e.g. Counters, Charts" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Page References</label>
                  <input name="pageReferences" value={formData.pageReferences} onChange={handleChange} className="w-full border-2 border-slate-50 rounded-2xl p-4 text-sm font-bold bg-slate-50" placeholder="Textbook / Guide pages" />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Section C: Pedagogical Alignment & Audit */}
        <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
          <h2 className="text-[12px] font-black text-emerald-600 uppercase tracking-[0.25em] mb-8 flex items-center gap-4">
            <span className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-[12px] text-emerald-600">C</span>
            Pedagogical Alignment & Work Audit
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-b pb-2">Exercise Design</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Number of Questions</label>
                  <input name="pedagogicalAlignment.numQuestions" type="number" value={formData.pedagogicalAlignment?.numQuestions} onChange={handleChange} className="w-full border-2 border-slate-50 rounded-2xl p-4 text-sm font-bold bg-slate-50" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Type of Questions</label>
                  <select name="pedagogicalAlignment.typeOfQuestions" value={formData.pedagogicalAlignment?.typeOfQuestions} onChange={handleChange} className="w-full border-2 border-slate-50 rounded-2xl p-4 text-sm font-bold bg-slate-50">
                    {questionTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Bloom's Level</label>
                  <select name="pedagogicalAlignment.bloomsAlignment" value={formData.pedagogicalAlignment?.bloomsAlignment} onChange={handleChange} className="w-full border-2 border-slate-50 rounded-2xl p-4 text-sm font-bold bg-slate-50">
                    {bloomsLevels.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-8">
                  <input name="pedagogicalAlignment.correctionMarked" type="checkbox" checked={formData.pedagogicalAlignment?.correctionMarked} onChange={handleChange} className="w-5 h-5 accent-blue-600" id="correction" />
                  <label htmlFor="correction" className="text-[10px] font-black text-slate-600 uppercase">Correction Marked</label>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-b pb-2">Work Presentation Audit</h3>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { id: 'hasDate', label: 'Date Entered correctly' },
                  { id: 'hasExNumber', label: 'Exercise Number present' },
                  { id: 'goodHandwriting', label: 'Good Handwriting maintained' },
                  { id: 'spellingChecked', label: 'Spelling checked & verified' },
                  { id: 'textureChecked', label: 'Checked Texture of Learner book' }
                ].map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-emerald-100 hover:bg-white transition-all">
                    <label className="text-[11px] font-bold text-slate-700 uppercase">{item.label}</label>
                    <input 
                      type="checkbox" 
                      name={`workAudit.${item.id}`} 
                      checked={(formData.workAudit as any)?.[item.id]} 
                      onChange={handleChange} 
                      className="w-6 h-6 rounded-lg accent-emerald-500" 
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section D: 5-Day Scoring Grid */}
        <section className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-[12px] font-black text-rose-600 uppercase tracking-[0.25em] flex items-center gap-4">
              <span className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-[12px] text-rose-600">D</span>
              Weekly Exercise Entry (5 Days)
            </h2>
            <div className="flex gap-4">
              <button type="button" onClick={addPupilRow} className="bg-rose-50 text-rose-600 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-100 transition-all">+ Add Pupil</button>
              <button type="button" onClick={closeWeek} className="bg-slate-900 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all">Close Week</button>
            </div>
          </div>
          
          <div className="overflow-x-auto rounded-[2rem] border border-slate-100 shadow-inner">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="p-6 text-[10px] font-black uppercase w-64 sticky left-0 z-20 bg-slate-900 border-r border-slate-800">Learner Name</th>
                  {DAYS_OF_WEEK.map(day => (
                    <th key={day} className="p-6 text-center border-r border-slate-800">
                      <div className="text-[11px] font-black tracking-widest">{day}</div>
                      <div className="text-[8px] opacity-40 font-bold uppercase mt-1">Max Score : Obtained</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pupilScores.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-6 sticky left-0 z-10 bg-white border-r font-black text-xs text-slate-800 uppercase group">
                       <input 
                         value={p.pupilName} 
                         disabled={p.isClosed}
                         onChange={e => setPupilScores(prev => prev.map(old => old.id === p.id ? {...old, pupilName: e.target.value} : old))}
                         className="w-full bg-transparent border-none p-1 focus:ring-0 outline-none"
                       />
                       {p.isClosed && <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-rose-100 text-rose-600 text-[8px] px-2 py-0.5 rounded-full font-black">LOCKED</span>}
                    </td>
                    {DAYS_OF_WEEK.map(day => {
                      const dayKey = day.toLowerCase() as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
                      const dayData = p[dayKey];
                      const isDefaulter = (dayData.score === null || dayData.score === 0) && dayData.reason === 'None';
                      
                      return (
                        <td key={day} className={`p-6 border-r text-center ${isDefaulter ? 'bg-rose-50/20' : ''}`}>
                          <div className="flex flex-col items-center gap-3">
                             <div className="flex items-center gap-2">
                                <input 
                                  type="number" 
                                  value={dayData.max} 
                                  disabled={p.isClosed}
                                  onChange={e => updatePupilScore(p.id, day, 'max', Number(e.target.value))}
                                  className="w-12 bg-slate-50 border border-slate-100 rounded-xl p-2 text-center text-[10px] font-black text-slate-400"
                                />
                                <span className="text-slate-300 font-black">:</span>
                                <input 
                                  type="number" 
                                  placeholder="-"
                                  value={dayData.score === null ? '' : dayData.score} 
                                  disabled={p.isClosed}
                                  onChange={e => updatePupilScore(p.id, day, 'score', e.target.value === '' ? null : Number(e.target.value))}
                                  className={`w-14 border-2 rounded-xl p-2 text-center text-sm font-black transition-all ${dayData.score === dayData.max ? 'border-emerald-200 text-emerald-600 bg-emerald-50/30' : 'border-blue-100 text-blue-600 bg-white shadow-sm'}`}
                                />
                             </div>
                             {(dayData.score === null || dayData.score === 0) && (
                               <select 
                                 value={dayData.reason} 
                                 disabled={p.isClosed}
                                 onChange={e => updatePupilScore(p.id, day, 'reason', e.target.value)}
                                 className={`w-full text-[10px] font-black p-2 rounded-xl border-none outline-none shadow-sm transition-all ${dayData.reason !== 'None' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400'}`}
                               >
                                 {defaultReasons.map(r => <option key={r} value={r}>{r}</option>)}
                               </select>
                             )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Pedagogical Reflections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Challenges Observed</label>
              <textarea name="challenges" value={formData.challenges} onChange={handleChange} className="w-full border-2 border-slate-50 bg-slate-50 rounded-[1.5rem] p-5 text-sm font-medium h-32 focus:bg-white focus:border-blue-400 outline-none transition-all" placeholder="Pedagogical, environmental or behavioral hurdles..." />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Improvement Strategies</label>
              <textarea name="improvementStrategies" value={formData.improvementStrategies} onChange={handleChange} className="w-full border-2 border-slate-50 bg-slate-50 rounded-[1.5rem] p-5 text-sm font-medium h-32 focus:bg-white focus:border-blue-400 outline-none transition-all" placeholder="Planned interventions for next instructional cycle..." />
            </div>
          </div>
        </section>

        <div className="flex justify-center pb-12">
          <button type="submit" className="bg-blue-600 text-white px-20 py-5 rounded-[2rem] font-black uppercase text-sm tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all">
            Commit Full Academic Record & Vetting
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExerciseVetting;
