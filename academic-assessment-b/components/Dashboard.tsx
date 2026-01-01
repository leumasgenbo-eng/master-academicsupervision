
import React, { useMemo, useState, useEffect } from 'react';
import { ExerciseRecord } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

const Dashboard: React.FC = () => {
  const [records, setRecords] = useState<ExerciseRecord[]>([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('exercise_records') || '[]');
    setRecords(data);
  }, []);

  const stats = useMemo(() => {
    if (records.length === 0) return null;
    
    const totalEx = records.length;
    const avgCompletion = (records.reduce((a, b) => a + (b.attempted / b.totalLearners), 0) / totalEx) * 100;
    const sbaCount = records.filter(r => r.sbaType !== 'None').length;

    const distribution = {
      excellent: records.reduce((a, b) => a + (b.distribution?.excellent || 0), 0),
      good: records.reduce((a, b) => a + (b.distribution?.good || 0), 0),
      average: records.reduce((a, b) => a + (b.distribution?.average || 0), 0),
      belowAvg: records.reduce((a, b) => a + (b.distribution?.belowAverage || 0), 0),
      weak: records.reduce((a, b) => a + (b.distribution?.weak || 0), 0),
    };

    const distData = [
      { name: 'Exc (80+)', value: distribution.excellent, color: '#10b981' },
      { name: 'Good (65-79)', value: distribution.good, color: '#3b82f6' },
      { name: 'Avg (50-64)', value: distribution.average, color: '#eab308' },
      { name: 'Below (40-49)', value: distribution.belowAvg, color: '#f97316' },
      { name: 'Weak (<40)', value: distribution.weak, color: '#ef4444' },
    ];

    return { totalEx, avgCompletion, sbaCount, distData };
  }, [records]);

  if (records.length === 0) {
    return (
      <div className="max-w-[98%] mx-auto py-10 text-center animate-in zoom-in duration-700">
        <div className="text-8xl mb-6">📭</div>
        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">No Analytics Available</h2>
        <p className="text-slate-500 mt-2 font-medium">Commit exercise records to view institutional performance metrics here.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[98%] mx-auto py-6 px-2 space-y-8 animate-in fade-in duration-1000">
      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-all">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total Logs</div>
          <div className="text-4xl font-black text-slate-900">{stats?.totalEx}</div>
          <div className="text-[10px] font-bold text-blue-500 mt-2 uppercase tracking-tighter">Academic Year 23/24</div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-all">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Completion</div>
          <div className="text-4xl font-black text-emerald-600">{stats?.avgCompletion.toFixed(1)}%</div>
          <div className="text-[10px] font-bold text-emerald-500 mt-2 uppercase tracking-tighter">Across all classes</div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-all">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">SBA Compliance</div>
          <div className="text-4xl font-black text-indigo-600">{stats?.sbaCount}</div>
          <div className="text-[10px] font-bold text-indigo-500 mt-2 uppercase tracking-tighter">CAT 1, 2, & 3 Records</div>
        </div>
        <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-xl text-white">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Critical Risk</div>
          <div className="text-4xl font-black text-rose-500">
            {records.reduce((a, b) => a + (b.interventionGroups?.groupD || 0), 0)}
          </div>
          <div className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-tighter">Needs Immediate Intervention</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution Chart */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-8">Performance Mastery Distribution</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.distData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  fontSize={10} 
                  fontWeight={900} 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{fill: '#94a3b8'}}
                />
                <YAxis 
                  fontSize={10} 
                  fontWeight={900} 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{fill: '#94a3b8'}}
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={50}>
                  {stats?.distData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Records List */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-6">Recent Academic Logs</h3>
          <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
            {records.slice(0, 15).map(record => (
              <div key={record.id} className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center border border-slate-100 hover:bg-white transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-black">
                    {record.assignedClass ? record.assignedClass.split(' ')[1] || record.assignedClass[0] : '?'}
                  </div>
                  <div>
                    <div className="font-black text-sm text-slate-800 uppercase tracking-tighter group-hover:text-blue-600 transition-colors">
                      {record.subject} 
                      <span className="text-[10px] font-bold text-slate-400 ml-2">({record.assignedClass})</span>
                    </div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{record.strand} • Week {record.week}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-slate-900">{record.classAverage} <span className="text-[8px] text-slate-300">AVG</span></div>
                  <div className="text-[8px] font-bold text-slate-400 uppercase mt-1">{record.timestamp ? new Date(record.timestamp).toLocaleDateString() : record.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
