import React, { useState, useEffect, useCallback } from 'react';
import type { NewsItem } from './types';
import { NewsInputForm } from './components/NewsInputForm';
import { NewsEditorModal } from './components/NewsEditorModal';
import { ConfirmationModal } from './components/ui/ConfirmationModal';
import { LogoIcon } from './constants';
import { Dashboard } from './components/Dashboard';
import { BRANDS } from './brands';
import { getNewsArticles, deleteNewsArticle, updateNewsArticle } from './services/apiService';

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

  // الكود الخاص بالـ postMessage لاستقبال التوكن
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security: check the origin of the message
      if (event.origin !== "https://ghazimortaja.com") return; // Replace with your main frontend URL
      if (event.data && event.data.type === 'AUTH_TOKEN') {
        localStorage.setItem('access_token', event.data.token);
        // Once we have the token, we can load the news
        loadNews();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const loadNews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await getNewsArticles();
      setNewsItems(items);
    } catch (e) {
      setError("فشل تحميل الأخبار من الخادم.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleStartCreation = () => {
    setIsCreating(true);
    setSelectedNewsItem(null);
  };

  const handleCancelCreation = () => {
    setIsCreating(false);
  };

  const handleCreateNewPost = (newItem: NewsItem) => {
    setNewsItems(prev => [newItem, ...prev]);
    setIsCreating(false);
    setSelectedNewsItem(newItem);
  };

  const handleUpdatePost = (updatedItem: NewsItem) => {
    // Optimistic UI update
    setNewsItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    if (selectedNewsItem?.id === updatedItem.id) {
        setSelectedNewsItem(updatedItem);
    }
    // API call to save changes to the database
    updateNewsArticle(updatedItem.id, updatedItem).catch(err => {
      console.error("Failed to update post on backend", err);
      setError("فشل تحديث الخبر في قاعدة البيانات.");
      // Optional: revert optimistic update on failure
    });
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
            // Update state only after successful API call
            setNewsItems(prev => prev.filter(item => item.id !== itemToDelete));
            if (selectedNewsItem?.id === itemToDelete) {
                setSelectedNewsItem(null);
                setIsCreating(false);
            }
        } catch (e) {
            setError("فشل حذف الخبر.");
            console.error(e);
        } finally {
            setItemToDelete(null);
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

  // Filter news items based on the active brand
  const filteredNewsItems = newsItems.filter(item => item.brandId === activeBrandId);
  
  if (isLoading && newsItems.length === 0) return <div className="text-white text-center p-8">جاري تحميل الأخبار...</div>;
  if (error) return <div className="text-red-400 text-center p-8">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col h-screen">
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 shrink-0 z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    <div className="text-teal-400"><LogoIcon /></div>
                    <h1 className="text-xl font-bold text-white">منصة النشر المؤتمت</h1>
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
              onSubmit={handleCreateNewPost} // This function adds the new item to state
              brandId={activeBrandId}
            />
          )}

          {selectedNewsItem && !isCreating && (
            <NewsEditorModal
              newsItem={selectedNewsItem}
              onClose={() => setSelectedNewsItem(null)}
              onUpdate={handleUpdatePost} // This function updates the item
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