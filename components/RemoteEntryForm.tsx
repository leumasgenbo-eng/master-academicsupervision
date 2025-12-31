
import React, { useState } from 'react';
import { ALL_CLASSES, PERIOD_TIMES, DAYS_OF_WEEK } from '../constants';

const RemoteEntryForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [assignments, setAssignments] = useState([{ subject: '', assignedClass: 'Basic 1' }]);
  const [formSelectedDay, setFormSelectedDay] = useState(DAYS_OF_WEEK[0]);
  
  const initialPeriods = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = { P1: '', P2: '', P3: '', P4: '', P5: '', P6: '', P7: '', P8: '' };
    return acc;
  }, {} as Record<string, Record<string, string>>);
  
  const [periods, setPeriods] = useState(initialPeriods);
  const [submissionCode, setSubmissionCode] = useState('');

  const updateAssignment = (index: number, field: string, value: string) => {
    const updated = [...assignments];
    (updated[index] as any)[field] = value;
    setAssignments(updated);
  };

  const generateSubmission = () => {
    const payload = {
      name,
      assignments: assignments.filter(a => a.subject),
      periods
    };
    const jsonString = JSON.stringify(payload);
    const base64 = btoa(encodeURIComponent(jsonString));
    setSubmissionCode(base64);
    setStep(4);
  };

  const sendToWhatsApp = () => {
    const message = `FACILITATOR_DATA_SUBMISSION:\n${submissionCode}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-20 flex flex-col items-center">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
        <header className="bg-blue-600 p-8 text-white text-center">
          <div className="text-3xl mb-2">📋</div>
          <h1 className="text-xl font-black uppercase tracking-tighter">Facilitator Desk</h1>
          <p className="text-xs font-bold text-blue-100 opacity-80 uppercase">Remote Load Entry Form</p>
        </header>

        <div className="p-8">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Step 1: Your Profile</h2>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Full Professional Name</label>
                <input 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  className="w-full border-2 border-slate-50 rounded-2xl p-4 font-bold bg-slate-50 focus:bg-white focus:border-blue-400 outline-none transition-all"
                  placeholder="e.g. Mr. John Doe"
                />
              </div>
              <button 
                disabled={!name}
                onClick={() => setStep(2)}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg disabled:opacity-50"
              >
                Next: Subject Load →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Step 2: Subject Load</h2>
                <button onClick={() => setAssignments([...assignments, { subject: '', assignedClass: 'Basic 1' }])} className="text-blue-600 text-[10px] font-black uppercase">+ Add</button>
              </div>
              <div className="space-y-3">
                {assignments.map((ass, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input 
                      value={ass.subject} 
                      onChange={e => updateAssignment(idx, 'subject', e.target.value)}
                      className="flex-1 border-2 border-slate-50 rounded-xl p-3 text-xs font-bold bg-slate-50" 
                      placeholder="Subject"
                    />
                    <select 
                      value={ass.assignedClass} 
                      onChange={e => updateAssignment(idx, 'assignedClass', e.target.value)}
                      className="w-24 border-2 border-slate-50 rounded-xl p-3 text-[10px] font-bold bg-slate-50"
                    >
                      {ALL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="flex-1 text-slate-400 font-black uppercase text-xs">Back</button>
                <button onClick={() => setStep(3)} className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs">Next: Schedule →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Step 3: Daily Schedule</h2>
                <select 
                   value={formSelectedDay} 
                   onChange={e => setFormSelectedDay(e.target.value)}
                   className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded"
                >
                  {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d.substring(0,3)}</option>)}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {Object.keys(PERIOD_TIMES).map(p => (
                  <div key={p} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[9px] font-black text-blue-600 uppercase mb-1">{p}</div>
                    <select
                      value={periods[formSelectedDay][p]}
                      onChange={e => setPeriods({...periods, [formSelectedDay]: {...periods[formSelectedDay], [p]: e.target.value}})}
                      className="w-full text-[10px] font-bold bg-white border rounded p-1"
                    >
                      <option value="">Free</option>
                      {assignments.filter(a => a.subject).map(a => (
                        <option key={`${a.subject}-${a.assignedClass}`} value={`${a.subject} (${a.assignedClass})`}>
                          {a.subject}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={() => setStep(2)} className="flex-1 text-slate-400 font-black uppercase text-xs">Back</button>
                <button onClick={generateSubmission} className="flex-[2] bg-green-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl">Complete Entry →</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8 text-center animate-in zoom-in duration-300">
              <div className="text-5xl">🎉</div>
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase">Entry Prepared</h2>
                <p className="text-xs text-slate-500 font-medium mt-2">Send the code below back to your administrator via WhatsApp.</p>
              </div>
              <div className="bg-slate-900 p-4 rounded-2xl break-all text-[8px] text-blue-300 font-mono shadow-inner border-2 border-slate-800 h-24 overflow-y-auto">
                {submissionCode}
              </div>
              <button 
                onClick={sendToWhatsApp}
                className="w-full bg-[#25D366] text-white py-5 rounded-3xl font-black uppercase tracking-widest text-sm shadow-xl flex items-center justify-center gap-3 hover:scale-105 transition-all"
              >
                <span>SEND VIA WHATSAPP</span>
              </button>
              <button onClick={() => setStep(1)} className="text-xs font-bold text-slate-400 uppercase tracking-widest">Start Over</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RemoteEntryForm;
