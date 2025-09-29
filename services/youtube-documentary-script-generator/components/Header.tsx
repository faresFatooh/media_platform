
import React from 'react';
import { FilmIcon } from './icons';

const Header: React.FC = () => {
    return (
        <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg w-full sticky top-0 z-10">
            <div className="container mx-auto px-4 py-3 flex items-center justify-center sm:justify-between">
                <div className="flex items-center gap-3 text-2xl font-bold text-white">
                    <FilmIcon className="w-8 h-8 text-cyan-400" />
                    <h1>استوديو الأفلام الوثائقية بالذكاء الاصطناعي</h1>
                </div>
                <div className="hidden sm:block text-sm text-gray-400">
                    صناعة محتوى يوتيوب احترافي
                </div>
            </div>
        </header>
    );
};

export default Header;
