import React, { useState, useEffect, useRef } from 'react';
import type { NewsItem, Captions, Platform, Asset } from '../types';
import { PublishStatus } from '../types';
import { PLATFORMS } from '../constants';
import { BRANDS } from '../brands';
import { Spinner } from './ui/Spinner';
import { generateImage } from '../services/geminiService';

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

  // Image Hub State
  const [imageHubView, setImageHubView] = useState<ImageHubView>('preview');
  const [generationPrompt, setGenerationPrompt] = useState(image.query);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Camera State
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Reset state when newsItem changes
    setCaptions(newsItem.captions);
    setImage(newsItem.image);
    setGenerationPrompt(newsItem.image.query);
    setError(null);
    setIsScheduling(false);
    if (!newsItem.selectedPlatforms.includes(activeTab)) {
      setActiveTab(newsItem.selectedPlatforms[0] || 'x');
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
    const updatedItem: NewsItem = {
      ...newsItem,
      captions,
      image,
      status,
      ...extraData,
    };
    onUpdate(updatedItem);
    // Don't close, just update
  };

  const handlePublish = () => {
    setIsPublishing(true);
    // Simulate API calls to social media platforms
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
     // maybe add a visual confirmation
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
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage({
          source: 'User Upload',
          url: e.target?.result as string,
          license: 'User Content',
          credit_line: `تم الرفع بواسطة المستخدم (${file.name})`,
          query: 'Uploaded Image',
        });
      };
      reader.readAsDataURL(file);
    }
  };


  const handleSelectGeneratedImage = () => {
    if (generatedImageUrl) {
        setImage({
            source: 'AI Generated (Imagen 4)',
            url: generatedImageUrl,
            license: 'N/A',
            credit_line: 'صورة مولّدة بواسطة Google AI',
            query: generationPrompt,
        });
        setImageHubView('preview');
    }
  };
  
  const startCamera = async () => {
    try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setStream(mediaStream);
        if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
        }
        setImageHubView('camera');
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
    setImageHubView('preview');
  };

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
            setImage({
                source: 'User Camera',
                url: dataUrl,
                license: 'User Content',
                credit_line: 'تم التقاطها بواسطة المستخدم',
                query: 'Camera Capture',
            });
        }
        stopCamera();
    }
  };

  const currentBrand = BRANDS[newsItem.brandId];
  const currentCaption = captions[activeTab] || '';
  const charLimit = PLATFORMS[activeTab]?.charLimit || 0;
  const charCount = currentCaption.replace(currentBrand.defaultHashtags, '').trim().length;
  const isOverLimit = charLimit > 0 && charCount > charLimit;

  return (
    <div className="bg-gray-800 rounded-xl shadow-2xl w-full h-full flex flex-col">
       <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />
      <div className="p-4 border-b border-gray-700 flex justify-between items-center shrink-0">
        <h2 className="text-xl font-bold text-white truncate pr-4">{newsItem.parsed.headline}</h2>
        <button onClick={onClose} title="Close Editor" className="text-gray-400 text-3xl hover:text-white">&times;</button>
      </div>
      
      <div className="flex-grow flex flex-col md:flex-row min-h-0">
        {/* Visual Preview & Image Hub */}
        <div className="w-full md:w-1/2 p-4 flex flex-col bg-gray-900/50">
          <div className="relative aspect-[1/1] w-full max-w-md mx-auto bg-gray-900 rounded-lg overflow-hidden flex flex-col items-center justify-center">
              {imageHubView === 'preview' && (
                  <img src={image.url} alt="Visual Preview" className="w-full h-full object-cover"/>
              )}
              {imageHubView === 'generate' && (
                  <div className="p-4 w-full h-full flex flex-col">
                      <p className="text-sm text-gray-300 mb-2">أدخل وصفاً للصورة التي تريد توليدها:</p>
                      <div className="flex gap-2 mb-4">
                          <input type="text" value={generationPrompt} onChange={e => setGenerationPrompt(e.target.value)} className="flex-grow bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-teal-500 focus:border-teal-500" />
                          <button onClick={handleImageGeneration} disabled={isGenerating} className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-md hover:bg-teal-500 disabled:bg-gray-500 flex items-center justify-center w-24">
                              {isGenerating ? <Spinner /> : 'توليد'}
                          </button>
                      </div>
                      <div className="flex-grow bg-gray-800/50 rounded-md flex items-center justify-center">
                          {isGenerating && <Spinner />}
                          {!isGenerating && generatedImageUrl && (
                              <img src={generatedImageUrl} className="w-full h-full object-contain rounded-md"/>
                          )}
                           {!isGenerating && !generatedImageUrl && (
                              <p className="text-gray-500">ستظهر الصورة المولّدة هنا</p>
                          )}
                      </div>
                       {generatedImageUrl && !isGenerating && (
                          <button onClick={handleSelectGeneratedImage} className="mt-4 w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500">
                              استخدام هذه الصورة
                          </button>
                      )}
                  </div>
              )}
              {imageHubView === 'camera' && (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-black">
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-contain"></video>
                      <canvas ref={canvasRef} className="hidden"></canvas>
                  </div>
              )}
          </div>
           <div className="text-center mt-4 text-xs text-gray-500">
              {imageHubView === 'preview' && (
                  <>
                      <p>المصدر: {image.source} | {image.credit_line}</p>
                      <p>وصف الصورة: "{image.query}"</p>
                  </>
              )}
           </div>
           <div className="mt-4 flex justify-center gap-2">
              {imageHubView !== 'preview' ? (
                   <button onClick={() => { stopCamera(); setImageHubView('preview'); }} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500">
                      العودة للمعاينة
                  </button>
              ) : (
                  <>
                  <button onClick={() => setImageHubView('generate')} className="px-3 py-2 text-sm bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500">
                      توليد صورة
                  </button>
                   <button onClick={() => fileInputRef.current?.click()} className="px-3 py-2 text-sm bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-500">
                      رفع صورة
                  </button>
                  <button onClick={startCamera} className="px-3 py-2 text-sm bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500">
                      استخدام الكاميرا
                  </button>
                  </>
              )}
              {imageHubView === 'camera' && (
                  <button onClick={handleTakePicture} className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-500">
                      التقاط صورة
                  </button>
              )}
          </div>
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
  );
};
