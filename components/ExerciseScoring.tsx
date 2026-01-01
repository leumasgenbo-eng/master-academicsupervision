
import React, { useState, useEffect } from 'react';
import { PupilExerciseScore, DailyScore } from '../types';
import { ALL_CLASSES, DAYS_OF_WEEK } from '../constants';

const ExerciseScoring: React.FC = () => {
  const [assignedClass, setAssignedClass] = useState('Basic 1');
  const [subject, setSubject] = useState('Mathematics');
  const [batchWeek, setBatchWeek] = useState(1);
  const [batchMaxScore, setBatchMaxScore] = useState(10);
  
  const createInitialDailyScore = (): DailyScore => ({ max: batchMaxScore, score: null, reason: 'None' });

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
    'None', 'Absent', 'Left book home', 'Missing book', 'Misplaced book', 'Incomplete work', 'Poor attitude', 'Learning difficulty'
  ];

  const updatePupilScore = (id: string, day: string, field: keyof DailyScore, value: any) => {
    setPupilScores(prev => prev.map(p => {
      if (p.id === id && !p.isClosed) {
        const dayKey = day.toLowerCase() as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
        return { ...p, [dayKey]: { ...p[dayKey], [field]: value } };
      }
      return p;
    }));
  };

  const applyBatchMax = () => {
    setPupilScores(prev => prev.map(p => {
      if (p.isClosed) return p;
      return {
        ...p,
        monday: { ...p.monday, max: batchMaxScore },
        tuesday: { ...p.tuesday, max: batchMaxScore },
        wednesday: { ...p.wednesday, max: batchMaxScore },
        thursday: { ...p.thursday, max: batchMaxScore },
        friday: { ...p.friday, max: batchMaxScore },
      };
    }));
  };

  const addPupilRow = () => {
    const name = prompt("Enter Pupil Name:");
    if (name) {
      setPupilScores(prev => [...prev, {
        id: Date.now().toString(),
        pupilName: name,
        week: batchWeek,
        monday: createInitialDailyScore(),
        tuesday: createInitialDailyScore(),
        wednesday: createInitialDailyScore(),
        thursday: createInitialDailyScore(),
        friday: createInitialDailyScore(),
        isClosed: false
      }]);
    }
  };

  const saveScores = () => {
    const records = JSON.parse(localStorage.getItem('pupil_exercise_scores') || '[]');
    localStorage.setItem('pupil_exercise_scores', JSON.stringify([{ timestamp: new Date().toISOString(), data: pupilScores }, ...records]));
    alert('Exercise scores logged.');
  };

  return (
    <div className="max-w-[98%] mx-auto py-6 px-2 animate-in fade-in duration-700">
      <header className="mb-8 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg">🖊️</div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Daily Exercise Scoring</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pupil Achievement Register</p>
          </div>
        </div>
        <div className="flex gap-4">
          <select value={assignedClass} onChange={e => setAssignedClass(e.target.value)} className="bg-slate-50 border-none rounded-xl text-xs font-black p-2">
            {ALL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="number" value={batchMaxScore} onChange={e => setBatchMaxScore(Number(e.target.value))} className="w-16 bg-slate-50 border-none rounded-xl text-xs font-black p-2" placeholder="Max" />
          <button onClick={applyBatchMax} className="bg-blue-100 text-blue-700 text-[9px] font-black uppercase px-3 py-1 rounded-lg">Set All Max</button>
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="p-6 bg-slate-50 border-b flex justify-between items-center">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Weekly Grid (5 Days)</h2>
          <div className="flex gap-2">
            <button onClick={addPupilRow} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase">Add Pupil</button>
            <button onClick={() => setPupilScores(pupilScores.map(p => ({...p, isClosed: true})))} className="bg-rose-100 text-rose-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase">Close Week</button>
            <button onClick={saveScores} className="bg-blue-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase">Log Sheet</button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-4 text-[10px] font-black uppercase w-48 sticky left-0 z-10 bg-slate-900 border-r border-slate-800">Pupils</th>
                {DAYS_OF_WEEK.map(day => (
                  <th key={day} className="p-4 text-[10px] font-black uppercase text-center border-r border-slate-800">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pupilScores.map((p, idx) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-4 font-black text-[11px] text-slate-800 uppercase tracking-tighter sticky left-0 z-10 bg-white border-r">
                    {p.pupilName}
                    {p.isClosed && <span className="ml-2 text-rose-500 font-black text-[8px]">LOCKED</span>}
                  </td>
                  {DAYS_OF_WEEK.map(day => {
                    const dayKey = day.toLowerCase() as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
                    const dayData = p[dayKey];
                    return (
                      <td key={day} className="p-4 border-r text-center">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-center gap-1">
                            <input 
                              type="number" 
                              value={dayData.max} 
                              disabled={p.isClosed}
                              onChange={e => updatePupilScore(p.id, day, 'max', Number(e.target.value))}
                              className="w-10 bg-slate-50 border border-slate-100 rounded p-1 text-center text-[9px] font-bold"
                            />
                            <span className="text-slate-200">:</span>
                            <input 
                              type="number" 
                              value={dayData.score === null ? '' : dayData.score} 
                              disabled={p.isClosed}
                              placeholder="-"
                              onChange={e => updatePupilScore(p.id, day, 'score', e.target.value === '' ? null : Number(e.target.value))}
                              className={`w-12 border-2 rounded p-1 text-center text-xs font-black ${dayData.score === dayData.max ? 'border-emerald-100 bg-emerald-50/20 text-emerald-600' : 'border-blue-50 text-blue-600'}`}
                            />
                          </div>
                          {(dayData.score === null || dayData.score === 0) && (
                            <select 
                              value={dayData.reason} 
                              disabled={p.isClosed}
                              onChange={e => updatePupilScore(p.id, day, 'reason', e.target.value)}
                              className={`w-full text-[8px] font-black p-1 rounded border-none outline-none ${dayData.reason !== 'None' ? 'bg-rose-100 text-rose-500' : 'bg-slate-100 text-slate-400'}`}
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
      </div>
    </div>
  );
};

export default ExerciseScoring;
