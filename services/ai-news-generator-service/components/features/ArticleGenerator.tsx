import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ArticleInputType } from '../../types';
import type { GeneratedArticle, ImageFile } from '../../types';
import { generateArticleWithGemini, generateArticleWithClaude, generateImageWithImagen } from '../../services/geminiService';
import { ArticleDisplay } from './ArticleDisplay';
import { Spinner } from '../common/Spinner';

type Model = 'gemini' | 'claude';

const baseInputOptions = [
  { id: ArticleInputType.TITLE, label: 'من عنوان' },
  { id: ArticleInputType.TEXT, label: 'من نص' },
  { id: ArticleInputType.URL, label: 'من رابط' },
  { id: ArticleInputType.IMAGE, label: 'من صورة' },
];

export const ArticleGenerator: React.FC = () => {
  const [inputType, setInputType] = useState<ArticleInputType>(ArticleInputType.TITLE);
  const [selectedModel, setSelectedModel] = useState<Model>('gemini');
  const [inputValue, setInputValue] = useState('');
  const [selectedFile, setSelectedFile] = useState<ImageFile | null>(null);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [generatedArticle, setGeneratedArticle] = useState<GeneratedArticle | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter out image option if Claude is selected
  const inputOptions = useMemo(() => {
    if (selectedModel === 'claude') {
      return baseInputOptions.filter(opt => opt.id !== ArticleInputType.IMAGE);
    }
    return baseInputOptions;
  }, [selectedModel]);

  // Reset input type if it becomes unavailable for the selected model
  useEffect(() => {
    if (selectedModel === 'claude' && inputType === ArticleInputType.IMAGE) {
      setInputType(ArticleInputType.TITLE);
    }
  }, [selectedModel, inputType]);

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
    if (
      (inputType !== ArticleInputType.IMAGE && !inputValue.trim()) ||
      (inputType === ArticleInputType.IMAGE && !selectedFile)
    ) {
      setError('يرجى تقديم مدخلات صالحة.');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('جاري تحليل المدخلات وتوليد المقال...');
    setError(null);
    setGeneratedArticle(null);

    try {
      const data = inputType === ArticleInputType.IMAGE ? selectedFile! : inputValue;

      const generateFunction =
        selectedModel === 'claude'
          ? generateArticleWithClaude
          : generateArticleWithGemini;

      const articleTextData = await generateFunction(inputType, data);

      let finalArticle: GeneratedArticle;

      if (articleTextData.title !== 'فشل تحليل المقال') {
        setLoadingMessage('تم إنشاء المقال، جاري توليد صورة مرتبطة...');
        let imageUrl = '';
        try {
          imageUrl = await generateImageWithImagen(articleTextData.title);
        } catch (imageError) {
          console.warn('Image generation failed, proceeding without image:', imageError);
        }
        finalArticle = { ...articleTextData, imageUrl };
      } else {
        finalArticle = { ...articleTextData, imageUrl: '' };
      }
      setGeneratedArticle(finalArticle);
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
        return (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="مثال: اكتشاف كوكب جديد صالح للحياة"
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          />
        );
      case ArticleInputType.TEXT:
        return (
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="الصق النص هنا..."
            rows={8}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          ></textarea>
        );
      case ArticleInputType.URL:
        return (
          <input
            type="url"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="https://example.com/news/story"
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          />
        );
      case ArticleInputType.IMAGE:
        return (
          <div className="w-full p-3 bg-gray-800 border-2 border-dashed border-gray-700 rounded-md text-center">
            <input
              type="file"
              id="file-upload"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer text-cyan-400 hover:text-cyan-300"
            >
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
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="text-gray-300 font-medium">اختر محرك الذكاء الاصطناعي:</span>
            <div className="flex rounded-md bg-gray-900 p-1">
              <button
                type="button"
                onClick={() => setSelectedModel('gemini')}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                  selectedModel === 'gemini'
                    ? 'bg-cyan-600 text-white'
                    : 'text-gray-400 hover:bg-gray-700'
                }`}
              >
                Gemini
              </button>
              <button
                type="button"
                onClick={() => setSelectedModel('claude')}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                  selectedModel === 'claude'
                    ? 'bg-cyan-600 text-white'
                    : 'text-gray-400 hover:bg-gray-700'
                }`}
              >
                Claude
              </button>
            </div>
          </div>

          <div className="flex border-b border-gray-700 mb-4">
            {inputOptions.map((opt) => (
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
          <div className="mb-4">{renderInput()}</div>
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
