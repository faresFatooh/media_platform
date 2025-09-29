
import React from 'react';
import type { Scene, GeneratedMedia } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { PhotoIcon, VideoCameraIcon } from './icons';

interface MediaGeneratorProps {
    scenes: Scene[];
    generatedMedia: GeneratedMedia;
    onGenerateMedia: (prompt: string, type: 'image' | 'video') => void;
    isLoading: boolean;
    progressMessage: string;
}

const MediaGenerator: React.FC<MediaGeneratorProps> = ({ scenes, generatedMedia, onGenerateMedia, isLoading, progressMessage }) => {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-white mb-2">توليد الصور والفيديو للمشاهد</h3>
                <p className="text-sm text-gray-400">اختر مشهداً وقم بتوليد صورة أو فيديو قصير لاستخدامه في المونتاج.</p>
            </div>

            {isLoading && (
                 <div className="bg-gray-700/50 p-4 rounded-lg flex items-center justify-center flex-col text-center">
                    <LoadingSpinner />
                    <p className="mt-2 text-sm text-cyan-300 animate-pulse">{progressMessage || '...جارٍ توليد الوسائط'}</p>
                </div>
            )}
            
            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                {scenes.map((scene) => (
                    <div key={scene.sceneNumber} className="bg-gray-700/50 p-3 rounded-lg">
                        <p className="font-semibold text-sm mb-2">المشهد #{scene.sceneNumber}: <span className="text-gray-300 font-normal">{scene.visualSuggestion}</span></p>
                        <div className="flex gap-2">
                            <button onClick={() => onGenerateMedia(scene.visualSuggestion, 'image')} disabled={isLoading} className="flex-1 text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded-md flex items-center justify-center gap-1 transition disabled:opacity-50">
                                <PhotoIcon className="w-4 h-4" />
                                توليد صورة
                            </button>
                             <button onClick={() => onGenerateMedia(scene.visualSuggestion, 'video')} disabled={isLoading} className="flex-1 text-xs bg-purple-600 hover:bg-purple-500 text-white px-2 py-1 rounded-md flex items-center justify-center gap-1 transition disabled:opacity-50">
                                <VideoCameraIcon className="w-4 h-4" />
                                توليد فيديو
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="border-t border-gray-700 pt-4">
                 <h4 className="font-semibold text-white mb-2">الوسائط المولدة</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[40vh] overflow-y-auto">
                    {generatedMedia.images.length === 0 && generatedMedia.videos.length === 0 && (
                        <p className="text-sm text-gray-500 col-span-2">لم يتم توليد أي وسائط بعد.</p>
                    )}
                    {generatedMedia.images.map((img, index) => (
                        <div key={`img-${index}`} className="group relative">
                            <img src={img.url} alt={img.prompt} className="rounded-lg w-full h-auto object-cover" />
                             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-xs overflow-hidden text-ellipsis">{img.prompt}</div>
                        </div>
                    ))}
                     {generatedMedia.videos.map((vid, index) => (
                        <div key={`vid-${index}`} className="group relative">
                             <video src={vid.url} controls className="rounded-lg w-full h-auto object-cover" />
                             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-xs overflow-hidden text-ellipsis">{vid.prompt}</div>
                        </div>
                    ))}
                 </div>
            </div>

        </div>
    );
};

export default MediaGenerator;
