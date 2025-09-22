
import React from 'react';
import { Search, Filter, HardDriveDownload } from 'lucide-react';

const Archive: React.FC = () => {
  return (
    <div className="bg-surface rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold">الأرشيف الذكي</h3>
      </div>
      <div className="flex gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input
            type="text"
            placeholder="ابحث عن أخبار، أشخاص، أماكن..."
            className="w-full bg-gray-900 border border-border rounded-lg py-3 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button className="flex items-center bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors">
          <Filter className="ml-2" />
          تصفية
        </button>
      </div>
      <div className="h-[60vh] flex items-center justify-center text-center text-text-secondary">
          <div>
              <HardDriveDownload className="w-16 h-16 mx-auto mb-4"/>
              <h4 className="text-2xl font-bold">نتائج البحث تظهر هنا</h4>
              <p>استخدم شريط البحث بالأعلى للعثور على الأصول الإعلامية والأخبار المؤرشفة.</p>
          </div>
      </div>
    </div>
  );
};

export default Archive;
