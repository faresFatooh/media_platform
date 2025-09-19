import React, { useState } from 'react';
import { TextPair } from '../types';
import ExamplePairView from './ExamplePairView';

interface TrainingSectionProps {
  examples: TextPair[];
  onAddExample: (pair: Omit<TextPair, 'id'>) => void;
  onDeleteExample: (id: string) => void;
}

const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);

const TrainingSection: React.FC<TrainingSectionProps> = ({ examples, onAddExample, onDeleteExample }) => {
  const [rawText, setRawText] = useState('');
  const [editedText, setEditedText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rawText.trim() && editedText.trim()) {
      onAddExample({ raw: rawText, edited: editedText });
      setRawText('');
      setEditedText('');
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md space-y-6 sticky top-24">
      <h2 className="text-xl font-bold text-slate-800 border-b pb-3">خانة رفع نصوص للتدريب</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="raw-text-train" className="block text-sm font-medium text-slate-600 mb-1">
            النص الأصلي (قبل التحرير)
          </label>
          <textarea
            id="raw-text-train"
            rows={4}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="مثال: فريقنا عمل اجتماع..."
          />
        </div>
        <div>
          <label htmlFor="edited-text-train" className="block text-sm font-medium text-slate-600 mb-1">
            النص المحرر (بعد التحرير)
          </label>
          <textarea
            id="edited-text-train"
            rows={4}
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="مثال: عقد فريقنا اجتماعًا..."
          />
        </div>
        <button
          type="submit"
          disabled={!rawText.trim() || !editedText.trim()}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          <PlusIcon />
          إضافة زوج تدريبي
        </button>
      </form>

      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        <h3 className="text-lg font-semibold text-slate-700">الأمثلة الحالية ({examples.length})</h3>
        {examples.length > 0 ? (
          examples.map(pair => <ExamplePairView key={pair.id} pair={pair} onDelete={onDeleteExample} />)
        ) : (
          <p className="text-slate-500 text-sm text-center py-4">لا توجد أمثلة. أضف زوجًا تدريبيًا للبدء.</p>
        )}
      </div>
    </div>
  );
};

export default TrainingSection;