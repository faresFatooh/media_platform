import React from 'react';
import type { NewsItem } from '../types';
import { PublishStatus } from '../types';
import { PLATFORMS } from '../constants';

interface NewsItemCardProps {
  item: NewsItem;
  onSelect: () => void;
  onDelete: () => void;
}

const statusStyles: Record<PublishStatus, { text: string; bg: string; text_color: string; }> = {
  [PublishStatus.DRAFT]: { text: 'مسودة', bg: 'bg-yellow-500/20', text_color: 'text-yellow-400' },
  [PublishStatus.READY]: { text: 'جاهز للنشر', bg: 'bg-blue-500/20', text_color: 'text-blue-400' },
  [PublishStatus.POSTED]: { text: 'تم النشر', bg: 'bg-green-500/20', text_color: 'text-green-400' },
  [PublishStatus.SCHEDULED]: { text: 'مجدول', bg: 'bg-purple-500/20', text_color: 'text-purple-400' },
  [PublishStatus.FAILED]: { text: 'فشل', bg: 'bg-red-500/20', text_color: 'text-red-400' },
};

const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18"></path>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
);


export const NewsItemCard: React.FC<NewsItemCardProps> = ({ item, onSelect, onDelete }) => {
  const statusStyle = statusStyles[item.status];

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent onSelect from firing
    onDelete();
  };

  return (
    <div
      onClick={onSelect}
      className="bg-gray-800 rounded-lg overflow-hidden shadow-lg cursor-pointer hover:shadow-teal-500/20 hover:ring-2 hover:ring-teal-600 transition-all duration-300 group flex flex-col relative"
    >
      <button 
        onClick={handleDeleteClick}
        className="absolute top-2 left-2 z-10 p-2 bg-gray-900/50 rounded-full text-red-400 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label="Delete item"
      >
        <TrashIcon />
      </button>

      <div className="relative h-48">
        <img src={item.image.url} alt={item.parsed.headline} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className={`absolute top-2 right-2 px-3 py-1 text-sm font-semibold rounded-full ${statusStyle.bg} ${statusStyle.text_color}`}>
          {statusStyle.text}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-lg text-white mb-2 leading-tight group-hover:text-teal-400 transition-colors">
          {item.parsed.headline}
        </h3>
        <p className="text-gray-400 text-sm flex-grow">
          {item.parsed.summary.substring(0, 100)}...
        </p>
        <div className="mt-auto pt-4">
            <div className="flex flex-wrap gap-4 items-center">
                {item.selectedPlatforms.map(p => (
                    <div key={p} className="text-gray-400 hover:text-white transition-colors [&_svg]:h-7 [&_svg]:w-7" title={PLATFORMS[p].name}>
                        {PLATFORMS[p].icon}
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};