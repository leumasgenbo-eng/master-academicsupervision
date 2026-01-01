
import React, { useState, useEffect } from 'react';
import { SchoolLevel, SubjectConfig } from '../types';
import { SUBJECT_LISTS, LEVELS } from '../constants';

const SubjectManager: React.FC = () => {
  const [activeLevel, setActiveLevel] = useState<SchoolLevel>(SchoolLevel.LBS);
  const [subjects, setSubjects] = useState<Record<SchoolLevel, SubjectConfig>>(SUBJECT_LISTS);
  const [newCore, setNewCore] = useState('');
  const [newElective, setNewElective] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('edutrack_subjects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const merged = { ...SUBJECT_LISTS, ...parsed };
        setSubjects(merged);
      } catch (e) {
        console.error("Failed to load subjects", e);
      }
    }
  }, []);

  const saveSubjects = (updated: Record<SchoolLevel, SubjectConfig>) => {
    setSubjects(updated);
    localStorage.setItem('edutrack_subjects', JSON.stringify(updated));
  };

  const addSubject = (type: 'core' | 'elective') => {
    const val = type === 'core' ? newCore.trim() : newElective.trim();
    if (!val) return;
    const updated = { ...subjects };
    if (!updated[activeLevel][type].includes(val)) {
      updated[activeLevel][type] = [...updated[activeLevel][type], val];
      saveSubjects(updated);
    }
    if (type === 'core') setNewCore('');
    else setNewElective('');
  };

  const removeSubject = (type: 'core' | 'elective', subject: string) => {
    const updated = { ...subjects };
    updated[activeLevel][type] = updated[activeLevel][type].filter(s => s !== subject);
    saveSubjects(updated);
  };

  return (
    <div className="max-w-[98%] mx-auto py-4 px-2 animate-in fade-in duration-500">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Subject Manager</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Configuration Console</p>
        </div>
        <button onClick={() => saveSubjects(SUBJECT_LISTS)} className="text-[8px] font-black uppercase text-red-400 border border-red-50 px-2 py-1 rounded">Reset Defaults</button>
      </header>

      <div className="flex bg-slate-200 p-1 rounded-2xl mb-6 overflow-x-auto no-scrollbar">
        {LEVELS.map(level => (
          <button
            key={level.id}
            onClick={() => setActiveLevel(level.id)}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${
              activeLevel === level.id ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'
            }`}
          >
            {level.label.split(' ')[0]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200">
          <h2 className="text-sm font-black text-slate-800 uppercase mb-4">Core Areas</h2>
          <div className="flex gap-2 mb-4">
            <input value={newCore} onChange={e => setNewCore(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSubject('core')} className="flex-1 bg-slate-50 border-2 border-slate-50 rounded-xl px-4 py-2 text-xs font-bold focus:border-blue-400 outline-none transition-all" placeholder="Add..." />
            <button onClick={() => addSubject('core')} className="bg-slate-900 text-white px-4 rounded-xl font-black">+</button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 max-h-[600px] overflow-y-auto pr-1">
            {subjects[activeLevel]?.core.map(s => (
              <div key={s} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-transparent hover:border-blue-100 hover:bg-white transition-all group">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">{s}</span>
                <button onClick={() => removeSubject('core', s)} className="text-red-300 hover:text-red-500 text-[10px] opacity-0 group-hover:opacity-100">✕</button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200">
          <h2 className="text-sm font-black text-slate-800 uppercase mb-4">Elective Areas</h2>
          <div className="flex gap-2 mb-4">
            <input value={newElective} onChange={e => setNewElective(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSubject('elective')} className="flex-1 bg-slate-50 border-2 border-slate-50 rounded-xl px-4 py-2 text-xs font-bold focus:border-blue-400 outline-none transition-all" placeholder="Add..." />
            <button onClick={() => addSubject('elective')} className="bg-slate-900 text-white px-4 rounded-xl font-black">+</button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 max-h-[600px] overflow-y-auto pr-1">
            {subjects[activeLevel]?.elective.map(s => (
              <div key={s} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-transparent hover:border-indigo-100 hover:bg-white transition-all group">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">{s}</span>
                <button onClick={() => removeSubject('elective', s)} className="text-red-300 hover:text-red-500 text-[10px] opacity-0 group-hover:opacity-100">✕</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectManager;
