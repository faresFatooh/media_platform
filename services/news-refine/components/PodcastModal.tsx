
import React, { useState } from 'react';
import { BroadcastIcon } from './icons/BroadcastIcon';
import { SpotifyIcon } from './icons/SpotifyIcon';
import { ApplePodcastsIcon } from './icons/ApplePodcastsIcon';

interface PodcastModalProps {
  audioUrl: string;
  articleTitle: string;
  onClose: () => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

export const PodcastModal: React.FC<PodcastModalProps> = ({ audioUrl, articleTitle, onClose, showToast }) => {
    const [isPublishing, setIsPublishing] = useState<'spotify' | 'apple' | null>(null);

    const handleCopy = () => {
        navigator.clipboard.writeText(audioUrl);
        showToast('تم نسخ الرابط بنجاح!', 'success');
    };

    const handlePublish = (platform: 'spotify' | 'apple') => {
        setIsPublishing(platform);
        // Simulate API call
        setTimeout(() => {
            const platformName = platform === 'spotify' ? 'Spotify' : 'Apple Podcasts';
            showToast(`تم نشر البودكاست بنجاح على ${platformName}!`, 'success');
            setIsPublishing(null);
        }, 2000);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="podcast-modal-title">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b">
                    <h2 id="podcast-modal-title" className="text-xl font-bold text-slate-800 flex items-center">
                        <BroadcastIcon className="h-6 w-6 ml-3 text-sky-600" />
                        <span>نشر وربط البودكاست</span>
                    </h2>
                    <p className="text-sm text-slate-500 mt-1 truncate">"{articleTitle}"</p>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <h3 className="font-bold text-slate-700 mb-2">الرابط المباشر للملف الصوتي</h3>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                readOnly
                                value={audioUrl}
                                className="w-full p-2 border border-slate-300 rounded-md bg-slate-100 font-mono text-sm"
                            />
                            <button onClick={handleCopy} className="py-2 px-4 bg-slate-200 text-slate-700 font-semibold rounded-md hover:bg-slate-300 whitespace-nowrap">نسخ</button>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-slate-700 mb-2">النشر المباشر (تجريبي)</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <button
                                onClick={() => handlePublish('spotify')}
                                disabled={!!isPublishing}
                                className="flex items-center justify-center gap-2 w-full bg-green-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-slate-400"
                            >
                                {isPublishing === 'spotify' ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div> : <SpotifyIcon />}
                                <span>نشر على Spotify</span>
                            </button>
                            <button
                                onClick={() => handlePublish('apple')}
                                disabled={!!isPublishing}
                                className="flex items-center justify-center gap-2 w-full bg-purple-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-slate-400"
                            >
                                {isPublishing === 'apple' ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div> : <ApplePodcastsIcon />}
                                <span>نشر على Apple</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t rounded-b-2xl flex justify-between items-center">
                    <a
                        href={audioUrl}
                        download={`${articleTitle.replace(/\s/g, '_')}.mp3`}
                        className="py-2 px-4 text-sky-700 font-semibold bg-sky-100 border border-sky-200 rounded-md hover:bg-sky-200 transition-colors"
                    >
                        تحميل ملف MP3
                    </a>
                    <button type="button" onClick={onClose} className="py-2 px-4 text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors">
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    );
};
