
import React from 'react';
import type { View } from '../../types';
import { NewspaperIcon, SparklesIcon, EyeIcon, BookOpenIcon } from '../icons/Icons';


interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const navItems = [
    { id: 'generator', label: 'توليد مقال', icon: <SparklesIcon className="w-6 h-6" /> },
    { id: 'breakingNews', label: 'أخبار عاجلة', icon: <NewspaperIcon className="w-6 h-6" /> },
    { id: 'monitor', label: 'مراقبة المصادر', icon: <EyeIcon className="w-6 h-6" /> },
    { id: 'trainingExamples', label: 'أمثلة التدريب', icon: <BookOpenIcon className="w-6 h-6" /> },
  ];

  return (
    <aside className="w-64 bg-gray-800/50 p-4 flex flex-col border-l border-gray-700">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">AI News Gen</h2>
      </div>
      <nav className="flex flex-col space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id as View)}
            className={`flex items-center space-x-3 rtl:space-x-reverse p-3 rounded-lg text-right transition-colors duration-200 ${
              activeView === item.id
                ? 'bg-cyan-500/20 text-cyan-300'
                : 'text-gray-300 hover:bg-gray-700/50'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="mt-auto p-2 text-center text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()}. كل الحقوق محفوظة.</p>
      </div>
    </aside>
  );
};