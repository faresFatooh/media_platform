
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, UserCircle, Search } from 'lucide-react';

const getPageTitle = (pathname: string): string => {
  if (pathname.startsWith('/editor')) return 'محرر الأخبار';
  switch (pathname) {
    case '/': return 'لوحة التحكم الرئيسية';
    case '/queue': return 'طابور التحرير';
    case '/sources': return 'إدارة المصادر';
    case '/archive': return 'الأرشيف الذكي';
    case '/integrations': return 'إدارة نقاط الربط';
    case '/settings': return 'الإعدادات العامة';
    default: return 'غرفة الأخبار';
  }
};

const Header: React.FC = () => {
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  return (
    <header className="h-16 bg-surface flex items-center justify-between px-6 border-b border-border">
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      <div className="flex items-center space-x-reverse space-x-5">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input
            type="text"
            placeholder="بحث..."
            className="bg-gray-700 border border-border rounded-lg py-2 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button className="text-text-secondary hover:text-white relative">
          <Bell className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </button>
        <div className="flex items-center space-x-reverse space-x-2">
           <UserCircle className="w-8 h-8 text-text-secondary"/>
           <div>
               <p className="font-semibold text-sm">رئيس التحرير</p>
               <p className="text-xs text-text-secondary">Admin</p>
           </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
