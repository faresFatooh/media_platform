import React, { useState, useEffect, useCallback } from 'react';
import { TextPair } from './types';
import TrainingSection from './components/TrainingSection';
import EditingSection from './components/EditingSection';
import { getStyleExamples, addStyleExample, deleteStyleExample } from './services/apiService';

function App() {
  const [examples, setExamples] = useState<TextPair[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- كود جديد لاستقبال التوكن ---
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // إجراء أمني: تأكد من أن الرسالة قادمة من نطاق موثوق
      if (event.origin !== "https://ghazimortaja.com") { // <-- استبدل هذا برابط الواجهة الأمامية الرئيسي
        return;
      }
      if (event.data && event.data.type === 'AUTH_TOKEN') {
        localStorage.setItem('access_token', event.data.token);
        // الآن بعد أن حصلنا على التوكن، يمكننا تحميل بيانات التدريب
        loadExamples();
      }
    };

    window.addEventListener('message', handleMessage);

    // تنظيف المستمع عند مغادرة الصفحة
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []); // يعمل مرة واحدة فقط عند تحميل التطبيق
  
  const loadExamples = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedExamples = await getStyleExamples();
      setExamples(fetchedExamples.reverse());
    } catch (e) {
      setError("فشل تحميل بيانات التدريب. تأكد من أنك سجلت الدخول.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExample = useCallback(async (newPair: Omit<TextPair, 'id'>) => {
    try {
      const savedPair = await addStyleExample(newPair);
      setExamples(prev => [savedPair, ...prev]);
    } catch (e) {
      setError("فشل حفظ المثال الجديد.");
    }
  }, []);

  const handleDeleteExample = useCallback(async (id: string) => {
    try {
      await deleteStyleExample(id);
      setExamples(prev => prev.filter(pair => pair.id !== id));
    } catch (e) {
      setError("فشل حذف المثال.");
    }
  }, []);
  
  if (isLoading) return <div className="text-center p-8">جاري تحميل...</div>;
  if (error) return <div className="text-center p-8 text-red-600">{error}</div>;

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        {/* ... header content ... */}
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <TrainingSection examples={examples} onAddExample={handleAddExample} onDeleteExample={handleDeleteExample} />
          </div>
          <div className="lg:col-span-2">
            <EditingSection onNewPairGenerated={() => {}} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;