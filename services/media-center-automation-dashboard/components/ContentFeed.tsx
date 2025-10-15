
import React from 'react';
import { ContentItem } from '../types';
import ContentCard from './ContentCard';

interface ContentFeedProps {
  items: ContentItem[];
  selectedItemId: string | null;
  onSelectItem: (id: string) => void;
}

const ContentFeed: React.FC<ContentFeedProps> = ({ items, selectedItemId, onSelectItem }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-full overflow-y-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3">
        <i className="fas fa-stream mr-2"></i>
        سير العمل والمحتوى
      </h2>
      {items.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          <i className="fas fa-box-open fa-3x mb-4"></i>
          <p>لا يوجد محتوى بعد. ابدأ بإضافة مدخل جديد.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              isSelected={item.id === selectedItemId}
              onSelect={onSelectItem}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentFeed;
