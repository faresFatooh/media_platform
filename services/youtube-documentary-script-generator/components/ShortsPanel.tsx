
import React, { useState } from 'react';
import type { ShortsScript } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { ClipboardDocumentIcon, DevicePhoneMobileIcon } from './icons';

interface ShortsPanelProps {
    shortsScripts: ShortsScript[] | null;
    onGenerateShorts: () => void;
    isLoadingShorts: boolean;
}

const ShortsPanel: React.FC<ShortsPanelProps> = ({ shortsScripts, onGenerateShorts, isLoadingShorts }) => {
    const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedStates({ [id]: true });
        setTimeout(() => setCopiedStates(prev => ({ ...prev, [id]: false })), 2000);
    };

    if (!shortsScripts && !isLoadingShorts) {
        return (
            <div className="text-center">
                 <button
                    onClick={onGenerateShorts}
                    disabled={isLoadingShorts}
                    className="w-full max-w-sm flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-3 px-4 rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                >
                    {isLoadingShorts ? <LoadingSpinner /> : <DevicePhoneMobileIcon className="w-5 h-5" />}
                    <span>تحويل إلى مقاطع قصيرة</span>
                </button>
                <p className="text-sm text-gray-400 mt-2">حوّل نص الفيلم إلى 3 نصوص قصيرة مناسبة لـ Reels و Shorts.</p>
            </div>
        );
    }
    
    if (isLoadingShorts) {
         return (
            <div className="flex flex-col items-center justify-center min-h-[200px]">
                <LoadingSpinner />
                <p className="mt-4 text-gray-400">...جارٍ تحويل النص إلى مقاطع قصيرة</p>
            </div>
        );
    }

    if (!shortsScripts) return null;

    const renderShortBlock = (short: ShortsScript, index: number) => {
        const id = `short-${index}`;
        return (
            <div key={id} className="bg-gray-700/50 p-4 rounded-lg">
                <h4 className="font-semibold text-rose-400 mb-2">{short.title}</h4>
                <div className="space-y-2 text-sm">
                    <p><strong>الخطاف (Hook):</strong> {short.hook}</p>
                    <p><strong>المحتوى:</strong> {short.content}</p>
                    <p className="text-gray-400"><strong>اقتراح مرئي:</strong> {short.visualSuggestion}</p>
                </div>
                <button 
                    onClick={() => copyToClipboard(
                        `العنوان: ${short.title}\n\nالخطاف: ${short.hook}\n\nالمحتوى: ${short.content}\n\nاقتراح مرئي: ${short.visualSuggestion}`,
                        id
                    )}
                    className="mt-3 text-xs bg-gray-600 hover:bg-gray-500 text-gray-200 px-2 py-1 rounded-md flex items-center gap-1 transition"
                >
                    <ClipboardDocumentIcon className="w-4 h-4" />
                    {copiedStates[id] ? 'تم النسخ!' : 'نسخ النص'}
                </button>
            </div>
        );
    };
    

    return (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {shortsScripts.map(renderShortBlock)}
        </div>
    );
};

export default ShortsPanel;
