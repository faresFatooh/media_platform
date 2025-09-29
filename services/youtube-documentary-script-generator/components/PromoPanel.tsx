
import React, { useState } from 'react';
import type { PromoContent, SocialMediaContent } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { ClipboardDocumentIcon, MegaphoneIcon } from './icons';

interface PromoPanelProps {
    promoContent: PromoContent | null;
    onGeneratePromo: () => void;
    isLoadingPromo: boolean;
}

const PromoPanel: React.FC<PromoPanelProps> = ({ promoContent, onGeneratePromo, isLoadingPromo }) => {
    const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedStates({ [id]: true });
        setTimeout(() => setCopiedStates(prev => ({ ...prev, [id]: false })), 2000);
    };

    if (!promoContent && !isLoadingPromo) {
        return (
            <div className="text-center">
                 <button
                    onClick={onGeneratePromo}
                    disabled={isLoadingPromo}
                    className="w-full max-w-sm flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                >
                    {isLoadingPromo ? <LoadingSpinner /> : <MegaphoneIcon className="w-5 h-5" />}
                    <span>توليد المحتوى الترويجي</span>
                </button>
                <p className="text-sm text-gray-400 mt-2">انقر هنا لإنشاء عناوين ووصف ومنشورات لمنصات التواصل الاجتماعي.</p>
            </div>
        );
    }
    
    if (isLoadingPromo) {
         return (
            <div className="flex flex-col items-center justify-center min-h-[200px]">
                <LoadingSpinner />
                <p className="mt-4 text-gray-400">...جارٍ إنشاء المحتوى الترويجي</p>
            </div>
        );
    }

    if (!promoContent) return null;

    const renderContentBlock = (id: string, title: string, content: SocialMediaContent) => (
        <div className="bg-gray-700/50 p-4 rounded-lg">
            <h4 className="font-semibold text-cyan-400 mb-2">{title}</h4>
            <div className="space-y-2 text-sm">
                {content.title && <p><strong>العنوان:</strong> {content.title}</p>}
                {content.caption && <p><strong>النص:</strong> {content.caption}</p>}
                {content.description && <p><strong>الوصف:</strong> {content.description}</p>}
                {content.tags && <p className="text-gray-400"><strong>الكلمات المفتاحية:</strong> {content.tags}</p>}
                {content.hashtags && <p className="text-indigo-400"><strong>الهاشتاجات:</strong> {content.hashtags}</p>}
            </div>
            <button 
                onClick={() => copyToClipboard(
                    `${title}\n\n${content.title ? `العنوان: ${content.title}\n` : ''}${content.caption ? `النص: ${content.caption}\n` : ''}${content.description ? `الوصف: ${content.description}\n` : ''}${content.tags ? `الكلمات المفتاحية: ${content.tags}\n` : ''}${content.hashtags ? `الهاشتاجات: ${content.hashtags}` : ''}`,
                    id
                )}
                className="mt-3 text-xs bg-gray-600 hover:bg-gray-500 text-gray-200 px-2 py-1 rounded-md flex items-center gap-1 transition"
            >
                <ClipboardDocumentIcon className="w-4 h-4" />
                {copiedStates[id] ? 'تم النسخ!' : 'نسخ'}
            </button>
        </div>
    );
    

    return (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {renderContentBlock('youtube', 'YouTube', promoContent.youtube)}
            {renderContentBlock('instagramPost', 'منشور انستغرام', promoContent.instagramPost)}
            {renderContentBlock('instagramStory', 'ستوري انستغرام', promoContent.instagramStory)}
            {renderContentBlock('facebookPost', 'منشور فيسبوك', promoContent.facebookPost)}
            {renderContentBlock('twitterPost', 'تغريدة X (تويتر)', promoContent.twitterPost)}
        </div>
    );
};

export default PromoPanel;
