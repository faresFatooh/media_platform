import React from 'react';
import type { View } from '../types';
import { SettingsIcon } from './icons/SettingsIcon';
import { DashboardIcon } from './icons/DashboardIcon';
import { RobotIcon } from './icons/RobotIcon';
import { PencilSwooshIcon } from './icons/PencilSwooshIcon';
import { VideoClapperIcon } from './icons/VideoClapperIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { CloseIcon } from './icons/CloseIcon';
// FIX: Import MicrophoneIcon to resolve the 'Cannot find name' error.
import { MicrophoneIcon } from './icons/MicrophoneIcon';

interface SidebarProps {
    activeView: View;
    setActiveView: (view: View) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const NavItem: React.FC<{
    view: View;
    activeView: View;
    setActiveView: (view: View) => void;
    icon: React.ReactNode;
    label: string;
}> = ({ view, activeView, setActiveView, icon, label }) => {
    const isActive = activeView === view;
    return (
        <button
            onClick={() => setActiveView(view)}
            className={`w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg text-right transition-colors duration-200 ${
                isActive
                    ? 'bg-sky-600 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
        >
            <div className="flex-shrink-0">{icon}</div>
            <span className="font-semibold">{label}</span>
        </button>
    );
};

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isOpen, setIsOpen }) => {
    const menuItems = [
        { view: 'dashboard', icon: <DashboardIcon />, label: 'لوحة التحكم الرئيسية' },
        { view: 'news_refine', icon: <PencilSwooshIcon />, label: 'صياغة الأخبار (الرئيسية)' },
        { view: 'content_pipeline', icon: <RobotIcon />, label: 'النشر الآلي والمراجعة' },
        { view: 'transcription', icon: <MicrophoneIcon />, label: 'التفريغ النصي والسكريبت' },
        { view: 'media_tools', icon: <VideoClapperIcon />, label: 'أدوات الميديا الذكية' },
        { view: 'community', icon: <ShieldCheckIcon />, label: 'إدارة المجتمع' },
        { view: 'management', icon: <BriefcaseIcon />, label: 'الإدارة والمشاريع' },
    ];
    
    const sidebarContent = (
        <>
            <div className="px-4 py-6 flex items-center justify-between">
                <div className="text-right">
                    <h1 className="text-2xl font-bold text-white">NewsRefine</h1>
                    <p className="text-slate-400 text-sm">لوحة تحكم الإعلام</p>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="md:hidden p-2 text-slate-400 hover:text-white"
                    aria-label="Close sidebar"
                >
                    <CloseIcon />
                </button>
            </div>
            <nav className="flex-1 px-4 space-y-2">
                {menuItems.map(item => (
                    <NavItem
                        key={item.view}
                        view={item.view as View}
                        activeView={activeView}
                        setActiveView={(v) => {
                            setActiveView(v);
                            setIsOpen(false);
                        }}
                        icon={item.icon}
                        label={item.label}
                    />
                ))}
            </nav>
            <div className="px-4 py-4 mt-4 border-t border-slate-700">
                <button
                    className="w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                    <SettingsIcon />
                    <span className="font-semibold">الإعدادات</span>
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile Sidebar */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity md:hidden ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setIsOpen(false)}
            ></div>
            <aside
                className={`fixed top-0 right-0 h-full w-64 bg-slate-800 text-white flex flex-col z-40 transform transition-transform duration-300 ease-in-out md:hidden ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                {sidebarContent}
            </aside>
            
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex md:flex-col md:fixed md:top-0 md:right-0 md:h-full md:w-64 bg-slate-800 text-white">
                {sidebarContent}
            </aside>
        </>
    );
};