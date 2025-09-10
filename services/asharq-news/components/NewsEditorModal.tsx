import React, { useState, useEffect, useRef } from 'react';
import type { NewsItem, Captions, Platform, Asset } from '../types';
import { PublishStatus } from '../types';
import { PLATFORMS, DEFAULT_HASHTAGS } from '../constants';
import { Spinner } from './ui/Spinner';
import { generateImage } from '../services/geminiService';

interface NewsEditorModalProps {
  newsItem: NewsItem;
  onClose: () => void;
  onUpdate: (updatedItem: NewsItem) => void;
}

// --- Mock Search Services ---
// These functions simulate API calls to external image archives.
// They are ready to be replaced with actual API integrations.

const searchAsharqArchive = async (query: string): Promise<Asset[]> => {
  console.log(`Searching Asharq Archive for: ${query}`);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (query.toLowerCase().includes('empty')) {
    return [];
  }
  // Generate 8 mock results
  return Array.from({ length: 8 }).map((_, i) => ({
    source: 'أرشيف الشرق',
    url: `https://picsum.photos/seed/${query.replace(/\s/g, '')}${i}/500/500`,
    license: 'حقوق النشر محفوظة',
    credit_line: 'مصور الشرق',
    query: query,
  }));
};

const searchCanva = async (query: string): Promise<Asset[]> => {
    console.log(`Searching Canva for: ${query}`);
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    if (query.toLowerCase().includes('fail')) {
        return [];
    }
    // Generate 8 mock results
    return Array.from({ length: 8 }).map((_, i) => ({
        source: 'Canva',
        url: `https://picsum.photos/seed/canva${query.replace(/\s/g, '')}${i}/500/500`,
        license: 'ترخيص Canva',
        credit_line: 'Canva',
        query: query,
    }));
};


type ImageHubView = 'preview' | 'edit';
type ImageHubTab = 'searchArchive' | 'searchCanva' | 'generate' | 'camera';

export const NewsEditorModal: React.FC<NewsEditorModalProps> = ({ newsItem, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<Platform>(newsItem.selectedPlatforms[0] || 'x');
  const [captions, setCaptions] = useState<Captions>(newsItem.captions);
  const [image, setImage] = useState<Asset>(newsItem.image);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleDateTime, setScheduleDateTime] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Image Hub State
  const [imageHubView, setImageHubView] = useState<ImageHubView>('preview');
  const [activeImageHubTab, setActiveImageHubTab] = useState<ImageHubTab>('searchArchive');
  const [searchQuery, setSearchQuery] = useState(newsItem.image.query);
  const [searchResults, setSearchResults] = useState<Asset[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [generationPrompt, setGenerationPrompt] = useState(image.query);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Camera State
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);


  useEffect(() => {
    // Ensure the active tab is always one of the selected platforms
    if (!newsItem.selectedPlatforms.includes(activeTab)) {
      setActiveTab(newsItem.selectedPlatforms[0] || 'x');
    }
  }, [newsItem.selectedPlatforms, activeTab]);

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
    const updatedItem: NewsItem = {
      ...newsItem,
      captions,
      image,
      status,
      ...extraData,
    };
    onUpdate(updatedItem);
    onClose();
  };

  const handlePublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      updateNewsItem(PublishStatus.POSTED, {
        permalinks: newsItem.selectedPlatforms.reduce((acc, p) => {
          acc[p] = `https://platform.fake/${p}/${Date.now()}`;
          return acc;
        }, {} as Partial<Record<Platform, string>>),
      });
      setIsPublishing(false);
    }, 2000);
  };
  
  const handleSaveDraft = () => {
     updateNewsItem(PublishStatus.DRAFT);
  };

  const handleConfirmSchedule = () => {
    if (!scheduleDateTime) {
        setError('الرجاء تحديد تاريخ ووقت للجدولة.');
        return;
    }
    if (new Date(scheduleDateTime) <= new Date()) {
        setError('يجب أن يكون وقت الجدولة في المستقبل.');
        return;
    }
    setError(null);
    updateNewsItem(PublishStatus.SCHEDULED, {
        publishTime: new Date(scheduleDateTime).toISOString(),
    });
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResults([]);
    setError(null);
    try {
        let results: Asset[] = [];
        if (activeImageHubTab === 'searchArchive') {
            results = await searchAsharqArchive(searchQuery);
        } else if (activeImageHubTab === 'searchCanva') {
            results = await searchCanva(searchQuery);
        }
        setSearchResults(results);
    } catch (err) {
        setError("فشل البحث عن الصور. الرجاء المحاولة مرة أخرى.");
    } finally {
        setIsSearching(false);
    }
  };

  const handleImageGeneration = async () => {
    setIsGenerating(true);
    setGeneratedImageUrl(null);
    try {
        const imageBase64 = await generateImage(generationPrompt);
        setGeneratedImageUrl(`data:image/jpeg;base64,${imageBase64}`);
    } catch (err) {
        setError("فشل توليد الصورة. الرجاء المحاولة مرة أخرى.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleSelectImage = (selectedAsset: Asset) => {
      setImage(selectedAsset);
      setImageHubView('preview');
  };
  
  const startCamera = async () => {
    try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setStream(mediaStream);
        if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
        }
    } catch (err) {
        console.error("Camera access denied:", err);
        setError("لم يتم السماح بالوصول إلى الكاميرا.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
  };

  useEffect(() => {
      if (activeImageHubTab === 'camera') {
          startCamera();
      } else {
          stopCamera();
      }
  }, [activeImageHubTab]);


  const handleTakePicture = () => {
    if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg');
            handleSelectImage({
                source: 'User Camera',
                url: dataUrl,
                license: 'User Content',
                credit_line: 'تم التقاطها بواسطة المستخدم',
                query: 'Camera Capture',
            });
        }
    }
  };

  const currentCaption = captions[activeTab] || '';
  const charLimit = PLATFORMS[activeTab]?.charLimit || 0;
  const charCount = currentCaption.replace(DEFAULT_HASHTAGS, '').trim().length;
  const isOverLimit = charLimit > 0 && charCount > charLimit;

  const renderImageHub = () => {
    if (imageHubView === 'preview') {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <div className="relative aspect-[1/1] w-full max-w-md bg-gray-900 rounded-lg overflow-hidden">
            <img src={image.url} alt="Visual Preview" className="w-full h-full object-cover" />
          </div>
          <div className="text-center mt-4 text-xs text-gray-500">
            <p>المصدر: {image.source} | {image.credit_line}</p>
            <p>وصف الصورة: "{image.query}"</p>
          </div>
          <button onClick={() => setImageHubView('edit')} className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-colors">
            تغيير الصورة
          </button>
        </div>
      );
    }

    // Edit View
    return (
      <div className="w-full h-full flex flex-col p-4">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">مركز الصور</h3>
            <button onClick={() => setImageHubView('preview')} className="px-4 py-1 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 text-sm">
                العودة للمعاينة
            </button>
        </div>
        <div className="border-b border-gray-600 mb-4">
          <nav className="-mb-px flex space-x-2 rtl:space-x-reverse overflow-x-auto text-sm">
            {(Object.entries({
              searchArchive: 'أرشيف الشرق',
              searchCanva: 'Canva',
              generate: 'توليد AI',
              camera: 'الكاميرا'
            }) as [ImageHubTab, string][]).map(([tabKey, tabName]) => (
              <button key={tabKey} onClick={() => setActiveImageHubTab(tabKey)} className={`whitespace-nowrap py-3 px-3 border-b-2 font-medium transition-colors ${activeImageHubTab === tabKey ? 'border-teal-500 text-teal-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}>
                {tabName}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-grow min-h-0">
          {(activeImageHubTab === 'searchArchive' || activeImageHubTab === 'searchCanva') && (
            <div className="h-full flex flex-col">
              <div className="flex gap-2 mb-4">
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSearch()} className="flex-grow bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-teal-500 focus:border-teal-500" placeholder="اكتب للبحث عن صورة..."/>
                <button onClick={handleSearch} disabled={isSearching} className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-md hover:bg-teal-500 disabled:bg-gray-500 flex items-center justify-center w-28">
                  {isSearching ? <Spinner /> : 'بحث'}
                </button>
              </div>
              <div className="flex-grow bg-gray-800/50 rounded-md overflow-y-auto p-2">
                {isSearching && <div className="flex justify-center items-center h-full"><Spinner /></div>}
                {!isSearching && searchResults.length === 0 && <div className="flex justify-center items-center h-full"><p className="text-gray-500">لا توجد نتائج. جرب كلمات بحث أخرى.</p></div>}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {searchResults.map(asset => (
                    <div key={asset.url} onClick={() => handleSelectImage(asset)} className="aspect-square bg-gray-700 rounded-md overflow-hidden cursor-pointer hover:ring-2 ring-teal-500">
                      <img src={asset.url} alt={asset.query} className="w-full h-full object-cover"/>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeImageHubTab === 'generate' && (
             <div className="h-full flex flex-col">
                <p className="text-sm text-gray-300 mb-2">أدخل وصفاً للصورة التي تريد توليدها:</p>
                <div className="flex gap-2 mb-4">
                    <input type="text" value={generationPrompt} onChange={e => setGenerationPrompt(e.target.value)} className="flex-grow bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-teal-500 focus:border-teal-500" />
                    <button onClick={handleImageGeneration} disabled={isGenerating} className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-md hover:bg-teal-500 disabled:bg-gray-500 flex items-center justify-center w-24">
                        {isGenerating ? <Spinner /> : 'توليد'}
                    </button>
                </div>
                <div className="flex-grow bg-gray-800/50 rounded-md flex items-center justify-center relative overflow-hidden">
                    {isGenerating && <Spinner />}
                    {!isGenerating && generatedImageUrl && ( <img src={generatedImageUrl} className="w-full h-full object-contain rounded-md"/> )}
                      {!isGenerating && !generatedImageUrl && ( <p className="text-gray-500">ستظهر الصورة المولّدة هنا</p> )}
                </div>
                  {generatedImageUrl && !isGenerating && (
                    <button onClick={() => handleSelectImage({source: 'AI Generated (Imagen 4)', url: generatedImageUrl, license: 'N/A', credit_line: 'صورة مولّدة بواسطة Google AI', query: generationPrompt})} className="mt-4 w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500">
                        استخدام هذه الصورة
                    </button>
                )}
            </div>
          )}

          {activeImageHubTab === 'camera' && (
            <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="w-full flex-grow bg-black rounded-md overflow-hidden relative">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-contain"></video>
                  <canvas ref={canvasRef} className="hidden"></canvas>
                </div>
                <button onClick={handleTakePicture} className="mt-4 w-full px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-500">
                    التقاط صورة
                </button>
            </div>
          )}
        </div>
      </div>
    );
  }


  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl h-[95vh] flex flex-col">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-white truncate pr-4">{newsItem.parsed.headline}</h2>
          <button onClick={onClose} className="text-gray-400 text-3xl hover:text-white">&times;</button>
        </div>
        
        <div className="flex-grow flex flex-col md:flex-row min-h-0">
          {/* Visual Preview & Image Hub */}
          <div className="w-full md:w-1/2 flex flex-col bg-gray-900/50">
            {renderImageHub()}
          </div>
          
          {/* Caption Editor */}
          <div className="w-full md:w-1/2 p-4 flex flex-col">
             <div className="border-b border-gray-700 mb-4">
                <nav className="-mb-px flex space-x-4 rtl:space-x-reverse overflow-x-auto" aria-label="Tabs">
                    {newsItem.selectedPlatforms.map(p => (
                        <button
                            key={p}
                            onClick={() => setActiveTab(p)}
                            className={`whitespace-nowrap flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors
                            ${activeTab === p 
                                ? 'border-teal-500 text-teal-400' 
                                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}
                        >
                            <span className="mr-2 rtl:ml-2">{PLATFORMS[p].icon}</span>
                            {PLATFORMS[p].name}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="flex-grow flex flex-col relative">
                <textarea
                    value={currentCaption}
                    onChange={(e) => handleCaptionChange(activeTab, e.target.value)}
                    className="w-full h-full bg-gray-900 border border-gray-600 rounded-lg p-4 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition resize-none text-lg leading-relaxed"
                />
                {charLimit > 0 && (
                    <div className={`absolute bottom-4 left-4 text-sm font-mono ${isOverLimit ? 'text-red-500' : 'text-gray-400'}`}>
                        {charCount} / {charLimit}
                    </div>
                )}
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-800/50 border-t border-gray-700 flex flex-col gap-3 shrink-0">
          {isScheduling && (
            <div className="flex flex-col sm:flex-row items-center gap-3 px-2">
              <label htmlFor="schedule-time" className="font-semibold text-gray-300">
                وقت النشر:
              </label>
              <input
                id="schedule-time"
                type="datetime-local"
                value={scheduleDateTime}
                onChange={(e) => {
                  setScheduleDateTime(e.target.value);
                  setError(null);
                }}
                className="w-full sm:w-auto bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-teal-500 focus:border-teal-500"
                min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
              />
            </div>
          )}
          {error && (
              <div className="text-red-400 text-sm text-center bg-red-900/50 p-2 rounded-md mx-2">{error}</div>
          )}
          <div className="flex justify-end items-center space-x-3 rtl:space-x-reverse">
            <button
                onClick={handleSaveDraft}
                className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors"
            >
                حفظ كمسودة
            </button>
            <button
                onClick={() => {
                    setIsScheduling(!isScheduling);
                    setError(null);
                    if (!isScheduling) {
                        const defaultDate = new Date(Date.now() + 3600 * 1000);
                        const offset = defaultDate.getTimezoneOffset();
                        const adjustedDate = new Date(defaultDate.getTime() - (offset * 60 * 1000));
                        setScheduleDateTime(adjustedDate.toISOString().slice(0,16));
                    }
                }}
                className={`px-6 py-2 font-semibold rounded-lg transition-colors ${
                    isScheduling 
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white"
                }`}
            >
                {isScheduling ? "إلغاء" : "جدولة"}
            </button>
            <button
              onClick={isScheduling ? handleConfirmSchedule : handlePublish}
              disabled={isPublishing}
              className="px-8 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {isPublishing ? 'جاري النشر...' : (isScheduling ? "تأكيد الجدولة" : `نشر على ${newsItem.selectedPlatforms.length} منصات`)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};