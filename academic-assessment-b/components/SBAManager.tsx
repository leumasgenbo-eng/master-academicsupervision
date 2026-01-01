
import React, { useState, useEffect, useMemo } from 'react';
import { SBAConfig, CATParameter, PupilSBAScore } from '../types';
import { ALL_CLASSES } from '../constants';

const SBAManager: React.FC = () => {
  const [assignedClass, setAssignedClass] = useState('Basic 1');
  const [subject, setSubject] = useState('Mathematics');
  
  const [cat1, setCat1] = useState<CATParameter>({
    type: 'Individual',
    maxScore: 15,
    weight: 30,
    date: '',
    questionType: 'Objective'
  });

  const [cat2, setCat2] = useState<CATParameter>({
    type: 'Group',
    maxScore: 15,
    weight: 30,
    date: '',
    questionType: 'Objective'
  });

  const [cat3, setCat3] = useState<CATParameter>({
    type: 'Individual',
    maxScore: 15,
    weight: 40,
    date: '',
    questionType: 'Objective'
  });

  const [pupils, setPupils] = useState<PupilSBAScore[]>([
    { id: '1', name: 'Kofi Annan', cat1: 0, cat2: 0, cat3: 0 },
    { id: '2', name: 'Ama Konadu', cat1: 0, cat2: 0, cat3: 0 },
    { id: '3', name: 'Kwame Nkrumah', cat1: 0, cat2: 0, cat3: 0 }
  ]);

  const timetableCompliance = useMemo(() => {
    let compliance = 0;
    if (cat1.date) compliance += 33.3;
    if (cat2.date) compliance += 33.3;
    if (cat3.date) compliance += 33.4;
    return Math.min(100, Math.floor(compliance));
  }, [cat1.date, cat2.date, cat3.date]);

  const updatePupilScore = (id: string, field: 'cat1' | 'cat2' | 'cat3', val: string) => {
    const num = parseFloat(val) || 0;
    setPupils(prev => prev.map(p => p.id === id ? { ...p, [field]: num } : p));
  };

  const calculateTotal = (p: PupilSBAScore) => {
    const s1 = (p.cat1 / cat1.maxScore) * cat1.weight;
    const s2 = (p.cat2 / cat2.maxScore) * cat2.weight;
    const s3 = (p.cat3 / cat3.maxScore) * cat3.weight;
    return (s1 + s2 + s3).toFixed(1);
  };

  const addPupil = () => {
    const name = prompt("Enter Pupil Name:");
    if (name) {
      setPupils([...pupils, { id: Date.now().toString(), name, cat1: 0, cat2: 0, cat3: 0 }]);
    }
  };

  return (
    <div className="max-w-[98%] mx-auto py-6 px-2 animate-in fade-in duration-700">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">SBA Management Desk (Class SBA)</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Configure CAT 1, 2, 3 parameters based on Bloom's Taxonomy standards</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className={`text-2xl font-black ${timetableCompliance === 100 ? 'text-emerald-600' : 'text-amber-500'}`}>{timetableCompliance}%</div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Timetable Compliance</div>
          </div>
          <div className="h-10 w-px bg-slate-100"></div>
          <div>
            <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Select Subject</label>
            <select 
              value={subject} 
              onChange={e => setSubject(e.target.value)}
              className="bg-slate-50 border-none rounded-xl text-xs font-black uppercase p-2 text-blue-600"
            >
              <option>Mathematics</option>
              <option>English Language</option>
              <option>Science</option>
              <option>Social Studies</option>
            </select>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'CAT 1 (Individual)', state: cat1, setState: setCat1, color: 'border-blue-200' },
          { label: 'CAT 2 (Group)', state: cat2, setState: setCat2, color: 'border-emerald-200' },
          { label: 'CAT 3 (Individual)', state: cat3, setState: setCat3, color: 'border-indigo-200' }
        ].map((cat, idx) => (
          <div key={idx} className={`bg-white p-6 rounded-[2rem] shadow-sm border-2 ${cat.color} space-y-4`}>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex justify-between">
              {cat.label}
              {!cat.state.date && <span className="text-rose-500 text-[10px] animate-pulse">⚠️ Set Date</span>}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Type</label>
                <select 
                  value={cat.state.type}
                  onChange={e => cat.setState({...cat.state, type: e.target.value as any})}
                  className="w-full bg-slate-50 border-none rounded-lg p-2 text-[10px] font-bold"
                >
                  <option>Individual</option>
                  <option>Group</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Max Score</label>
                <input 
                  type="number" 
                  value={cat.state.maxScore}
                  onChange={e => cat.setState({...cat.state, maxScore: parseInt(e.target.value) || 0})}
                  className="w-full bg-slate-50 border-none rounded-lg p-2 text-[10px] font-bold" 
                />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Weight (%)</label>
                <input 
                  type="number" 
                  value={cat.state.weight}
                  onChange={e => cat.setState({...cat.state, weight: parseInt(e.target.value) || 0})}
                  className="w-full bg-slate-50 border-none rounded-lg p-2 text-[10px] font-bold" 
                />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Date</label>
                <input 
                  type="date" 
                  value={cat.state.date}
                  onChange={e => cat.setState({...cat.state, date: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-lg p-2 text-[10px] font-bold" 
                />
              </div>
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Question Type (Bloom's)</label>
              <select 
                value={cat.state.questionType}
                onChange={e => cat.setState({...cat.state, questionType: e.target.value as any})}
                className="w-full bg-slate-50 border-none rounded-lg p-2 text-[10px] font-bold"
              >
                <option>Objective</option>
                <option>Essay (Analysis)</option>
                <option>Practical (Creating)</option>
                <option>Project (Evaluating)</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
          <h2 className="text-sm font-black uppercase tracking-widest">Pupil SBA Performance Register</h2>
          <button onClick={addPupil} className="bg-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-blue-700 transition-all">+ Add Pupil</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase w-16">#</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase">Pupil Name</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase text-center bg-blue-50/30">CAT 1 ({cat1.maxScore})</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase text-center bg-emerald-50/30">CAT 2 ({cat2.maxScore})</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase text-center bg-indigo-50/30">CAT 3 ({cat3.maxScore})</th>
                <th className="p-4 text-[10px] font-black text-slate-900 uppercase text-center bg-slate-100">Total (100%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pupils.map((p, idx) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-4 text-[11px] font-black text-slate-400">{idx + 1}</td>
                  <td className="p-4 text-[11px] font-black text-slate-800 uppercase tracking-tighter">{p.name}</td>
                  <td className="p-4 text-center bg-blue-50/10">
                    <input 
                      type="number" 
                      value={p.cat1} 
                      max={cat1.maxScore}
                      onChange={e => updatePupilScore(p.id, 'cat1', e.target.value)}
                      className="w-16 bg-white border border-blue-100 rounded p-1 text-center text-xs font-black"
                    />
                  </td>
                  <td className="p-4 text-center bg-emerald-50/10">
                    <input 
                      type="number" 
                      value={p.cat2} 
                      max={cat2.maxScore}
                      onChange={e => updatePupilScore(p.id, 'cat2', e.target.value)}
                      className="w-16 bg-white border border-emerald-100 rounded p-1 text-center text-xs font-black"
                    />
                  </td>
                  <td className="p-4 text-center bg-indigo-50/10">
                    <input 
                      type="number" 
                      value={p.cat3} 
                      max={cat3.maxScore}
                      onChange={e => updatePupilScore(p.id, 'cat3', e.target.value)}
                      className="w-16 bg-white border border-indigo-100 rounded p-1 text-center text-xs font-black"
                    />
                  </td>
                  <td className="p-4 text-center bg-slate-100/50">
                    <span className="text-sm font-black text-blue-700">{calculateTotal(p)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SBAManager;