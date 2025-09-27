
import React from 'react';

const ICONS: Record<string, React.ReactNode> = {
    'growth': (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
    ),
    'idea': (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.08 17.5a1 1 0 0 0 1.84 0A10 10 0 1 0 7.08 17.5a1 1 0 0 0 1.84 0c.22-.53.48-1.04.78-1.5H14.3c.3.46.56.97.78 1.5Z"></path><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.5-1-3-3-3S5 10.5 5 12a2.5 2.5 0 0 0 2.5 2.5Z"></path><path d="M15.5 14.5a2.5 2.5 0 0 0 2.5-2.5c0-1.5-1-3-3-3s-3 1.5-3 3a2.5 2.5 0 0 0 2.5 2.5Z"></path></svg>
    ),
    'data': (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20V16"></path></svg>
    ),
    'team': (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
    ),
    'technology': (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
    ),
    'success': (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
    ),
    'finance': (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
    ),
    'communication': (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path></svg>
    ),
    'strategy': (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
    ),
    'security': (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
    ),
    'health': (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
    ),
    'education': (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 10-7.5 5.1-3.42-2.55a2 2 0 0 0-2.16 0L2 10"/><path d="m22 10-10-7L2 10"/><path d="M4 19.5v-7L12 18l8-5.5v7L12 22Z"/></svg>
    ),
    'environment': (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c-2 0-3-3-3-6 0-2 1-4 2-5 1-1 2-2 2-4 0-1 0-2-1-2-1-1-2-2-2-4-1 0-2-1-2-2m6 18c2 0 3-3 3-6 0-2-1-4-2-5-1-1-2-2-2-4 0-1 0-2 1-2 1-1 2-2 2-4 1 0 2-1 2-2"/><path d="M10 2c-1 1-2 2-2 4 0 2 1 3 2 4 1 1 2 2 2 4 0 3-1 6-3 6"/><path d="M14 2c1 1 2 2 2 4 0 2-1 3-2 4-1 1-2 2-2 4 0 3 1 6 3 6"/><path d="M4 14h16"/></svg>
    ),
    'global': (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
    ),
    'default': (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
    )
};

export const ICON_LIST = Object.keys(ICONS);

interface IconProps {
    name: string;
}

export const Icon: React.FC<IconProps> = ({ name }) => {
    const isCustomIcon = name.startsWith('data:image/');

    if (isCustomIcon) {
        return (
            <div className="w-full h-full">
                <img src={name} alt="Custom Icon" className="w-full h-full object-contain drop-shadow-[0_0.0625rem_0.0625rem_rgba(0,0,0,0.5)]" />
            </div>
        );
    }
    
    const iconNode = ICONS[name] || ICONS['default'];
    return (
        <div className="w-full h-full text-current drop-shadow-[0_0.0625rem_0.0625rem_rgba(0,0,0,0.5)] flex items-center justify-center">
            {iconNode}
        </div>
    );
};
