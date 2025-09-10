import React, { useState, useCallback, useEffect } from 'react';
import { UrlInputSection } from './UrlInputSection';
import { OptionsPanel } from './OptionsPanel';
import { OutputDisplay } from './OutputDisplay';
import { IntegrationPanel } from './IntegrationPanel';
import { Loader } from './Loader';
import { EmailModal } from './EmailModal';
import { UserStats } from './UserStats';
import { SettingsModal } from './SettingsModal';
import { NewsFeedPanel } from './NewsFeedPanel';
import { Toast } from './Toast';
import { DEFAULT_OPTIONS } from '../constants';
import { refineNews } from '../services/geminiService';
import { fetchAndParseRSS } from '../services/rssService';
import type { NewsRefineInput, NewsRefineOutput, StylePrefs, OutputPrefs, Constraints, AppSettings, FeedItem, ToastData, AudioPrefs } from '../types';

interface NewsRefineProps {
  onArticleGenerated: (output: NewsRefineOutput) => void;
}

export const NewsRefine: React.FC<NewsRefineProps> = ({ onArticleGenerated }) => {
  const [urls, setUrls] = useState<string[]>(['', '']);
  const [options, setOptions] = useState<NewsRefineInput>(DEFAULT_OPTIONS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<NewsRefineOutput | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  const [settings, setSettings] = useState<AppSettings>(() => {
    const savedFeeds = localStorage.getItem('newsRefine_rssFeeds');
    const savedApiKey = localStorage.getItem('newsRefine_reutersApiKey');
    const savedAudioPrefs = localStorage.getItem('newsRefine_audioPrefs');
    return {
      rssFeeds: savedFeeds ? JSON.parse(savedFeeds) : [],
      reutersApiKey: savedApiKey || '',
      audioPrefs: savedAudioPrefs ? JSON.parse(savedAudioPrefs) : {
        voice: 'Adam',
        stability: 0.75,
        similarity_boost: 0.75,
      },
    };
  });

  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [seenItemLinks, setSeenItemLinks] = useState<Set<string>>(new Set());

  const [timeLeft, setTimeLeft] = useState(600);
  const [newsCount, setNewsCount] = useState<number>(() => {
    const savedCount = localStorage.getItem('newsRefine_newsCount');
    return savedCount ? parseInt(savedCount, 10) : 0;
  });

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timerId = setInterval(() => setTimeLeft((prevTime) => prevTime - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  useEffect(() => {
    localStorage.setItem('newsRefine_newsCount', newsCount.toString());
  }, [newsCount]);

  const resetTimer = useCallback(() => setTimeLeft(600), []);

  const handleOptionsChange = useCallback(<K extends keyof (StylePrefs & OutputPrefs & Constraints)>(
    section: 'style_prefs' | 'output' | 'constraints',
    key: K,
    value: (StylePrefs & OutputPrefs & Constraints)[K]
  ) => {
    setOptions(prev => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
  }, []);
  
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async () => {
    if (urls.filter(url => url.trim() !== '').length < (options.constraints.min_sources || 2)) {
      setError(`الرجاء إدخال ${options.constraints.min_sources || 2} روابط على الأقل للمتابعة.`);
      return;
    }
    setIsLoading(true);
    setError(null);
    setOutput(null);
    try {
      const result = await refineNews({ ...options, urls: urls.filter(url => url.trim() !== '') });
      setOutput(result);
      onArticleGenerated(result);
      setNewsCount((prevCount) => prevCount + 1);
      resetTimer();
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء معالجة طلبك. الرجاء المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('newsRefine_rssFeeds', JSON.stringify(newSettings.rssFeeds));
    localStorage.setItem('newsRefine_reutersApiKey', newSettings.reutersApiKey);
    localStorage.setItem('newsRefine_audioPrefs', JSON.stringify(newSettings.audioPrefs));
    setIsSettingsOpen(false);
    setFeedItems([]);
    setSeenItemLinks(new Set());
  };

  const handleGenerateFromFeed = (url: string) => {
    setUrls([url, '']);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setFeedItems(prev => prev.filter(item => item.link !== url));
  };
  
  const handleDismissFeedItem = (link: string) => {
     setFeedItems(prev => prev.filter(item => item.link !== link));
     setSeenItemLinks(prev => new Set(prev).add(link));
  };

  useEffect(() => {
    const fetchFeeds = async () => {
      if (settings.rssFeeds.length === 0) return;
      
      const promises = settings.rssFeeds.map(feedUrl => fetchAndParseRSS(feedUrl));
      const results = await Promise.allSettled(promises);

      const newItems: FeedItem[] = [];
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          result.value.forEach(item => {
            if (!seenItemLinks.has(item.link)) {
              newItems.push(item);
              seenItemLinks.add(item.link);
            }
          });
        }
      });
      
      if (newItems.length > 0) {
        newItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
        setFeedItems(prev => [...newItems, ...prev]);
      }
      setSeenItemLinks(new Set(seenItemLinks));
    };

    fetchFeeds();
    const intervalId = setInterval(fetchFeeds, 15 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [settings]);


  return (
    <div className="space-y-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <UserStats timeLeft={timeLeft} newsCount={newsCount} />
      {feedItems.length > 0 && 
          <NewsFeedPanel 
              items={feedItems.slice(0, 5)}
              onGenerate={handleGenerateFromFeed} 
              onDismiss={handleDismissFeedItem}
          />
      }
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200">
          <UrlInputSection urls={urls} setUrls={setUrls} />
          <OptionsPanel options={options} onOptionsChange={handleOptionsChange} />
          <div className="mt-8 border-t pt-6 text-center">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full sm:w-auto bg-sky-600 text-white font-bold py-3 px-10 rounded-lg shadow-md hover:bg-sky-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100"
            >
              {isLoading ? '...جاري المعالجة' : 'إعادة صياغة الخبر'}
            </button>
             {timeLeft <= 0 && !isLoading && (
              <p className="text-red-600 text-sm mt-3 font-semibold">
                انتهى الوقت! الرجاء إنشاء خبر جديد لإعادة تشغيل المؤقت.
              </p>
            )}
          </div>
        </div>

        {isLoading && <Loader />}
        {error && <div className="mt-8 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow" role="alert"><p className="font-bold">خطأ</p><p>{error}</p></div>}
        
        {output && (
          <div className="mt-10 space-y-10">
            <OutputDisplay 
              output={output} 
              options={options}
              audioPrefs={settings.audioPrefs}
              onSendEmail={() => setIsEmailModalOpen(true)} 
              showToast={showToast} 
            />
            <IntegrationPanel />
          </div>
        )}
      </div>
       <footer className="text-center py-6 text-slate-500 text-sm">
          <p>تم التطوير لمركز الإعلام بجامعة النجاح بواسطة Gemini</p>
        </footer>
        {isEmailModalOpen && output && <EmailModal article={output.article} onClose={() => setIsEmailModalOpen(false)} />}
        {isSettingsOpen && <SettingsModal currentSettings={settings} onSave={handleSaveSettings} onClose={() => setIsSettingsOpen(false)} />}
    </div>
  );
};