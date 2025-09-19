import React, { useState, useEffect, useCallback } from 'react';
import { TextPair } from './types';
import TrainingSection from './components/TrainingSection';
import EditingSection from './components/EditingSection';
import { getStyleExamples, addExample, deleteExample } from './services/apiService';

function App() {
  const [examples, setExamples] = useState<TextPair[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadExamples = async () => {
      try {
        const fetchedExamples = await getStyleExamples();
        setExamples(fetchedExamples.reverse());
      } catch (e) {
        setError("Failed to load training data from the server.");
      } finally {
        setIsLoading(false);
      }
    };
    loadExamples();
  }, []);

  const handleAddExample = useCallback((savedPair: TextPair) => {
    setExamples(prev => [savedPair, ...prev]);
  }, []);

  const handleDeleteExample = useCallback(async (id: string) => {
    try {
      await deleteExample(id);
      setExamples(prev => prev.filter(pair => pair.id !== id));
    } catch (e) {
      setError("Failed to delete the example.");
    }
  }, []);
  
  if (isLoading) return <div>جاري تحميل بيانات التدريب...</div>;
  if (error) return <div style={{color: 'red'}}>{error}</div>;

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">محرر النصوص الذكي</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <TrainingSection examples={examples} onAddExample={handleAddExample} onDeleteExample={handleDeleteExample} />
          </div>
          <div className="lg:col-span-2">
            <EditingSection onNewPairGenerated={handleAddExample} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;