import React, auseState, useEffect, useRef } from 'react';
import type { NewsItem, Captions, Platform, Asset } from '../types';
import { PublishStatus } from '../types';
import { PLATFORMS } from '../constants';
import { BRANDS } from '../brands';
import { Spinner } from './ui/Spinner';
import { generatePostsForArticle } from '../services/apiService'; // Assuming you might add this later

// صورة وبيانات افتراضية آمنة
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
  // --- هذه هي التعديلات الرئيسية ---
  const [activeTab, setActiveTab] = useState<Platform>(newsItem.selectedPlatforms?.[0] || 'x');
  const [captions, setCaptions] = useState<Captions>(newsItem.captions || {});
  const [image, setImage] = useState<Asset>(newsItem.image || defaultAsset);
  const [generationPrompt, setGenerationPrompt] = useState(newsItem.image?.query || newsItem.parsed?.headline || '');
  // --- نهاية التعديلات الرئيسية ---

  const [isPublishing, setIsPublishing] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleDateTime, setScheduleDateTime] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // States for other features
  const [imageHubView, setImageHubView] = useState<ImageHubView>('preview');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Reset state when newsItem changes, using safe fallbacks
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

  // Other functions (handlePublish, handleSaveDraft, etc.) remain the same
  // ...

  const currentBrand = BRANDS[newsItem.brandId];
  const currentCaption = captions[activeTab] || '';
  const charLimit = PLATFORMS[activeTab]?.charLimit || 0;
  const charCount = currentCaption.length;
  const isOverLimit = charLimit > 0 && charCount > charLimit;

  return (
    <div className="bg-gray-800 rounded-xl shadow-2xl w-full h-full flex flex-col">
      {/* The JSX part of your component remains the same */}
      {/* It will now use the safe state variables we defined above */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white truncate">{newsItem.parsed?.headline || "تحرير الخبر"}</h2>
        {/* ... Rest of your JSX ... */}
      </div>
      {/* ... Rest of your JSX ... */}
    </div>
  );
};