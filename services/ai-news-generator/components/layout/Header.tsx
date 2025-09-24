
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogoutIcon } from '../icons/Icons';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  return (
    <header className="flex-shrink-0 bg-gray-800/50 shadow-md p-4 flex items-center justify-between border-b border-gray-700">
      <h1 className="text-xl font-bold text-cyan-400">منصة توليد الأخبار بالذكاء الاصطناعي</h1>
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center ring-2 ring-transparent hover:ring-cyan-400 transition-all"
        >
          <span className="text-gray-300 font-bold">{user?.name?.charAt(0).toUpperCase() ?? 'م'}</span>
        </button>
        {dropdownOpen && (
           <div ref={dropdownRef} className="absolute left-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1 z-20">
             <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-700">
                <p className="font-semibold text-gray-300">مرحباً، {user?.name}</p>
                <p>{user?.email}</p>
             </div>
            <button
              onClick={logout}
              className="w-full flex items-center px-4 py-2 text-sm text-red-400 hover:bg-red-500/20"
            >
              <LogoutIcon className="w-4 h-4 ml-2" />
              تسجيل الخروج
            </button>
          </div>
        )}
      </div>
    </header>
  );
};