
import React from 'react';
import { SparklesIcon } from './Icons';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <SparklesIcon className="h-8 w-8 text-green-400" />
          <h1 className="text-2xl font-bold text-white tracking-wider">
            مولّد المحتوى الفلسطيني
          </h1>
        </div>
        <div className="text-sm text-gray-400">
          مدعوم بـ <span className="font-semibold text-green-300">Gemini AI</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
