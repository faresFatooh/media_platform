
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="flex-shrink-0 bg-gray-800/50 shadow-md p-4 flex items-center justify-between border-b border-gray-700">
      <h1 className="text-xl font-bold text-cyan-400">منصة توليد الأخبار بالذكاء الاصطناعي</h1>
      <div>
        {/* Placeholder for user profile or actions */}
        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
          <span className="text-gray-400">م</span>
        </div>
      </div>
    </header>
  );
};
