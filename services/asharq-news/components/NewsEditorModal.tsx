import React, { useState, useEffect, useRef } from 'react';
import type { NewsItem, Captions, Platform, Asset } from '../types';
import { PublishStatus } from '../types';
import { PLATFORMS } from '../constants';
import { BRANDS } from '../brands';
import { Spinner } from './ui/Spinner';
// import { generatePostsForArticle } from '../services/apiService'; // We can add this back when needed

// A safe default asset to prevent crashes
const defaultAsset: Asset = {
    source: 'Placeholder',
    url: 'https://via.placeholder.com/512',
    license: 'N/A',
    credit_line: '',
    query: ''
};

interface NewsEditorModalProps {
  newsItem: NewsItem;
  onClose: () => void;
  onUpdate: (updatedItem: NewsItem) => void;
}

type ImageHubView = 'preview' | 'generate' | 'camera';

export const NewsEditorModal: React.FC<NewsEditorModalProps> = ({ newsItem, onClose, onUpdate }) => {
  // Use optional chaining and fallbacks to safely initialize state
  const [activeTab, setActiveTab] = useState<Platform>(newsItem.selectedPlatforms?.[0] || 'x');
  const [captions, setCaptions] = useState<Captions>(newsItem.captions || {});
  const [image, setImage] = useState<Asset>(newsItem.image || defaultAsset);
  const [generationPrompt, setGenerationPrompt] = useState(newsItem.image?.query || newsItem.parsed?.headline || '');

  // Other state variables
  const [isPublishing, setIsPublishing] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleDateTime, setScheduleDateTime] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [imageHubView, setImageHubView] = useState<ImageHubView>('preview');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Reset state when newsItem changes, using the same safe fallbacks
    setCaptions(newsItem.captions || {});
    setImage(newsItem.image || defaultAsset);
    setGenerationPrompt(newsItem.image?.query || newsItem.parsed?.headline || '');
    setError(null);
    setIsScheduling(false);
    if (!newsItem.selectedPlatforms?.includes(activeTab)) {
      setActiveTab(newsItem.selectedPlatforms?.[0] || 'x');
    }
  }, [newsItem]);

  // Cleanup camera stream
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleCaptionChange = (platform: Platform, value: string) => {
    setCaptions(prev => ({ ...prev, [platform]: value }));
  };

  const updateNewsItem = (status: PublishStatus, extraData: Partial<NewsItem> = {}) => {
    const updatedItem: NewsItem = { ...newsItem, captions, image, status, ...extraData };
    onUpdate(updatedItem);
  };

  // --- Placeholder functions for actions ---
  const handlePublish = () => { /* Logic to be implemented */ };
  const handleSaveDraft = () => { onUpdate({ ...newsItem, captions, image, status: PublishStatus.DRAFT }); };
  const handleConfirmSchedule = () => { /* Logic to be implemented */ };
  const handleImageGeneration = async () => { setError("Image generation from backend is not implemented yet."); };
  const handleImageUpload = () => { /* Logic to be implemented */ };
  const handleSelectGeneratedImage = () => { /* Logic to be implemented */ };
  const startCamera = () => { /* Logic to be implemented */ };
  const stopCamera = () => { /* Logic to be implemented */ };
  const handleTakePicture = () => { /* Logic to be implemented */ };
  // ---

  const currentBrand = BRANDS[newsItem.brandId];
  const currentCaption = captions[activeTab] || '';
  const charLimit = PLATFORMS[activeTab]?.charLimit || 0;
  const charCount = currentCaption.length;
  const isOverLimit = charLimit > 0 && charCount > charLimit;

  return (
    <div className="bg-gray-800 rounded-xl shadow-2xl w-full h-full flex flex-col">
      <div className="p-4 border-b border-gray-700 flex justify-between items-center shrink-0">
        <h2 className="text-xl font-bold text-white truncate pr-4">{newsItem.parsed?.headline || "تحرير الخبر"}</h2>
        <button onClick={onClose} title="Close Editor" className="text-gray-400 text-3xl hover:text-white">&times;</button>
      </div>
      
      <div className="flex-grow flex flex-col md:flex-row min-h-0">
        <div className="w-full md:w-1/2 p-4 flex flex-col bg-gray-900/50">
          {/* Your Image Hub UI JSX here */}
          <div className="relative aspect-[1/1] w-full max-w-md mx-auto bg-gray-900 rounded-lg">
            <img src={image.url} alt="Visual Preview" className="w-full h-full object-cover"/>
          </div>
        </div>
        
        <div className="w-full md:w-1/2 p-4 flex flex-col">
           <div className="border-b border-gray-700 mb-4">
              <nav className="-mb-px flex space-x-4 rtl:space-x-reverse overflow-x-auto" aria-label="Tabs">
                  {(newsItem.selectedPlatforms || []).map(p => (
                      <button
                        key={p}
                        onClick={() => setActiveTab(p)}
                        className={`whitespace-nowrap flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors
                        ${activeTab === p 
                            ? 'border-teal-500 text-teal-400' 
                            : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}
                      >
                        {PLATFORMS[p]?.name || p}
                      </button>
                  ))}
              </nav>
           </div>
           <div className="flex-grow flex flex-col relative">
              <textarea
                value={currentCaption}
                onChange={(e) => handleCaptionChange(activeTab, e.target.value)}
                className="w-full h-full bg-gray-900 border border-gray-600 rounded-lg p-4 resize-none"
              />
              {charLimit > 0 && (
                <div className={`absolute bottom-4 left-4 text-sm font-mono ${isOverLimit ? 'text-red-500' : 'text-gray-400'}`}>
                  {charCount} / {charLimit}
                </div>
              )}
           </div>
        </div>
      </div>

      <div className="p-4 bg-gray-800/50 border-t border-gray-700 flex justify-end items-center gap-4 shrink-0">
        {/* Your footer buttons JSX here */}
        <button onClick={handleSaveDraft} className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500">
            حفظ كمسودة
        </button>
      </div>
    </div>
  );
};