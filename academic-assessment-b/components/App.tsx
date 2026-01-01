
import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import ExerciseVetting from './components/ExerciseVetting';
import ExerciseScoring from './components/ExerciseScoring';
import SupervisionPortal from './components/SupervisionPortal';
import Dashboard from './components/Dashboard';
import FacilitatorDesk from './components/FacilitatorDesk';
import RemoteEntryForm from './components/RemoteEntryForm';
import SubjectManager from './components/SubjectManager';
import SBAManager from './components/SBAManager';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isRemoteEntry, setIsRemoteEntry] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('form') === 'facilitator_entry') {
      setIsRemoteEntry(true);
    }
  }, []);

  if (isRemoteEntry) {
    return <RemoteEntryForm />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'vetting':
        return <ExerciseVetting />;
      case 'scoring':
        return <ExerciseScoring />;
      case 'sba':
        return <SBAManager />;
      case 'supervision':
        return <SupervisionPortal />;
      case 'facilitators':
        return <FacilitatorDesk />;
      case 'subjects':
        return <SubjectManager />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <Navigation currentTab={activeTab} setTab={setActiveTab} />
      <main>
        {renderContent()}
      </main>
      
      {/* Quick Mobile Access Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 flex justify-around shadow-2xl z-50">
        <button onClick={() => setActiveTab('dashboard')} className={`text-xl ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}`}>📊</button>
        <button onClick={() => setActiveTab('vetting')} className={`text-xl ${activeTab === 'vetting' ? 'text-blue-600' : 'text-slate-400'}`}>📝</button>
        <button onClick={() => setActiveTab('scoring')} className={`text-xl ${activeTab === 'scoring' ? 'text-blue-600' : 'text-slate-400'}`}>🖊️</button>
        <button onClick={() => setActiveTab('sba')} className={`text-xl ${activeTab === 'sba' ? 'text-blue-600' : 'text-slate-400'}`}>📈</button>
        <button onClick={() => setActiveTab('supervision')} className={`text-xl ${activeTab === 'supervision' ? 'text-blue-600' : 'text-slate-400'}`}>⚖️</button>
      </div>
    </div>
  );
};

export default App;
