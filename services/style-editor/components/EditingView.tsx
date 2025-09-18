import React, { useState } from 'react';
import { StylePair, ApiKeys } from '../types';
import { editWithStyle } from '../services/geminiService';
import CopyIcon from './icons/CopyIcon';

interface EditingViewProps {
  pairs: StylePair[];
  apiKeys: ApiKeys;
}

const EditingView: React.FC<EditingViewProps> = ({ pairs, apiKeys }) => {
  const [textToEdit, setTextToEdit] = useState('');
  const [geminiResult, setGeminiResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedSource, setCopiedSource] = useState<string | null>(null);

  const handleCopy = (text: string, source: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSource(source);
    setTimeout(() => {
      setCopiedSource(null);
    }, 2000);
  };

  const handleEdit = async () => {
    setError('');
    setGeminiResult(null);
    setIsLoading(true);
    try {
      const results = await editWithStyle(textToEdit, pairs);
      if (results.length > 0) {
        setGeminiResult(results[0]);
      } else {
        setError("لم يتمكن الذكاء الاصطناعي من إنشاء اقتراح.");
      }
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  if (pairs.length === 0) {
    return (
      <div className="text-center p-8 bg-yellow-50 border border-yellow-300 rounded-lg">
        <h2 className="text-2xl font-bold text-yellow-800 mb-4">لا توجد بيانات تدريب</h2>
        <p className="text-yellow-700">
          يجب عليك إضافة بعض أزواج التدريب أولاً. اذهب إلى "خانة التدريب" لتعليم التطبيق أسلوبك.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">تحرير نص جديد</h2>
        <p className="text-gray-600">أدخل النص الذي تريد تحريره أدناه. سيقوم التطبيق بإنشاء اقتراح لإعادة كتابته بناءً على أسلوبك الذي تعلمه.</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-semibold mb-2 text-blue-600">النص المراد تحريره</h3>
        <textarea
          value={textToEdit}
          onChange={(e) => setTextToEdit(e.target.value)}
          placeholder="اكتب أو الصق النص هنا..."
          className="w-full p-3 border border-gray-300 rounded-lg h-40 focus:ring-2 focus:ring-blue-500 transition"
          aria-label="النص المراد تحريره"
        />
        <button
          onClick={handleEdit}
          disabled={!textToEdit.trim() || isLoading}
          className="mt-4 bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all duration-200 w-full sm:w-auto"
        >
          {isLoading ? 'جاري إنشاء الاقتراح...' : 'أنشئ اقتراحًا'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
          <strong className="font-bold">خطأ: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-4">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="ml-3 text-gray-700 font-semibold">جاري إنشاء الاقتراح، قد يستغرق الأمر بضع لحظات...</p>
          </div>
        </div>
      )}

      {!isLoading && geminiResult !== null && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800">النتائج المقترحة</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Gemini Card */}
            <div className="bg-gray-50 p-4 rounded-lg border border-blue-300 flex flex-col justify-between hover:shadow-lg transition-shadow">
              <div>
                <h4 className="font-semibold text-blue-700 mb-2">Gemini</h4>
                <textarea
                    value={geminiResult}
                    onChange={(e) => setGeminiResult(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-md bg-white h-48 focus:ring-1 focus:ring-blue-500 transition text-sm leading-relaxed"
                    aria-label="نص اقتراح Gemini القابل للتعديل"
                />
              </div>
              <button
                onClick={() => handleCopy(geminiResult, 'gemini')}
                className="mt-4 self-end flex items-center gap-2 bg-gray-200 text-gray-700 font-semibold py-1 px-3 rounded-lg hover:bg-gray-300 transition text-sm"
                aria-label="نسخ اقتراح Gemini"
              >
                <CopyIcon />
                <span>{copiedSource === 'gemini' ? 'تم النسخ!' : 'نسخ النص'}</span>
              </button>
            </div>
            
            {/* Claude Card Placeholder */}
            <div className={`bg-gray-50 p-4 rounded-lg border flex flex-col justify-between transition-opacity ${apiKeys.claude ? 'border-gray-300' : 'border-gray-200 opacity-60'}`}>
              <div>
                <h4 className={`font-semibold mb-2 ${apiKeys.claude ? 'text-gray-700' : 'text-gray-600'}`}>Claude</h4>
                <div className="text-gray-500 whitespace-pre-wrap text-sm leading-relaxed min-h-[12rem] flex items-center justify-center text-center p-2">
                    {apiKeys.claude ? 'جاهز للتوليد (سيتم التفعيل قريبًا).' : 'أدخل مفتاح API في الإعدادات للتفعيل.'}
                </div>
              </div>
              <button
                disabled
                className="mt-4 self-end flex items-center gap-2 bg-gray-200 text-gray-400 font-semibold py-1 px-3 rounded-lg text-sm cursor-not-allowed"
                aria-label="نسخ اقتراح Claude (غير متاح)"
              >
                <CopyIcon />
                <span>نسخ النص</span>
              </button>
            </div>
            
            {/* ChatGPT Card Placeholder */}
            <div className={`bg-gray-50 p-4 rounded-lg border flex flex-col justify-between transition-opacity ${apiKeys.chatgpt ? 'border-gray-300' : 'border-gray-200 opacity-60'}`}>
              <div>
                <h4 className={`font-semibold mb-2 ${apiKeys.chatgpt ? 'text-gray-700' : 'text-gray-600'}`}>ChatGPT</h4>
                <div className="text-gray-500 whitespace-pre-wrap text-sm leading-relaxed min-h-[12rem] flex items-center justify-center text-center p-2">
                    {apiKeys.chatgpt ? 'جاهز للتوليد (سيتم التفعيل قريبًا).' : 'أدخل مفتاح API في الإعدادات للتفعيل.'}
                </div>
              </div>
              <button
                disabled
                className="mt-4 self-end flex items-center gap-2 bg-gray-200 text-gray-400 font-semibold py-1 px-3 rounded-lg text-sm cursor-not-allowed"
                aria-label="نسخ اقتراح ChatGPT (غير متاح)"
              >
                <CopyIcon />
                <span>نسخ النص</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditingView;
