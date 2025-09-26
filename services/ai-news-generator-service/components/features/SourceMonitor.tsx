import React, { useState, useEffect, useCallback } from 'react';
import type { NewsSource, SourceArticle } from '../../types';
import { get, post, del, ApiError } from '../../services/apiService';
import { PlusIcon, TrashIcon, GlobeAltIcon } from '../icons/Icons';
import { Spinner } from '../common/Spinner';

export const SourceMonitor: React.FC = () => {
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [selectedSource, setSelectedSource] = useState<NewsSource | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSources = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await get<NewsSource[]>('/api/news-generator/monitored-sources/');
      setSources(data);
      if (data.length > 0 && !selectedSource) {
        setSelectedSource(data[0]);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'فشل في جلب قائمة المصادر.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSource]);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  const handleSelectSource = (source: NewsSource) => {
    setSelectedSource(source);
    // Article fetching from RSS is a backend task not yet implemented.
    // This UI is ready for when that API exists.
  };

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceUrl.trim()) return;
    
    setIsAdding(true);
    setError(null);
    try {
      await post('/api/news-generator/monitored-sources/', { url: newSourceUrl });
      setNewSourceUrl('');
      await fetchSources(); // Refresh list
    } catch (err) {
      setError(err instanceof ApiError ? `فشل إضافة المصدر: ${Object.values(err.data).join(', ')}` : 'فشل إضافة المصدر.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveSource = async (sourceId: number) => {
     if (window.confirm('هل أنت متأكد من أنك تريد حذف هذا المصدر؟')) {
        try {
            setError(null);
            await del(`/api/news-generator/monitored-sources/${sourceId}/`);
            if (selectedSource?.id === sourceId) {
                setSelectedSource(sources.length > 1 ? sources.find(s => s.id !== sourceId) || null : null);
            }
            await fetchSources(); // Refresh list
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'فشل في حذف المصدر.');
        }
     }
  };
  
  const getSourceName = (url: string) => {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-120px)] gap-6">
      {/* Sources List Panel */}
      <div className="w-full md:w-1/3 bg-gray-800/50 p-4 rounded-lg shadow-lg border border-gray-700 flex flex-col">
        <h2 className="text-xl font-bold text-cyan-400 mb-4">قائمة المصادر</h2>
        <form onSubmit={handleAddSource} className="flex gap-2 mb-4">
          <input
            type="url"
            value={newSourceUrl}
            onChange={(e) => setNewSourceUrl(e.target.value)}
            placeholder="أضف رابط مصدر RSS..."
            className="flex-grow p-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none text-sm"
            required
          />
          <button type="submit" disabled={isAdding} className="p-2 bg-cyan-600 hover:bg-cyan-700 rounded-md text-white flex-shrink-0 disabled:bg-gray-500">
            {isAdding ? <Spinner /> : <PlusIcon className="w-5 h-5" />}
          </button>
        </form>

        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}

        <div className="flex-grow overflow-y-auto pr-2">
          {isLoading ? (
             <div className="flex justify-center items-center h-full"><Spinner /></div>
          ) : sources.length > 0 ? (
            sources.map(source => (
              <div
                key={source.id}
                onClick={() => handleSelectSource(source)}
                className={`flex justify-between items-center p-3 mb-2 rounded-md cursor-pointer transition-colors ${
                  selectedSource?.id === source.id ? 'bg-cyan-500/20' : 'hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <GlobeAltIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <span className="font-medium text-gray-200 truncate">{getSourceName(source.url)}</span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleRemoveSource(source.id); }} className="p-1 text-gray-500 hover:text-red-400">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 mt-4">لم يتم إضافة مصادر بعد.</p>
          )}
        </div>
      </div>

      {/* Articles Panel */}
      <div className="w-full md:w-2/3 bg-gray-800/50 p-4 rounded-lg shadow-lg border border-gray-700 flex flex-col">
        <h2 className="text-xl font-bold text-cyan-400 mb-4">
          {selectedSource ? `آخر الأخبار من ${getSourceName(selectedSource.url)}` : 'الرجاء اختيار مصدر'}
        </h2>
        <div className="flex-grow overflow-y-auto pr-2 flex items-center justify-center">
          <div className="text-center text-gray-500">
              <GlobeAltIcon className="w-16 h-16 mx-auto mb-4" />
              {selectedSource ? (
                <>
                    <h3 className="text-lg text-gray-400">ميزة عرض المقالات قيد التطوير</h3>
                    <p className="max-w-md mx-auto">
                        لعرض المقالات هنا، يتطلب الأمر تطوير الواجهة الخلفية لتتمكن من قراءة وتحليل روابط RSS.
                        حالياً، يمكنك إدارة مصادرك واستخدامها في صفحة "الأخبار العاجلة".
                    </p>
                </>
              ) : (
                <p>اختر مصدراً من القائمة لعرض آخر الأخبار.</p>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};
