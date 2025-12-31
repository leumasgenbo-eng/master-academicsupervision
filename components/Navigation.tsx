
import React from 'react';

interface NavProps {
  currentTab: string;
  setTab: (tab: string) => void;
}

const Navigation: React.FC<NavProps> = ({ currentTab, setTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'vetting', label: 'Vetting', icon: '📝' },
    { id: 'scoring', label: 'Exercise Scores', icon: '🖊️' },
    { id: 'sba', label: 'SBA Desk', icon: '📈' },
    { id: 'supervision', label: 'Supervision', icon: '⚖️' },
    { id: 'facilitators', label: 'Facilitators', icon: '👨‍🏫' },
    { id: 'subjects', label: 'Subjects', icon: '📚' }
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-[98%] mx-auto px-2">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-lg shadow-lg">
              <span className="text-sm font-black">EP</span>
            </div>
            <span className="text-lg font-black text-slate-900 uppercase tracking-tighter">EduTrack Pro</span>
          </div>
          
          <div className="hidden md:flex space-x-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  currentTab === tab.id 
                  ? 'bg-slate-900 text-white shadow-xl scale-105' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="md:hidden flex items-center">
            <select 
              value={currentTab}
              onChange={(e) => setTab(e.target.value)}
              className="bg-slate-100 border-none text-slate-900 text-[10px] font-black uppercase rounded-lg focus:ring-0 block w-full p-2"
            >
              {tabs.map(tab => (
                <option key={tab.id} value={tab.id}>{tab.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
