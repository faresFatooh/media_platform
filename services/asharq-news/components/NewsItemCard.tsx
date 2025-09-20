import React from 'react';
import type { NewsItem } from '../types';
import { PublishStatus } from '../types';
import { PLATFORMS } from '../constants';

interface NewsItemCardProps {
  item: NewsItem;
  onSelect: () => void;
  onDelete: () => void;
  isSelected: boolean;
}

const statusStyles: Record<PublishStatus, { text: string; bg: string; text_color: string; }> = {
  [PublishStatus.DRAFT]: { text: 'مسودة', bg: 'bg-yellow-500/20', text_color: 'text-yellow-400' },
  [PublishStatus.READY]: { text: 'جاهز للنشر', bg: 'bg-blue-500/20', text_color: 'text-blue-400' },
  [PublishStatus.POSTED]: { text: 'تم النشر', bg: 'bg-green-500/20', text_color: 'text-green-400' },
  [PublishStatus.SCHEDULED]: { text: 'مجدول', bg: 'bg-purple-500/20', text_color: 'text-purple-400' },
  [PublishStatus.FAILED]: { text: 'فشل', bg: 'bg-red-500/20', text_color: 'text-red-400' },
};

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M3 6h18"></path>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
);


export const NewsItemCard: React.FC<NewsItemCardProps> = ({ item, onSelect, onDelete, isSelected }) => {
  const statusStyle = statusStyles[item.status];

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent onSelect from firing
    onDelete();
  };

  const baseClasses = "bg-gray-800 rounded-lg shadow-lg cursor-pointer hover:bg-gray-700/60 transition-all duration-300 group flex relative overflow-hidden border-2";
  const selectedClasses = isSelected ? "border-teal-500" : "border-transparent";

  return (
    <div
      onClick={onSelect}
      className={`${baseClasses} ${selectedClasses}`}
    >
      <button 
        onClick={handleDeleteClick}
        className="absolute top-2 left-2 z-10 p-1.5 bg-gray-900/50 rounded-full text-red-400 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label="Delete item"
      >
        <TrashIcon className="w-4 h-4" />
      </button>

      <div className="w-24 h-24 shrink-0">
        <img src={item.image.url} alt={item.parsed.headline} className="w-full h-full object-cover" />
      </div>
      
      <div className="p-3 flex flex-col justify-between overflow-hidden">
        <div>
           <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusStyle.bg} ${statusStyle.text_color}`}>
            {statusStyle.text}
          </span>
          <h3 className="font-bold text-sm text-white mt-1 leading-tight truncate group-hover:text-teal-400 transition-colors">
            {item.parsed.headline}
          </h3>
        </div>

        <div className="flex flex-wrap gap-2 items-center mt-2">
            {item.selectedPlatforms.map(p => (
                <div key={p} className="text-gray-400 [&_svg]:h-4 [&_svg]:w-4" title={PLATFORMS[p].name}>
                    {PLATFORMS[p].icon}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
