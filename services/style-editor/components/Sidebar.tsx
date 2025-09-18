
import React from 'react';
import { View } from '../types';
import SettingsIcon from './icons/SettingsIcon';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  onSettingsClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, onSettingsClick }) => {
  const navItemClasses = "flex items-center px-4 py-3 text-right text-gray-700 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition-colors duration-200 w-full";
  const activeItemClasses = "bg-blue-600 text-white hover:bg-blue-700 hover:text-white";

  return (
    <aside className="w-64 bg-gray-100 p-4 border-l border-gray-200 flex flex-col">
      <nav className="mt-8 space-y-2">
        <button
          onClick={() => setView(View.Training)}
          className={`${navItemClasses} ${currentView === View.Training ? activeItemClasses : ''}`}
        >
          <span className="font-semibold">خانة التدريب</span>
        </button>
        <button
          onClick={() => setView(View.Editing)}
          className={`${navItemClasses} ${currentView === View.Editing ? activeItemClasses : ''}`}
        >
          <span className="font-semibold">تحرير نص جديد</span>
        </button>
      </nav>
      <div className="mt-auto space-y-4">
        <button
          onClick={onSettingsClick}
          className="flex items-center gap-3 px-4 py-3 text-right text-gray-700 hover:bg-gray-200 rounded-lg transition-colors duration-200 w-full"
        >
          <SettingsIcon />
          <span className="font-semibold">الإعدادات</span>
        </button>
        <div className="text-center text-gray-500 text-sm">
            <p>تطبيق تدريب أسلوب الكتابة</p>
            <p>&copy; 2024</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
