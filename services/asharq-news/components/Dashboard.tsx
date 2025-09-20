import React from 'react';
import type { NewsItem } from '../types';
import { NewsItemCard } from './NewsItemCard';

interface DashboardProps {
  newsItems: NewsItem[];
  onSelectNewsItem: (item: NewsItem) => void;
  onDeleteItem: (itemId: string) => void;
  selectedItemId?: string | null;
  brandName: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ newsItems, onSelectNewsItem, onDeleteItem, selectedItemId, brandName }) => {
  if (newsItems.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-400">لا توجد أخبار لـ <span className="text-teal-400">{brandName}</span></h2>
        <p className="text-gray-500 mt-2">انقر على "إنشاء خبر جديد" للبدء.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-300 px-2">الأخبار لـ {brandName} ({newsItems.length})</h2>
      {newsItems.map(item => (
        <NewsItemCard 
          key={item.id} 
          item={item} 
          onSelect={() => onSelectNewsItem(item)}
          onDelete={() => onDeleteItem(item.id)}
          isSelected={item.id === selectedItemId}
        />
      ))}
    </div>
  );
};