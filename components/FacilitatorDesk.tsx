
import React, { useState, useMemo, useEffect } from 'react';
import { FacilitatorAssignment, FacilitatorLoad, SchoolLevel } from '../types';
import { ALL_CLASSES, PERIOD_TIMES, DAYS_OF_WEEK, LEVELS } from '../constants';

const FacilitatorDesk: React.FC = () => {
  const [facilitators, setFacilitators] = useState<FacilitatorAssignment[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importCode, setImportCode] = useState('');
  const [viewMode, setViewMode] = useState<'register' | 'masterFree'>('register');
  const [viewDay, setViewDay] = useState(DAYS_OF_WEEK[0]);
  const [filterLevel, setFilterLevel] = useState<SchoolLevel | 'ALL'>('ALL');
  const [filterClass, setFilterClass] = useState<string | 'ALL'>('ALL');
  
  const [name, setName] = useState('');
  const [assignments, setAssignments] = useState<FacilitatorLoad[]>([{ subject: '', assignedClass: 'Basic 1' }]);
  const [formSelectedDay, setFormSelectedDay] = useState(DAYS_OF_WEEK[0]);
  
  const initialPeriods = () => DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = { P1: '', P2: '', P3: '', P4: '', P5: '', P6: '', P7: '', P8: '' };
    return acc;
  }, {} as Record<string, Record<string, string>>);
  
  const [periods, setPeriods] = useState<Record<string, Record<string, string>>>(initialPeriods());

  useEffect(() => {
    const saved = localStorage.getItem('edutrack_facilitators');
    if (saved) {
      try {
        setFacilitators(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse facilitators", e);
      }
    }
  }, []);

  const saveFacilitators = (updated: FacilitatorAssignment[]) => {
    setFacilitators(updated);
    localStorage.setItem('edutrack_facilitators', JSON.stringify(updated));
  };

  const getClassLevel = (className: string): SchoolLevel => {
    if (['Basic 7', 'Basic 8', 'Basic 9'].includes(className)) return SchoolLevel.JHS;
    if (['Basic 4', 'Basic 5', 'Basic 6'].includes(className)) return SchoolLevel.UBS;
    if (['Basic 1', 'Basic 2', 'Basic 3'].includes(className)) return SchoolLevel.LBS;
    if (className.includes('Kindergarten')) return SchoolLevel.KG;
    if (className.includes('Nursery')) return SchoolLevel.Nursery;
    if (className.includes('Creche')) return SchoolLevel.Creche;
    return SchoolLevel.LBS; 
  };

  const getClassesByLevel = (level: SchoolLevel | 'ALL'): string[] => {
    if (level === 'ALL') return ALL_CLASSES;
    return ALL_CLASSES.filter(c => getClassLevel(c) === level);
  };

  const updateAssignment = (index: number, field: string, value: string) => {
    const updated = [...assignments];
    (updated[index] as any)[field] = value;
    setAssignments(updated);
  };

  const resetForm = () => {
    setName('');
    setAssignments([{ subject: '', assignedClass: 'Basic 1' }]);
    setPeriods(initialPeriods());
  };

  const handleAddFacilitator = () => {
    if (!name.trim()) {
      alert("Please enter facilitator name.");
      return;
    }
    const validAssignments = assignments.filter(a => a.subject.trim() !== '');
    if (validAssignments.length === 0) {
      alert("Please add at least one subject load.");
      return;
    }

    const f: FacilitatorAssignment = {
      id: Date.now().toString(),
      name,
      assignments: validAssignments,
      periods: JSON.parse(JSON.stringify(periods)),
    };

    const updatedList = [...facilitators, f];
    saveFacilitators(updatedList);
    setShowAdd(false);
    resetForm();
    alert("Facilitator registered successfully!");
  };

  const deleteFacilitator = (id: string) => {
    if (confirm("Are you sure you want to delete this facilitator?")) {
      saveFacilitators(facilitators.filter(f => f.id !== id));
    }
  };

  const clashes = useMemo(() => {
    const clashMap: Record<string, Record<string, string[]>> = {}; 
    DAYS_OF_WEEK.forEach(day => {
      clashMap[day] = {};
      Object.keys(PERIOD_TIMES).forEach(period => {
        const classAssignments: Record<string, string[]> = {}; 
        facilitators.forEach(f => {
          const activity = f.periods[day][period];
          if (activity && activity !== 'Free') {
            const match = activity.match(/\(([^)]+)\)/);
            if (match) {
              const className = match[1];
              if (!classAssignments[className]) classAssignments[className] = [];
              classAssignments[className].push(f.name);
            }
          }
        });
        const clashingClasses = Object.entries(classAssignments)
          .filter(([_, teachers]) => teachers.length > 1)
          .map(([className, teachers]) => `${className} (${teachers.join(' & ')})`);
        if (clashingClasses.length > 0) clashMap[day][period] = clashingClasses;
      });
    });
    return clashMap;
  }, [facilitators]);

  const masterFreeSchedule = useMemo(() => {
    const matrix: Record<string, Record<string, string[]>> = {};
    DAYS_OF_WEEK.forEach(day => {
      matrix[day] = {};
      Object.keys(PERIOD_TIMES).forEach(p => {
        matrix[day][p] = facilitators
          .filter(f => !f.periods[day][p] || f.periods[day][p] === 'Free')
          .map(f => f.name);
      });
    });
    return matrix;
  }, [facilitators]);

  const filteredFacilitators = useMemo(() => {
    let result = facilitators;
    if (filterLevel !== 'ALL') {
      result = result.filter(f => f.assignments.some(a => getClassLevel(a.assignedClass) === filterLevel));
    }
    if (filterClass !== 'ALL') {
      result = result.filter(f => f.assignments.some(a => a.assignedClass === filterClass));
    }
    return result;
  }, [facilitators, filterLevel, filterClass]);

  const currentLevelClasses = useMemo(() => getClassesByLevel(filterLevel), [filterLevel]);

  return (
    <div className="max-w-[98%] mx-auto py-4 px-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">Facilitator Desk</h1>
          <div className="flex gap-4 mt-2">
            <button onClick={() => setViewMode('register')} className={`text-[9px] font-black uppercase tracking-widest ${viewMode === 'register' ? 'text-blue-600 border-b-2 border-blue-600 pb-0.5' : 'text-slate-400'}`}>Load Register</button>
            <button onClick={() => setViewMode('masterFree')} className={`text-[9px] font-black uppercase tracking-widest ${viewMode === 'masterFree' ? 'text-blue-600 border-b-2 border-blue-600 pb-0.5' : 'text-slate-400'}`}>Master Matrix</button>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setShowAdd(!showAdd)} className={`px-5 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg transition-all ${showAdd ? 'bg-slate-200 text-slate-700' : 'bg-blue-600 text-white'}`}>
            {showAdd ? 'Cancel Registration' : '+ Register New'}
          </button>
        </div>
      </div>

      {showAdd && (
        <section className="bg-white p-6 rounded-[2rem] shadow-xl border-2 border-blue-50 mb-8 animate-in slide-in-from-top-4 duration-300">
          <h2 className="text-sm font-black text-slate-900 uppercase mb-6 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center text-[10px]">NEW</span>
            Facilitator Registration
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Facilitator Name</label>
                <input 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="w-full border-2 border-slate-50 rounded-xl p-3 text-xs font-bold bg-slate-50 focus:bg-white focus:border-blue-400 outline-none transition-all" 
                  placeholder="e.g. Mr. Isaac Mensah" 
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Instructional Load</label>
                  <button onClick={() => setAssignments([...assignments, { subject: '', assignedClass: 'Basic 1' }])} className="text-[9px] font-black text-blue-600 uppercase">+ Add Row</button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {assignments.map((ass, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input 
                        value={ass.subject} 
                        onChange={e => updateAssignment(idx, 'subject', e.target.value)} 
                        className="flex-1 border-2 border-slate-50 rounded-xl p-2.5 text-[10px] font-bold bg-slate-50" 
                        placeholder="Subject" 
                      />
                      <select 
                        value={ass.assignedClass} 
                        onChange={e => updateAssignment(idx, 'assignedClass', e.target.value)} 
                        className="w-32 border-2 border-slate-50 rounded-xl p-2.5 text-[10px] font-bold bg-slate-50"
                      >
                        {ALL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      {assignments.length > 1 && (
                        <button onClick={() => setAssignments(assignments.filter((_,i) => i !== idx))} className="text-red-400 text-xs px-1">✕</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Timetable Mapping</label>
                <div className="flex gap-1 bg-white p-1 rounded-lg border shadow-sm">
                  {DAYS_OF_WEEK.map(day => (
                    <button 
                      key={day} 
                      onClick={() => setFormSelectedDay(day)} 
                      className={`px-2 py-1 rounded text-[8px] font-black uppercase transition-all ${formSelectedDay === day ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                    >
                      {day.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.keys(PERIOD_TIMES).map((p) => (
                  <div key={p} className="p-2 bg-white rounded-xl border border-slate-100">
                    <div className="text-[8px] font-black text-blue-600 mb-1">{p}</div>
                    <select 
                      value={periods[formSelectedDay][p]} 
                      onChange={e => setPeriods({...periods, [formSelectedDay]: {...periods[formSelectedDay], [p]: e.target.value}})} 
                      className="w-full text-[8px] font-bold bg-slate-50 border rounded p-1"
                    >
                      <option value="">Free</option>
                      {assignments.filter(a => a.subject).map((a, i) => (
                        <option key={i} value={`${a.subject} (${a.assignedClass})`}>{a.subject}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end border-t pt-6">
            <button onClick={handleAddFacilitator} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-black transition-all">Commit Facilitator to Register</button>
          </div>
        </section>
      )}

      {viewMode === 'register' ? (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-200">
             <div className="flex flex-wrap gap-2">
                <button onClick={() => { setFilterLevel('ALL'); setFilterClass('ALL'); }} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${filterLevel === 'ALL' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>All Levels</button>
                {LEVELS.map(l => (
                  <button key={l.id} onClick={() => { setFilterLevel(l.id); setFilterClass('ALL'); }} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${filterLevel === l.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{l.label.split(' ')[0]}</button>
                ))}
                {filterLevel !== 'ALL' && (
                  <div className="flex gap-1 ml-4 border-l pl-4">
                    <select 
                      value={filterClass} 
                      onChange={e => setFilterClass(e.target.value)}
                      className="text-[9px] font-black uppercase bg-slate-50 border-none rounded p-1"
                    >
                      <option value="ALL">All {filterLevel} Classes</option>
                      {currentLevelClasses.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                )}
             </div>
          </div>

          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[1400px]">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="p-4 text-[9px] font-black uppercase border-r border-slate-800 w-48">Name</th>
                    <th className="p-4 text-[9px] font-black uppercase border-r border-slate-800">Assignments</th>
                    {Object.keys(PERIOD_TIMES).map(p => (
                      <th key={p} className="p-2 text-[9px] font-black uppercase text-center border-r border-slate-800">
                        <div>{p}</div>
                        <div className="text-[6px] opacity-40 font-medium">{(PERIOD_TIMES as any)[p]}</div>
                      </th>
                    ))}
                    <th className="p-4 text-[9px] font-black uppercase text-center">Load</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFacilitators.length === 0 ? (
                    <tr><td colSpan={11} className="p-10 text-center text-[10px] font-black text-slate-400 uppercase">No facilitators recorded.</td></tr>
                  ) : (
                    filteredFacilitators.map(f => (
                      <tr key={f.id} className="hover:bg-slate-50 group">
                        <td className="p-4 border-r">
                           <div className="font-black text-xs uppercase tracking-tighter">{f.name}</div>
                           <button onClick={() => deleteFacilitator(f.id)} className="text-[8px] text-red-400 font-bold uppercase opacity-0 group-hover:opacity-100 transition-all">Remove</button>
                        </td>
                        <td className="p-4 border-r">
                           <div className="flex flex-wrap gap-1">
                              {f.assignments.map((ass, i) => (
                                <span key={i} className="px-2 py-0.5 bg-slate-100 rounded text-[8px] font-black uppercase text-slate-600">{ass.subject} ({ass.assignedClass})</span>
                              ))}
                           </div>
                        </td>
                        {Object.keys(PERIOD_TIMES).map(p => {
                          const act = f.periods[viewDay][p];
                          return (
                            <td key={p} className="p-2 border-r text-center">
                              <div className={`text-[8px] font-black p-1.5 rounded-lg truncate ${!act || act === 'Free' ? 'text-slate-100 bg-slate-50/50' : 'text-blue-700 bg-blue-50'}`}>
                                {act || 'Free'}
                              </div>
                            </td>
                          );
                        })}
                        <td className="p-4 text-center font-black text-[10px] text-slate-400">
                          {Object.values(f.periods[viewDay]).filter(v => v && v !== 'Free').length}/8
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 p-4 text-white text-center">
             <h2 className="text-[10px] font-black uppercase tracking-widest">Master Utilization Matrix • {viewDay}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1200px]">
              <thead>
                <tr className="bg-slate-50 border-b">
                   <th className="p-4 text-[9px] font-black uppercase border-r w-32">Period</th>
                   {Object.keys(PERIOD_TIMES).map(p => (
                     <th key={p} className="p-4 text-center border-r">
                        <div className="text-[9px] font-black text-slate-900">{p}</div>
                        <div className="text-[7px] font-bold text-slate-400">{(PERIOD_TIMES as any)[p]}</div>
                     </th>
                   ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-4 bg-slate-50 border-r font-black text-[9px] uppercase">Clash Alerts</td>
                  {Object.keys(PERIOD_TIMES).map(p => (
                    <td key={p} className={`p-2 border-r text-center ${clashes[viewDay][p] ? 'bg-red-50' : 'bg-white'}`}>
                       {clashes[viewDay][p] ? (
                         <div className="text-[8px] font-black text-red-600 uppercase animate-pulse">Clash: {clashes[viewDay][p].length} classes</div>
                       ) : (
                         <span className="text-[7px] text-slate-200 uppercase">Clear</span>
                       )}
                    </td>
                  ))}
                </tr>
                <tr>
                   <td className="p-4 bg-slate-50 border-r font-black text-[9px] uppercase">Available Staff</td>
                   {Object.keys(PERIOD_TIMES).map(p => (
                     <td key={p} className="p-2 border-r align-top">
                        <div className="space-y-1">
                           {masterFreeSchedule[viewDay][p].map(name => (
                             <div key={name} className="text-[8px] font-bold text-slate-500 uppercase truncate bg-slate-50 p-1 rounded border border-slate-100">{name}</div>
                           ))}
                           {masterFreeSchedule[viewDay][p].length === 0 && <div className="text-[7px] text-slate-300 text-center py-2 italic">None</div>}
                        </div>
                     </td>
                   ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilitatorDesk;
