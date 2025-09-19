import React, { useState, useEffect, useCallback } from 'react';
import { TextPair } from './types';
import TrainingSection from './components/TrainingSection';
import EditingSection from './components/EditingSection';
import { getStyleExamples, addStyleExample, deleteStyleExample } from './services/apiService';

function App() {
  const [examples, setExamples] = useState<TextPair[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // جلب الأمثلة الأولية من قاعدة البيانات عند تحميل التطبيق
  useEffect(() => {
    const loadExamples = async () => {
      try {
        const fetchedExamples = await getStyleExamples();
        setExamples(fetchedExamples.reverse()); // عرض الأحدث أولاً
      } catch (e) {
        setError("فشل تحميل بيانات التدريب من الخادم.");
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadExamples();
  }, []);

  // دالة لإضافة مثال جديد (سيتم استدعاؤها من TrainingSection)
  const handleAddExample = useCallback(async (newPair: Omit<TextPair, 'id'>) => {
    try {
      const savedPair = await addStyleExample(newPair);
      setExamples(prev => [savedPair, ...prev]);
    } catch (e) {
      setError("فشل حفظ المثال الجديد.");
      console.error(e);
    }
  }, []);

  // دالة لحذف مثال (سيتم استدعاؤها من TrainingSection)
  const handleDeleteExample = useCallback(async (id: string) => {
    try {
      await deleteStyleExample(id);
      setExamples(prev => prev.filter(pair => pair.id !== id));
    } catch (e) {
      setError("فشل حذف المثال.");
      console.error(e);
    }
  }, []);
  
  if (isLoading) return <div className="text-center p-8">جاري تحميل بيانات التدريب...</div>;
  if (error) return <div className="text-center p-8 text-red-600">{error}</div>;

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">محرر النصوص الذكي</h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            درّب الذكاء الاصطناعي على أسلوبك في الكتابة، وحرر نصوصك بضغطة زر.
          </p>
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <TrainingSection examples={examples} onAddExample={handleAddExample} onDeleteExample={handleDeleteExample} />
          </div>
          <div className="lg:col-span-2">
            <EditingSection onNewPairGenerated={() => { /* يمكن استخدامها لاحقًا لتحديث سجل المهام */ }} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;