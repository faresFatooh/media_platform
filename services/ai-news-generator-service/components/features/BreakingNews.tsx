import React, { useState, useEffect } from 'react';
import {
  getBreakingNewsFromSources,
  generateArticleWithGemini,
  generateImageWithImagen,
} from '../../services/geminiService';
import { get, post, ApiError } from '../../services/apiService';
import type { BreakingNewsTopic, GeneratedArticle, NewsSource } from '../../types';
import { Spinner } from '../common/Spinner';
import { ArticleDisplay } from './ArticleDisplay';
import { ArticleInputType } from '../../types';

type LoadingStep = 'idle' | 'sources' | 'news';

const TopicCard: React.FC<{ topic: BreakingNewsTopic; onGenerate: (topic: BreakingNewsTopic) => void }> = ({
  topic,
  onGenerate,
}) => (
  <div className="bg-gray-800/70 p-5 rounded-lg shadow-lg border border-gray-700 flex flex-col justify-between animate-fade-in">
    <div>
      <h3 className="text-xl font-bold text-cyan-400 mb-2">{topic.title}</h3>
      <p className="text-gray-300 text-sm mb-4">{topic.summary}</p>
      {Array.isArray(topic.sources) && topic.sources.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-gray-400 mb-2">المصادر:</h4>
          <div className="flex flex-wrap gap-2">
            {topic.sources.map(
              (source, i) =>
                source.uri && (
                  <a
                    href={source.uri}
                    key={i}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-gray-700 text-cyan-300 px-2 py-1 rounded hover:bg-gray-600 truncate max-w-full"
                  >
                    {source.title || new URL(source.uri).hostname}
                  </a>
                )
            )}
          </div>
        </div>
      )}
    </div>
    <button
      onClick={() => onGenerate(topic)}
      className="w-full mt-auto bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md transition duration-300"
    >
      🚀 توليد مقال كامل
    </button>
  </div>
);

export const BreakingNews: React.FC = () => {
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [topics, setTopics] = useState<BreakingNewsTopic[]>([]);
  const [loadingStep, setLoadingStep] = useState<LoadingStep>('sources');
  const [error, setError] = useState<string | null>(null);
  const [generatedArticle, setGeneratedArticle] = useState<GeneratedArticle | null>(null);
  const [isGeneratingArticle, setIsGeneratingArticle] = useState(false);
  const [generationMessage, setGenerationMessage] = useState('');
  const [newSourceUrl, setNewSourceUrl] = useState('');

  // 🔹 Normalize Sources
  const normalizeSources = (data: any): NewsSource[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data.sources)) return data.sources;
    if (Array.isArray(data.items)) return data.items;
    if (typeof data === 'object') return Object.values(data);
    return [];
  };

  // 🔹 Fetch sources
  useEffect(() => {
    const fetchSources = async () => {
      try {
        setError(null);
        setLoadingStep('sources');
        const fetchedSources = await get<any>('/api/news-generator/monitored-sources/');
        setSources(normalizeSources(fetchedSources));
      } catch (err) {
        console.error('Error fetching sources:', err);
        setError(err instanceof ApiError ? err.message : 'فشل في جلب مصادر الأخبار.');
        setLoadingStep('idle');
      }
    };
    fetchSources();
  }, []);

  // 🔹 Fetch news after sources
  useEffect(() => {
    if (!Array.isArray(sources) || sources.length === 0) {
      setLoadingStep('idle');
      return;
    }

    const fetchNews = async () => {
      try {
        setError(null);
        setLoadingStep('news');
        const fetchedTopics = await getBreakingNewsFromSources(sources);
        setTopics(fetchedTopics || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع أثناء جلب الأخبار.');
      } finally {
        setLoadingStep('idle');
      }
    };
    fetchNews();
  }, [sources]);

  // 🔹 Generate article
  const handleGenerateArticle = async (topic: BreakingNewsTopic) => {
    setIsGeneratingArticle(true);
    setGenerationMessage('جاري تحليل الموضوع وتوليد المقال...');
    setError(null);

    try {
      const articleTextData = await generateArticleWithGemini(ArticleInputType.TITLE, topic.title);
      setGenerationMessage('تم إنشاء المقال، جاري توليد صورة مرتبطة...');

      let imageUrl = '';
      try {
        imageUrl = await generateImageWithImagen(articleTextData.title);
      } catch (imageError) {
        console.warn('Image generation failed:', imageError);
      }

      setGeneratedArticle({ ...articleTextData, imageUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع.');
    } finally {
      setIsGeneratingArticle(false);
    }
  };

  // 🔹 Reset
  const handleReset = () => {
    setGeneratedArticle(null);
    setError(null);
  };

  // 🔹 Add source
  const handleAddSource = async () => {
    if (!newSourceUrl.trim()) return;
    try {
      await post<any, { url: string }>('/api/news-generator/monitored-sources/', { url: newSourceUrl });
      const refreshedSources = await get<any>('/api/news-generator/monitored-sources/');
      setSources(normalizeSources(refreshedSources));
      setNewSourceUrl('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'فشل في إضافة المصدر.');
    }
  };

  const getLoadingMessage = () => {
    if (isGeneratingArticle) return generationMessage;
    if (loadingStep === 'sources') return 'جاري جلب مصادرك الإخبارية...';
    if (loadingStep === 'news') return 'جاري البحث عن آخر الأخبار...';
    return '';
  };

  // 🔹 Render
  if (loadingStep !== 'idle' || isGeneratingArticle) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Spinner />
        <p className="mt-4 text-lg text-gray-300">{getLoadingMessage()}</p>
      </div>
    );
  }

  if (generatedArticle) {
    return <ArticleDisplay article={generatedArticle} onReset={handleReset} />;
  }

  if (error) {
    return (
      <div className="text-center text-red-400 p-8 bg-red-900/20 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">خطأ</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-cyan-400 mb-6">أخبار عاجلة من مصادرك</h2>

      {/* إضافة مصدر جديد */}
      <div className="mb-6 flex gap-2">
        <input
          type="url"
          placeholder="أدخل رابط مصدر إخباري..."
          value={newSourceUrl}
          onChange={(e) => setNewSourceUrl(e.target.value)}
          className="flex-1 px-3 py-2 rounded-md border border-gray-600 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <button
          onClick={handleAddSource}
          className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-4 py-2 rounded-md"
        >
          ➕ إضافة مصدر
        </button>
      </div>

      {Array.isArray(sources) && sources.length === 0 ? (
        <div className="text-center text-gray-400 p-8 bg-gray-800/50 rounded-lg">
          <h3 className="text-2xl font-bold mb-3">لم يتم العثور على مصادر</h3>
          <p>أضف بعض المصادر أعلاه لتظهر لك الأخبار.</p>
        </div>
      ) : Array.isArray(topics) && topics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic, i) => (
            <TopicCard key={i} topic={topic} onGenerate={handleGenerateArticle} />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 p-8 bg-gray-800/50 rounded-lg">
          <p>لا توجد أخبار عاجلة حاليًا.</p>
        </div>
      )}
    </div>
  );
};
