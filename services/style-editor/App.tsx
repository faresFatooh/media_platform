
import React, { useState, useCallback } from 'react';
import { TextPair } from './types';
import TrainingSection from './components/TrainingSection';
import EditingSection from './components/EditingSection';

const initialExamples: TextPair[] = [
  {
    id: 'ex1',
    raw: 'فريقنا عمل اجتماع لمناقشة المشروع الجديد.',
    edited: 'عقد فريقنا اجتماعًا لمناقشة المشروع الجديد.'
  },
  {
    id: 'ex2',
    raw: 'التقرير لازم يتسلم بكرة الصبح.',
    edited: 'يجب تسليم التقرير صباح الغد.'
  }
];

function App() {
  const [examples, setExamples] = useState<TextPair[]>(initialExamples);

  const addExample = useCallback((newPair: Omit<TextPair, 'id'>) => {
    setExamples(prev => [{ ...newPair, id: crypto.randomUUID() }, ...prev]);
  }, []);

  const deleteExample = useCallback((id: string) => {
    setExamples(prev => prev.filter(pair => pair.id !== id));
  }, []);

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
            <TrainingSection examples={examples} onAddExample={addExample} onDeleteExample={deleteExample} />
          </div>
          <div className="lg:col-span-2">
            <EditingSection examples={examples} onNewPairGenerated={addExample} />
          </div>
        </div>
      </main>

      <footer className="text-center py-4 text-slate-400 text-sm">
        <p>تم التطوير بواسطة مهندس واجهات أمامية خبير.</p>
      </footer>
    </div>
  );
}

export default App;
