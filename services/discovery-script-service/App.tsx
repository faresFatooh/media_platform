import React, { useState, useEffect, useCallback } from 'react';
import { Theme, Section, Script, FactCheckResult, NotificationMessage, Program, TrainingData } from './types';
import { NAV_ITEMS, PROGRAMS } from './constants';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import NewScriptForm from './components/NewScriptForm';
import Notification from './components/Notification';
import ApiSettings from './components/ApiSettings';
import ProgramTraining from './components/ProgramTraining';

const PROGRAMS_STORAGE_KEY = 'discovery_programs_data_v2';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('light');
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [generatedScript, setGeneratedScript] = useState<Script | null>(null);
  const [factCheckResult, setFactCheckResult] = useState<FactCheckResult | null>(null);
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [programs, setPrograms] = useState<Program[]>(() => {
    try {
      const storedPrograms = localStorage.getItem(PROGRAMS_STORAGE_KEY);
      // Basic validation to ensure stored data matches new structure
      if (storedPrograms) {
        const parsed = JSON.parse(storedPrograms);
        if(Array.isArray(parsed) && parsed[0]?.trainingData?.method) {
            return parsed;
        }
      }
      return PROGRAMS;
    } catch (error) {
      console.error("Failed to load programs from localStorage", error);
      return PROGRAMS;
    }
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);

    body.classList.remove(theme === 'light' ? 'bg-bg-primary-dark' : 'bg-bg-primary-light');
    body.classList.add(theme === 'light' ? 'bg-bg-primary-light' : 'bg-bg-primary-dark');

  }, [theme]);

  useEffect(() => {
    try {
        localStorage.setItem(PROGRAMS_STORAGE_KEY, JSON.stringify(programs));
    } catch (error) {
        console.error("Failed to save programs to localStorage", error);
    }
  }, [programs]);

  const addNotification = useCallback((message: string, type: NotificationMessage['type']) => {
    const newNotification = {
      id: Date.now(),
      message,
      type,
    };
    setNotifications(prev => [...prev, newNotification]);
  }, []);

  const handleSectionChange = (section: Section) => {
    if (section === 'factCheck' && !generatedScript) {
        addNotification('الرجاء توليد نص أولاً لتدقيق الحقائق', 'warning');
        return;
    }
    setActiveSection(section);
  };

  const handleScriptGenerated = (script: Script) => {
    setGeneratedScript(script);
    setActiveSection('newScript'); // Stay on the same page to show the result
  };
  
  const handleFactCheckComplete = (result: FactCheckResult) => {
      setFactCheckResult(result);
      setActiveSection('factCheck');
  };

  const handleAddProgram = (newProgram: Omit<Program, 'id' | 'scriptCount' | 'trainingData'>) => {
    const programToAdd: Program = {
      ...newProgram,
      id: newProgram.name.toLowerCase().replace(/\s+/g, '-'),
      scriptCount: 0,
      trainingData: {
        method: 'instructions',
        instructions: '',
        beforeText: '',
        afterText: ''
      },
    };
    setPrograms(prev => [...prev, programToAdd]);
    addNotification(`تمت إضافة برنامج "${newProgram.name}" بنجاح`, 'success');
  };

  const handleUpdateProgramTraining = (programId: string, trainingData: TrainingData) => {
    setPrograms(prev => prev.map(p => p.id === programId ? { ...p, trainingData } : p));
    addNotification('تم حفظ إرشادات البرنامج بنجاح', 'success');
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard programs={programs} onAddProgram={handleAddProgram} onSelectProgram={(programName: string) => setActiveSection('newScript')} />;
      case 'newScript':
        return <NewScriptForm programs={programs} addNotification={addNotification} onScriptGenerated={handleScriptGenerated} onFactCheckComplete={handleFactCheckComplete} initialScript={generatedScript}/>;
      case 'factCheck':
        return factCheckResult ? (
          <div className="bg-card-bg-light dark:bg-card-bg-dark p-6 rounded-lg shadow-md border border-border-light dark:border-border-dark">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-text-primary-light dark:text-text-primary-dark">
              <span>✅</span>
              نتائج تدقيق الحقائق
            </h2>
            <div className="mb-6">
                <span className="text-text-secondary-light dark:text-text-secondary-dark">دقة المعلومات:</span>
                <div className="w-full bg-bg-secondary-light dark:bg-bg-secondary-dark rounded-full h-8 mt-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-green-500 h-full rounded-full flex items-center justify-center text-white font-bold transition-all duration-1000" style={{ width: `${factCheckResult.accuracy}%` }}>
                        {factCheckResult.accuracy}%
                    </div>
                </div>
            </div>
            <div className="prose prose-sm max-w-none text-text-primary-light dark:text-text-primary-dark whitespace-pre-wrap">
              <h4 className="font-bold">التفاصيل:</h4>
              <p>{factCheckResult.details}</p>
            </div>
          </div>
        ) : <p className="text-center text-text-secondary-light dark:text-text-secondary-dark">لم يتم إجراء تدقيق للحقائق بعد.</p>;
      case 'training':
        return <ProgramTraining programs={programs} onUpdateProgram={handleUpdateProgramTraining} />;
      case 'api':
        return <ApiSettings addNotification={addNotification} />;
      default:
        return <Dashboard programs={programs} onAddProgram={handleAddProgram} onSelectProgram={() => setActiveSection('newScript')} />;
    }
  };

  return (
    <div className={`min-h-screen bg-bg-primary-light dark:bg-bg-primary-dark text-text-primary-light dark:text-text-primary-dark font-sans transition-colors duration-300`}>
      <Header theme={theme} setTheme={setTheme} />
      <Navigation activeSection={activeSection} setActiveSection={handleSectionChange} />
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {renderSection()}
      </main>
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm">
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            message={notification.message}
            type={notification.type}
            onDismiss={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
          />
        ))}
      </div>
    </div>
  );
};

export default App;
