import React, { useState, useEffect, useCallback } from 'react';
import type { NewsItem } from './types';
import { NewsInputForm } from './components/NewsInputForm';
import { NewsEditorModal } from './components/NewsEditorModal';
import { ConfirmationModal } from './components/ui/ConfirmationModal';
import { LogoIcon } from './constants';
import { Dashboard } from './components/Dashboard';
import { BRANDS } from './brands';
// استيراد الدوال الجديدة
import { getNewsArticles, createNewsArticle, deleteNewsArticle, updateNewsArticlePosts } from './services/apiService';

const EditorPlaceholder: React.FC = () => (
  <div className="flex-grow flex items-center justify-center bg-gray-800/50 rounded-lg h-full">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-400">مرحباً بك في منصة النشر</h2>
      <p className="text-gray-500 mt-2">اختر خبراً من القائمة لتعديله، أو انقر على "إنشاء خبر جديد" للبدء.</p>
    </div>
  </div>
);

const App: React.FC = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [selectedNewsItem, setSelectedNewsItem] = useState<NewsItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [activeBrandId, setActiveBrandId] = useState<string>(Object.keys(BRANDS)[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // جلب الأخبار من قاعدة البيانات عند تحميل التطبيق
  useEffect(() => {
    const loadNews = async () => {
      try {
        const items = await getNewsArticles();
        setNewsItems(items);
      } catch (e) {
        setError("فشل تحميل الأخبار من الخادم.");
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadNews();
  }, []);
  
    // الكود الخاص بالـ postMessage لاستقبال التوكن
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://ghazimortaja.com") return;
      if (event.data && event.data.type === 'AUTH_TOKEN') {
        localStorage.setItem('access_token', event.data.token);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);


  const handleStartCreation = () => {
    setIsCreating(true);
    setSelectedNewsItem(null);
  };

  const handleCancelCreation = () => {
    setIsCreating(false);
  };

  const handleCreateNewPost = async (newItem: NewsItem) => {
      try {
          const savedItem = await createNewsArticle(newItem);
          setNewsItems(prev => [savedItem, ...prev]);
          setIsCreating(false);
          setSelectedNewsItem(savedItem);
      } catch (e) {
          setError("فشل حفظ الخبر الجديد في قاعدة البيانات.");
          console.error(e);
      }
  };

  const handleUpdatePost = (updatedItem: NewsItem) => {
    // TODO: Implement update API call
    setNewsItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    if (selectedNewsItem?.id === updatedItem.id) {
        setSelectedNewsItem(updatedItem);
    }
  };
  
  const handleSelectNewsItem = (item: NewsItem) => {
    setSelectedNewsItem(item);
    setIsCreating(false);
  };

  const requestDelete = (itemId: string) => {
    setItemToDelete(itemId);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
        try {
            await deleteNewsArticle(itemToDelete);
            setNewsItems(prev => prev.filter(item => item.id !== itemToDelete));
            if (selectedNewsItem?.id === itemToDelete) {
                setSelectedNewsItem(null);
                setIsCreating(false);
            }
            setItemToDelete(null); 
        } catch (e) {
            setError("فشل حذف الخبر.");
            console.error(e);
        }
    }
  };

  const cancelDelete = () => {
    setItemToDelete(null);
  };
  
  const handleBrandChange = (brandId: string) => {
      setActiveBrandId(brandId);
      setSelectedNewsItem(null);
      setIsCreating(false);
  };

  const filteredNewsItems = newsItems.filter(item => item.brandId === activeBrandId);

  if (isLoading) return <div className="text-white text-center p-8">جاري تحميل الأخبار...</div>;
  if (error) return <div className="text-red-400 text-center p-8">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col h-screen">
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 shrink-0 z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="text-teal-400">
                <LogoIcon />
              </div>
              <h1 className="text-xl font-bold text-white">
                منصة النشر المؤتمت
              </h1>
            </div>
             <div className="flex items-center gap-2">
                {Object.values(BRANDS).map(brand => (
                    <button key={brand.id} onClick={() => handleBrandChange(brand.id)}
                    className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeBrandId === brand.id ? 'bg-teal-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                        {brand.name}
                    </button>
                ))}
              </div>
            <button
              onClick={handleStartCreation}
              className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-500"
            >
              إنشاء خبر جديد
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow flex min-h-0">
        <aside className="w-1/3 max-w-sm xl:w-1/4 bg-gray-800/30 p-4 overflow-y-auto">
           <Dashboard 
             newsItems={filteredNewsItems} 
             onSelectNewsItem={handleSelectNewsItem}
             onDeleteItem={requestDelete}
             selectedItemId={selectedNewsItem?.id}
             brandName={BRANDS[activeBrandId].name}
           />
        </aside>

        <section className="flex-grow p-4 flex flex-col">
          {isCreating && (
            <NewsInputForm
              onClose={handleCancelCreation}
              onSubmit={handleCreateNewPost}
              brandId={activeBrandId}
            />
          )}

          {selectedNewsItem && !isCreating && (
            <NewsEditorModal
              newsItem={selectedNewsItem}
              onClose={() => setSelectedNewsItem(null)}
              onUpdate={handleUpdatePost}
            />
          )}

          {!selectedNewsItem && !isCreating && (
            <EditorPlaceholder />
          )}
        </section>
      </main>

      {itemToDelete && (
        <ConfirmationModal
          isOpen={!!itemToDelete}
          title="تأكيد الحذف"
          message="هل أنت متأكد من رغبتك في حذف هذا الخبر بشكل دائم؟"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          confirmText="حذف"
          cancelText="إلغاء"
        />
      )}
    </div>
  );
};

export default App;