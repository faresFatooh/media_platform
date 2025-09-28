import React, { useState } from 'react';
import { generateContent } from '../services/geminiService';
import type { GenerationResult } from '../types';
import { Spinner } from './Spinner';
import GenerationResultDisplay from './GenerationResultDisplay';
import { SparklesIcon, FactCheckIcon } from './Icons';

const CustomGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [useGoogleSearch, setUseGoogleSearch] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setResult(null);
    const translationInstruction = `

---
بعد أن تكمل المهمة المطلوبة باللغة العربية، أضف فاصلاً (---) ثم قسم بعنوان "English Translation:". بعد ذلك، قدم ترجمة إنجليزية احترافية ودقيقة للمحتوى العربي بالكامل. يجب أن تبدأ الترجمة الإنجليزية بالجملة التالية بالضبط: "This text was generated with the assistance of AI."`;
    const fullPrompt = `${prompt}${translationInstruction}`;
    const generationResult = await generateContent(fullPrompt, useGoogleSearch);
    setResult(generationResult);
    setIsLoading(false);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-12 border border-gray-700" dir="rtl">
      <h2 className="text-2xl font-bold mb-4 text-white flex items-center">
        <SparklesIcon className="h-6 w-6 ml-2 text-green-400" />
        <span>مولّد المحتوى المخصص</span>
      </h2>
      <p className="text-gray-400 mb-4">
        اكتب طلبك الخاص مباشرةً للحصول على محتوى فريد. يمكنك تفعيل البحث في جوجل للحصول على معلومات حديثة.
      </p>
      
      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="مثال: اكتب لي مقالًا قصيرًا عن تاريخ المسجد الأقصى..."
          className="w-full h-32 p-3 bg-gray-900 border border-gray-600 rounded-md text-gray-200 focus:ring-2 focus:ring-green-500 transition-colors duration-200"
          rows={4}
        />
        <div className="flex items-center justify-between">
            <div className="flex items-center">
                <label htmlFor="google-search-checkbox" className="mr-2 text-sm font-medium text-gray-300 flex items-center cursor-pointer">
                    <FactCheckIcon className="h-4 w-4 ml-1 text-blue-400" />
                    استخدام بحث جوجل (للمعلومات الحديثة)
                </label>
                <input
                    type="checkbox"
                    id="google-search-checkbox"
                    checked={useGoogleSearch}
                    onChange={(e) => setUseGoogleSearch(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                />
            </div>
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="flex items-center justify-center px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? <Spinner /> : 'ولّد المحتوى'}
          </button>
        </div>
      </div>

      {result && <GenerationResultDisplay result={result} />}
    </div>
  );
};

export default CustomGenerator;