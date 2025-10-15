
import React from 'react';
import { ContentItem, ContentStatus } from '../types';

interface ContentCardProps {
  item: ContentItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const statusStyles: Record<ContentStatus, string> = {
  [ContentStatus.DRAFT]: 'bg-gray-200 text-gray-800',
  [ContentStatus.PROCESSING]: 'bg-blue-200 text-blue-800 animate-pulse',
  [ContentStatus.READY_FOR_REVIEW]: 'bg-yellow-200 text-yellow-800',
  [ContentStatus.APPROVED]: 'bg-green-200 text-green-800',
  [ContentStatus.PUBLISHED]: 'bg-purple-200 text-purple-800',
  [ContentStatus.FAILED]: 'bg-red-200 text-red-800',
};

const ContentCard: React.FC<ContentCardProps> = ({ item, isSelected, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(item.id)}
      className={`p-4 border-r-4 rounded-lg cursor-pointer transition-all duration-200 ${
        isSelected ? 'bg-blue-50 border-blue-500 shadow-lg' : 'bg-white border-transparent hover:bg-gray-50 hover:shadow-md'
      }`}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-gray-800 text-md mb-2 pr-2">{item.title}</h3>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusStyles[item.status]}`}>
          {item.status}
        </span>
      </div>
      <div className="flex items-center text-sm text-gray-500 mt-2">
        <i className={`${item.sourceIcon} ml-2`}></i>
        <span>{item.source}</span>
        <span className="mx-2">|</span>
        <i className="far fa-clock ml-1"></i>
        <span>{item.createdAt}</span>
      </div>
    </div>
  );
};

export default ContentCard;
