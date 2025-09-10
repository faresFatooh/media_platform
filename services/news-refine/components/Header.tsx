import React from 'react';
import { UserIcon } from './icons/UserIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { MenuIcon } from './icons/MenuIcon';
import type { User } from '../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, onMenuClick }) => (
  <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-20">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={onMenuClick}
            className="p-2 text-slate-500 hover:text-sky-600 rounded-md"
            aria-label="Open sidebar"
          >
            <MenuIcon />
          </button>
        </div>
        
        {/* Placeholder for potential breadcrumbs or page title */}
        <div className="hidden md:block">
          {/* Example: <h1 className="text-xl font-semibold">Dashboard</h1> */}
        </div>
        
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="flex items-center space-x-2 space-x-reverse bg-slate-100 px-3 py-1.5 rounded-full">
            <UserIcon />
            <div className="text-right">
                <span className="text-sm font-medium text-slate-700 block">{user.email}</span>
                <span className="text-xs font-semibold text-sky-600 bg-sky-100 px-1.5 py-0.5 rounded-full">Admin</span>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            aria-label="Logout"
          >
            <LogoutIcon />
          </button>
        </div>
      </div>
    </div>
  </header>
);