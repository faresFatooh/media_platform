
import React, { useState } from 'react';
import { TextPair } from '../types';
import { editWithStyle } from '../services/geminiService';

interface EditingSectionProps {
  examples: TextPair[];
  onNewPairGenerated: (pair: Omit<TextPair, 'id'>) => void;
}

const Spinner: React.FC = () => (
  <div className="flex justify-center items-center gap-2">
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <span>جاري التحرير...</span>
  </div>
);

const EditingSection: React.FC<EditingSectionProps> = ({ examples, onNewPairGenerated }) => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<{ raw: string; edited: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    const editedText = await editWithStyle(inputText, examples);
    
    // Simple check for error message from service
    if(editedText.startsWith('حدث خطأ')) {
      setError(editedText);
    } else {
      const newPair = { raw: inputText, edited: editedText };
      setResult(newPair);
      onNewPairGenerated(newPair);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
      <h2 className="text-xl font-bold text-slate-800 border-b pb-3">خانة تحرير نص جديد</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="new-text-edit" className="block text-sm font-medium text-slate-600 mb-1">
            أدخل النص الذي تريد تحريره
          </label>
          <textarea
            id="new-text-edit"
            rows={8}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="اكتب أو الصق النص هنا..."
          />
        </div>
        <button
          onClick={handleEdit}
          disabled={isLoading || !inputText.trim()}
          className="w-full bg-green-600 text-white font-semibold py-2.5 px-4 rounded-md hover:bg-green-700 transition disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          {isLoading ? <Spinner /> : 'حرر النص'}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
          <p className="font-bold">خطأ</p>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-semibold text-slate-700">النتيجة:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <h4 className="font-bold text-slate-500 mb-2">النص قبل التحرير</h4>
              <p className="text-slate-800 whitespace-pre-wrap">{result.raw}</p>
            </div>
            <div className="border border-green-300 rounded-lg p-4 bg-green-50">
              <h4 className="font-bold text-green-600 mb-2">النص بعد التحرير</h4>
              <p className="text-slate-800 whitespace-pre-wrap">{result.edited}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditingSection;
