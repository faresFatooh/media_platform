import React, { useState } from 'react';
import type { NewsItem, Platform } from '../types';
import { InputType, PublishStatus } from '../types';
import { parseAndSummarizeNews, generateAllCaptions, generateImageSearchQuery, generateImage } from '../services/geminiService';
import { Spinner } from './ui/Spinner';
import { PLATFORMS } from '../constants';

interface NewsInputFormProps {
  onClose: () => void;
  onSubmit: (newItem: NewsItem) => void;
}

export const NewsInputForm: React.FC<NewsInputFormProps> = ({ onClose, onSubmit }) => {
  const [inputType, setInputType] = useState<InputType>(InputType.URL);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(() => Object.keys(PLATFORMS) as Platform[]);

  const handlePlatformToggle = (platform: Platform) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('الرجاء إدخال رابط أو نص الخبر.');
      return;
    }
    if (selectedPlatforms.length === 0) {
      setError('الرجاء اختيار منصة واحدة على الأقل للنشر.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Parse news
      const parsed = await parseAndSummarizeNews(content, inputType);

      // 2. Generate captions
      const captions = await generateAllCaptions(parsed);

      // 3. Generate image query and then the image itself
      const imageQuery = await generateImageSearchQuery(parsed);
      const imageBase64 = await generateImage(imageQuery);
      const imageUrl = `data:image/jpeg;base64,${imageBase64}`;

      // 4. Assemble the new NewsItem
      const newItem: NewsItem = {
        id: new Date().toISOString(),
        inputType,
        inputContent: content,
        parsed,
        captions,
        image: {
          source: 'AI Generated (Imagen 4)',
          url: imageUrl,
          license: 'N/A',
          credit_line: 'صورة مولّدة بواسطة Google AI',
          query: imageQuery,
        },
        selectedPlatforms,
        status: PublishStatus.DRAFT,
        createdAt: new Date().toISOString(),
        permalinks: {},
      };

      onSubmit(newItem);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-30 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">إنشاء خبر جديد</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6">
          {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-lg mb-4">{error}</div>}

          <div className="mb-6">
            <label className="block text-lg font-semibold mb-3 text-gray-300">1. أدخل الخبر</label>
            <div className="flex bg-gray-700 rounded-lg p-1">
              <button type="button" onClick={() => setInputType(InputType.URL)} className={`w-1/2 py-2 rounded-md transition-colors ${inputType === InputType.URL ? 'bg-teal-600 text-white font-bold' : 'text-gray-300 hover:bg-gray-600'}`}>
                عبر رابط (URL)
              </button>
              <button type="button" onClick={() => setInputType(InputType.TEXT)} className={`w-1/2 py-2 rounded-md transition-colors ${inputType === InputType.TEXT ? 'bg-teal-600 text-white font-bold' : 'text-gray-300 hover:bg-gray-600'}`}>
                لصق النص
              </button>
            </div>
          </div>
          
          <div className="mb-6">
            {inputType === InputType.URL ? (
              <input
                type="url"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="https://example.com/news/article"
                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
              />
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="الصق نص الخبر هنا..."
                rows={5}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
              ></textarea>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-lg font-semibold mb-3 text-gray-300">2. اختر منصات النشر</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(Object.keys(PLATFORMS) as Platform[]).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePlatformToggle(p)}
                  className={`flex items-center space-x-2 rtl:space-x-reverse p-3 rounded-lg border-2 transition-all duration-200 ${selectedPlatforms.includes(p) ? 'bg-teal-600/20 border-teal-500' : 'bg-gray-700 border-gray-600 hover:border-gray-500'}`}
                >
                  <span className={`text-xl ${selectedPlatforms.includes(p) ? 'text-teal-400' : 'text-gray-400'}`}>{PLATFORMS[p].icon}</span>
                  <span className="font-medium">{PLATFORMS[p].name}</span>
                </button>
              ))}
            </div>
          </div>
        </form>

        <div className="p-6 bg-gray-800/50 border-t border-gray-700">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-teal-600 text-white font-bold py-3 rounded-lg hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? <Spinner /> : 'توليد المحتوى'}
          </button>
        </div>
      </div>
    </div>
  );
};