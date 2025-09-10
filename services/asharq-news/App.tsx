import React, { useState } from 'react';
import type { NewsItem } from './types';
import { NewsInputForm } from './components/NewsInputForm';
import { Dashboard } from './components/Dashboard';
import { NewsEditorModal } from './components/NewsEditorModal';
import { ConfirmationModal } from './components/ui/ConfirmationModal';
import { LogoIcon } from './constants';

const App: React.FC = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedNewsItem, setSelectedNewsItem] = useState<NewsItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleCreateNewPost = (newItem: NewsItem) => {
    setNewsItems(prev => [newItem, ...prev]);
    setIsFormOpen(false);
    setSelectedNewsItem(newItem); // Open editor immediately after creation
  };

  const handleUpdatePost = (updatedItem: NewsItem) => {
    setNewsItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  };
  
  const handleSelectNewsItem = (item: NewsItem) => {
    setSelectedNewsItem(item);
  };

  const requestDelete = (itemId: string) => {
    setItemToDelete(itemId);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      setNewsItems(prev => prev.filter(item => item.id !== itemToDelete));
      if (selectedNewsItem?.id === itemToDelete) {
        setSelectedNewsItem(null);
      }
      setItemToDelete(null); 
    }
  };

  const cancelDelete = () => {
    setItemToDelete(null);
  };


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="text-teal-400">
                <LogoIcon />
              </div>
              <h1 className="text-xl font-bold text-white">
                منصة النشر المؤتمت للأخبار
              </h1>
            </div>
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75 transition-colors"
            >
              إنشاء خبر جديد
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <Dashboard 
          newsItems={newsItems} 
          onSelectNewsItem={handleSelectNewsItem}
          onDeleteItem={requestDelete} 
        />
      </main>

      {isFormOpen && (
        <NewsInputForm
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleCreateNewPost}
        />
      )}

      {selectedNewsItem && (
        <NewsEditorModal
          newsItem={selectedNewsItem}
          onClose={() => setSelectedNewsItem(null)}
          onUpdate={handleUpdatePost}
        />
      )}

      {itemToDelete && (
        <ConfirmationModal
          isOpen={!!itemToDelete}
          title="تأكيد الحذف"
          message="هل أنت متأكد من رغبتك في حذف هذا الخبر بشكل دائم؟ لا يمكن التراجع عن هذا الإجراء."
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