import React, { useState, useEffect } from 'react';
import { View, StylePair, ApiKeys } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TrainingView from './components/TrainingView';
import EditingView from './components/EditingView';
import SettingsModal from './components/SettingsModal';
import * as apiService from './services/apiService';

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.Training);
  const [pairs, setPairs] = useState<StylePair[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKeys, setApiKeys] = useLocalStorage<ApiKeys>('apiKeys', {
    claude: '',
    chatgpt: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPairs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedPairs = await apiService.getPairs();
        setPairs(fetchedPairs);
      } catch (err) {
        setError("فشل الاتصال بالخادم. تأكد من أن الخادم يعمل (عبر تشغيل `npm start` في مجلد `server`) وأن لا شيء يمنع الاتصال بـ http://localhost:3001.");
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPairs();
  }, []);

  const handleAddPair = async (pairData: { before: string; after: string }) => {
    try {
      const newPair = await apiService.addPair(pairData);
      setPairs([...pairs, newPair]);
    } catch (err) {
      alert('فشل في إضافة الزوج الجديد. يرجى المحاولة مرة أخرى.');
      console.error(err);
    }
  };

  const handleDeletePair = async (id: string) => {
    try {
      await apiService.deletePair(id);
      setPairs(pairs.filter((p) => p._id !== id));
    } catch (err) {
      alert('فشل في حذف الزوج. يرجى المحاولة مرة أخرى.');
      console.error(err);
    }
  };
  
  const handleAddPairsBatch = async (batch: Omit<StylePair, '_id'>[]) => {
    try {
      const newPairs = await apiService.addPairsBatch(batch);
      // To avoid duplicates on the frontend
      const existingIds = new Set(pairs.map(p => p._id));
      const uniqueNewPairs = newPairs.filter(p => !existingIds.has(p._id));
      setPairs([...pairs, ...uniqueNewPairs]);
    } catch (err) {
      alert('فشل في استيراد الأزواج دفعة واحدة.');
      console.error(err);
    }
  };


  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      <Sidebar
        currentView={view}
        setView={setView}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white p-6 md:p-8">
          {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert"><p>{error}</p></div>}
          {isLoading ? (
             <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
             </div>
          ) : view === View.Training ? (
            <TrainingView
              pairs={pairs}
              onAddPair={handleAddPair}
              onDeletePair={handleDeletePair}
              onAddPairsBatch={handleAddPairsBatch}
            />
          ) : (
            <EditingView pairs={pairs} apiKeys={apiKeys} />
          )}
        </main>
      </div>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialKeys={apiKeys}
        onSave={(newKeys) => setApiKeys(newKeys)}
      />
    </div>
  );
};

export default App;