import React, { useState, useEffect, useRef } from 'react';
import type { NewsItem, Captions, Platform, Asset } from '../types';
import { PublishStatus } from '../types';
import { PLATFORMS } from '../constants';
import { BRANDS } from '../brands';
import { Spinner } from './ui/Spinner';
// استيراد الدوال من المراسل الجديد والآمن
import { generatePostsForArticle } from '../services/apiService';

interface NewsEditorModalProps {
  newsItem: NewsItem;
  onClose: () => void;
  onUpdate: (updatedItem: NewsItem) => void;
}

type ImageHubView = 'preview' | 'generate' | 'camera';

export const NewsEditorModal: React.FC<NewsEditorModalProps> = ({ newsItem, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<Platform>(newsItem.selectedPlatforms[0] || 'x');
  const [captions, setCaptions] = useState<Captions>(newsItem.captions);
  const [image, setImage] = useState<Asset>(newsItem.image);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleDateTime, setScheduleDateTime] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // States for other features like ImageHub, Camera, etc.
  const [imageHubView, setImageHubView] = useState<ImageHubView>('preview');
  const [generationPrompt, setGenerationPrompt] = useState(image.query);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCaptions(newsItem.captions);
    setImage(newsItem.image);
    setGenerationPrompt(newsItem.image.query);
    setError(null);
    if (!newsItem.selectedPlatforms.includes(activeTab)) {
      setActiveTab(newsItem.selectedPlatforms[0] || 'x');
    }
  }, [newsItem]);

  const handleCaptionChange = (platform: Platform, value: string) => {
    setCaptions(prev => ({ ...prev, [platform]: value }));
  };

  const updateNewsItem = (status: PublishStatus, extraData: Partial<NewsItem> = {}) => {
    const updatedItem: NewsItem = { ...newsItem, captions, image, status, ...extraData };
    onUpdate(updatedItem);
  };

  // --- دالة جديدة لإعادة توليد المحتوى من الخادم ---
  const handleRegenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const selectedPlatforms = Object.keys(captions) as Platform[];
      const newPostsData = await generatePostsForArticle(newsItem.id, selectedPlatforms);
      
      const newCaptions = newPostsData.reduce((acc, post) => {
        const platformKey = post.platform.toLowerCase() as Platform;
        acc[platformKey] = post.content;
        return acc;
      }, {} as Captions);
      
      setCaptions(newCaptions);
      onUpdate({ ...newsItem, captions: newCaptions });

    } catch (error) {
      console.error("Failed to regenerate captions:", error);
      setError("حدث خطأ أثناء إعادة توليد النصوص.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Placeholder functions for other actions
  const handlePublish = () => { /* Logic to be implemented */ };
  const handleSaveDraft = () => { onUpdate({ ...newsItem, captions, image, status: PublishStatus.DRAFT }); };
  const handleConfirmSchedule = () => { /* Logic to be implemented */ };
  const handleImageGeneration = async () => { setError("Image generation from backend is not implemented yet."); };

  const currentBrand = BRANDS[newsItem.brandId];
  const currentCaption = captions[activeTab] || '';
  const charLimit = PLATFORMS[activeTab]?.charLimit || 0;
  const charCount = currentCaption.length;
  const isOverLimit = charLimit > 0 && charCount > charLimit;

  return (
    <div className="bg-gray-800 rounded-xl shadow-2xl w-full h-full flex flex-col">
      <div className="p-4 border-b border-gray-700 flex justify-between items-center shrink-0">
        <h2 className="text-xl font-bold text-white truncate pr-4">{newsItem.parsed.headline}</h2>
        <button onClick={onClose} title="Close Editor" className="text-gray-400 text-3xl hover:text-white">&times;</button>
      </div>
      
      <div className="flex-grow flex flex-col md:flex-row min-h-0">
        <div className="w-full md:w-1/2 p-4 flex flex-col bg-gray-900/50">
          {/* Image Hub UI remains here */}
        </div>
        
        <div className="w-full md:w-1/2 p-4 flex flex-col">
           <div className="border-b border-gray-700 mb-4">
              <nav className="-mb-px flex space-x-4 rtl:space-x-reverse overflow-x-auto" aria-label="Tabs">
                  {/* Tabs UI remains here */}
              </nav>
           </div>
           <div className="flex-grow flex flex-col relative">
              <textarea
                value={currentCaption}
                onChange={(e) => handleCaptionChange(activeTab, e.target.value)}
                className="w-full h-full bg-gray-900 border border-gray-600 rounded-lg p-4"
              />
              {/* Character limit UI remains here */}
           </div>
        </div>
      </div>

      <div className="p-4 bg-gray-800/50 border-t border-gray-700 flex justify-end items-center gap-4 shrink-0">
        <button onClick={handleRegenerate} disabled={isGenerating} className="px-4 py-2 bg-gray-600 rounded-lg">
          {isGenerating ? <Spinner/> : 'إعادة توليد النصوص'}
        </button>
        {/* Other footer buttons remain here */}
      </div>
    </div>
  );
};