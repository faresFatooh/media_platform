import React from 'react';
import type { FeedItem } from '../types';
import { RssIcon } from './icons/RssIcon';

interface NewsFeedPanelProps {
  items: FeedItem[];
  onGenerate: (url: string) => void;
  onDismiss: (link: string) => void;
}

const timeSince = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return `قبل ${Math.floor(interval)} سنة`;
  interval = seconds / 2592000;
  if (interval > 1) return `قبل ${Math.floor(interval)} شهر`;
  interval = seconds / 86400;
  if (interval > 1) return `قبل ${Math.floor(interval)} يوم`;
  interval = seconds / 3600;
  if (interval > 1) return `قبل ${Math.floor(interval)} ساعة`;
  interval = seconds / 60;
  if (interval > 1) return `قبل ${Math.floor(interval)} دقيقة`;
  return `قبل ${Math.floor(seconds)} ثانية`;
};


export const NewsFeedPanel: React.FC<NewsFeedPanelProps> = ({ items, onGenerate, onDismiss }) => {
  return (
    <div className="max-w-4xl mx-auto mb-6">
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
        <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center">
            <RssIcon className="h-5 w-5 ml-2 text-sky-600" />
            اقتراحات من الوكالات (آخر 15 دقيقة)
        </h3>
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.link} className="bg-slate-50/70 p-3 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex-1">
                <p className="font-semibold text-slate-800 text-sm leading-relaxed">{item.title}</p>
                <p className="text-xs text-slate-500 mt-1">
                    {item.source} &middot; {timeSince(new Date(item.pubDate))}
                </p>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse self-end sm:self-center flex-shrink-0">
                <button 
                  onClick={() => onGenerate(item.link)}
                  className="text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 px-3 py-1.5 rounded-md transition-colors"
                >
                    توليد خبر
                </button>
                 <button 
                    onClick={() => onDismiss(item.link)}
                    className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1.5 rounded-md transition-colors"
                >
                    تجاهل
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
