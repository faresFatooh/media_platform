
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Zap, Rss, ListChecks, Archive, Settings, PenSquare } from 'lucide-react';

const navItems = [
  { path: '/', label: 'لوحة التحكم', icon: Home },
  { path: '/queue', label: 'طابور التحرير', icon: ListChecks },
  { path: '/sources', label: 'المصادر', icon: Rss },
  { path: '/archive', label: 'الأرشيف', icon: Archive },
  { path: '/integrations', label: 'نقاط الربط', icon: Zap },
  { path: '/settings', label: 'الإعدادات', icon: Settings },
];

const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-surface text-text-primary flex flex-col border-l border-border">
      <div className="h-16 flex items-center justify-center border-b border-border">
        <h1 className="text-2xl font-bold text-white">
          أخبار<span className="text-primary">.ai</span>
        </h1>
      </div>
      <nav className="flex-1 px-4 py-6">
        <ul>
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 my-1 rounded-md text-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-6 h-6 ml-4" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-border">
        <div className="text-center text-text-secondary text-sm">
          <p>&copy; 2024 غرفة الأخبار الآلية</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
