import React from 'react';
import type { NewsItem } from '../types';
import { NewsItemCard } from './NewsItemCard';

interface DashboardProps {
  newsItems: NewsItem[];
  onSelectNewsItem: (item: NewsItem) => void;
  onDeleteItem: (itemId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ newsItems, onSelectNewsItem, onDeleteItem }) => {
  if (newsItems.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-400">لا توجد أخبار بعد</h2>
        <p className="text-gray-500 mt-2">انقر على "إنشاء خبر جديد" للبدء.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {newsItems.map(item => (
        <NewsItemCard 
          key={item.id} 
          item={item} 
          onSelect={() => onSelectNewsItem(item)}
          onDelete={() => onDeleteItem(item.id)}
        />
      ))}
    </div>
  );
};