import React, { useState, useCallback } from 'react';
import { ArticleInputType } from '../../types';
import type { GeneratedArticle, ImageFile } from '../../types';
import { generateImage } from '../../services/articleService';
import { generateArticleWithGemini, generateArticleWithClaude } from '../../services/geminiService'; // ✅ استدعاء دوالنا الجديدة
import { ArticleDisplay } from './ArticleDisplay';
import { Spinner } from '../common/Spinner';
import { useAuth } from '../../context/AuthContext';

const inputOptions = [
  { id: ArticleInputType.TITLE, label: 'من عنوان' },
  { id: ArticleInputType.TEXT, label: 'من نص' },
  { id: ArticleInputType.URL, label: 'من رابط' },
  { id: ArticleInputType.IMAGE, label: 'من صورة' },
];

// ✅ خيارات النماذج
const modelOptions = [
  { id: 'gemini', label: 'Gemini' },
  { id: 'claude', label: 'Claude' },
];

export const ArticleGenerator: React.FC = () => {
  const [inputType, setInputType] = useState<ArticleInputType>(ArticleInputType.TITLE);
  const [inputValue, setInputValue] = useState('');
  const [selectedFile, setSelectedFile] = useState<ImageFile | null>(null);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [generatedArticle, setGeneratedArticle] = useState<GeneratedArticle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  // ✅ اختيار النموذج (افتراضي Gemini)
  const [selectedModel, setSelectedModel] = useState<'gemini' | 'claude'>('gemini');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setSelectedFile({ base64: base64String, mimeType: file.type });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("جلسة المستخدم غير صالحة. يرجى تسجيل الدخول مرة أخرى.");
      return;
    }
    if ((inputType !== ArticleInputType.IMAGE && !inputValue.trim()) || (inputType === ArticleInputType.IMAGE && !selectedFile)) {
      setError('يرجى تقديم مدخلات صالحة.');
      return;
    }

    setIsLoading(true);
    setLoadingMessage(`جاري توليد المقال باستخدام ${selectedModel === 'gemini' ? 'Gemini' : 'Claude'}...`);
    setError(null);
    setGeneratedArticle(null);

    try {
      const data = inputType === ArticleInputType.IMAGE ? selectedFile! : inputValue;

      // ✅ اختيار النموذج
      let articleTextData;
      if (selectedModel === 'gemini') {
        articleTextData = await generateArticleWithGemini(inputType, data);
      } else {
        articleTextData = await generateArticleWithClaude(inputType, data);
      }

      setLoadingMessage('تم إنشاء المقال، جاري توليد صورة مرتبطة...');
      const imageUrl = await generateImage(articleTextData.title, token);

      setGeneratedArticle({ ...articleTextData, imageUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const renderInput = useCallback(() => {
    switch (inputType) {
      case ArticleInputType.TITLE:
        return <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="مثال: اكتشاف كوكب جديد صالح للحياة" className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none" />;
      case ArticleInputType.TEXT:
        return <textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="الصق النص هنا..." rows={8} className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none"></textarea>;
      case ArticleInputType.URL:
        return <input type="url" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="https://example.com/news/story" className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none" />;
      case ArticleInputType.IMAGE:
        return (
          <div className="w-full p-3 bg-gray-800 border-2 border-dashed border-gray-700 rounded-md text-center">
            <input type="file" id="file-upload" accept="image/*" onChange={handleFileChange} className="hidden" />
            <label htmlFor="file-upload" className="cursor-pointer text-cyan-400 hover:text-cyan-300">
              اختر ملف صورة
            </label>
            {fileName && <p className="mt-2 text-sm text-gray-400">{fileName}</p>}
          </div>
        );
      default:
        return null;
    }
  }, [inputType, inputValue, fileName]);

  const handleReset = () => {
    setGeneratedArticle(null);
    setInputValue('');
    setSelectedFile(null);
    setFileName('');
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Spinner />
        <p className="mt-4 text-lg text-gray-300">{loadingMessage}</p>
      </div>
    );
  }

  if (generatedArticle) {
    return <ArticleDisplay article={generatedArticle} onReset={handleReset} />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700">
          
          {/* ✅ اختيار نوع الإدخال */}
          <div className="flex border-b border-gray-700 mb-4">
            {inputOptions.map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setInputType(opt.id)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  inputType === opt.id
                    ? 'border-b-2 border-cyan-400 text-cyan-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* ✅ اختيار النموذج */}
          <div className="flex gap-4 mb-4">
            {modelOptions.map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedModel(opt.id as 'gemini' | 'claude')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedModel === opt.id
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* ✅ حقل الإدخال */}
          <div className="mb-4">
            {renderInput()}
          </div>

          {error && <p className="text-red-400 mb-4">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 disabled:bg-gray-600"
          >
            {isLoading ? 'جاري التوليد...' : '🚀 توليد المقال'}
          </button>
        </div>
      </form>
    </div>
  );
};
