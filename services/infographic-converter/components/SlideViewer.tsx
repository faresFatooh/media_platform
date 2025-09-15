
import React, { createRef, useState, useEffect } from 'react';
import { Slide as SlideComponent } from './Slide';
import { IconPicker } from './IconPicker';
import { Icon } from './Icon';
import type { Slide, TextStyle, SlideContentItem } from '../types';
import type { Orientation } from '../App';

interface SlideViewerProps {
    slides: Slide[];
    onSlideUpdate: (index: number, updatedSlide: Slide) => void;
    logoUrl: string | null;
    onLogoUpload: (url: string) => void;
    backgroundOpacity: number;
    onBackgroundOpacityChange: (opacity: number) => void;
    themeColor: string;
    onThemeChange: (theme: 'asharq' | 'najah') => void;
    orientation: Orientation;
    onOrientationChange: (orientation: Orientation) => void;
    onAddSlide: (index: number) => void;
    onDeleteSlide: (index: number) => void;
    onMusicUpload: (file: File | null) => void;
    backgroundMusicUrl: string | null;
    musicFileName: string | null;
    logoSize: number;
    onLogoSizeChange: (size: number) => void;
}

type TransitionType = 'fade' | 'slide-up' | 'slide-left' | 'slide-right';

const FONT_OPTIONS = ['Cairo', 'Noto Kufi Arabic', 'Tajawal'];

// Credentials for the PDF generation service (HCTI)
const HCTI_API_ID = '00d5c03b-4bf4-44c6-ae99-31d47e4608aa';
const HCTI_API_KEY = 'f4da4c76-a682-4cee-9dad-a9bfdd853a29';
const HCTI_API_BASE = 'https://hcti.io/v1';

declare const JSZip: any;
declare const html2canvas: any;

export const SlideViewer: React.FC<SlideViewerProps> = ({ slides, onSlideUpdate, logoUrl, onLogoUpload, backgroundOpacity, onBackgroundOpacityChange, themeColor, onThemeChange, orientation, onOrientationChange, onAddSlide, onDeleteSlide, onMusicUpload, backgroundMusicUrl, musicFileName, logoSize, onLogoSizeChange }) => {
    const slideRefs = React.useRef<React.RefObject<HTMLDivElement>[]>([]);
    slideRefs.current = slides.map((_, i) => slideRefs.current[i] ?? createRef<HTMLDivElement>());
    
    const fileInputRefs = React.useRef<React.RefObject<HTMLInputElement>[]>([]);
    fileInputRefs.current = slides.map((_, i) => fileInputRefs.current[i] ?? createRef<HTMLInputElement>());

    const logoInputRef = React.useRef<HTMLInputElement>(null);
    const musicInputRef = React.useRef<HTMLInputElement>(null);

    const [isExporting, setIsExporting] = useState(false);
    const [isExportingPng, setIsExportingPng] = useState(false);
    const [isExportingVideo, setIsExportingVideo] = useState(false);
    const [videoExportProgress, setVideoExportProgress] = useState(0);
    const [videoExportMessage, setVideoExportMessage] = useState('');
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [transitionType, setTransitionType] = useState<TransitionType>('fade');
    const [pickerOpenFor, setPickerOpenFor] = useState<{ slideIndex: number; itemIndex: number } | null>(null);

    // Kept for PDF export functionality
    const getFullHtml = (slideHtml: string, rootFontSize: number) => {
      return `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
          <meta charset="utf-8" />
          <script src="https://cdn.tailwindcss.com"></script>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&family=Noto+Kufi+Arabic:wght@400;700&family=Tajawal:wght@400;700&display=swap" rel="stylesheet">
          <style>
            html { font-size: ${rootFontSize}px; }
            body { margin: 0; font-family: 'Cairo', sans-serif; }
          </style>
        </head>
        <body>
          ${slideHtml}
        </body>
        </html>
      `;
    };
    
    // Kept for PDF export functionality
    const calculateExportRootFontSize = (previewElement: HTMLDivElement): number => {
        if (!previewElement) return 16 * (1920 / 800); 
        const previewWidth = previewElement.getBoundingClientRect().width;
        if (previewWidth === 0) return 16 * 2.4; 
        const BROWSER_DEFAULT_ROOT_FONT_SIZE = 16;
        let exportWidth = 1920;
        if (orientation === 'vertical' || orientation === 'square') exportWidth = 1080;
        return BROWSER_DEFAULT_ROOT_FONT_SIZE * (exportWidth / previewWidth);
    };

    const triggerDownload = (url: string, filename: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const exportAsPng = async (index: number) => {
        const element = slideRefs.current[index].current;
        if (!element) return;
        const originalButton = document.getElementById(`export-png-${index}`);
        if(originalButton) originalButton.textContent = 'جاري...';
        try {
             if (typeof html2canvas === 'undefined') {
                throw new Error('مكتبة تصوير الشاشة غير متاحة. يرجى المحاولة مرة أخرى.');
            }

            let exportWidth = 1920;
            if (orientation === 'vertical' || orientation === 'square') {
                exportWidth = 1080;
            }
            
            const scale = exportWidth / element.offsetWidth;

            const canvas = await html2canvas(element, { 
                scale: scale, 
                useCORS: true, 
                allowTaint: true,
                backgroundColor: null
            });
            const dataUrl = canvas.toDataURL('image/png');
            triggerDownload(dataUrl, `slide-${index + 1}.png`);
        } catch (error) {
            alert(`حدث خطأ أثناء تصدير الصورة: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
             if(originalButton) originalButton.textContent = 'تصدير PNG';
        }
    };
    
    const exportAsPdf = async () => {
        setIsExporting(true);
        try {
            const firstElement = slideRefs.current[0].current;
            if (!firstElement) throw new Error("Slide element not found.");
            const rootFontSize = calculateExportRootFontSize(firstElement);
            const slideHtmls = slideRefs.current.map(ref => ref.current?.outerHTML).filter(Boolean).join('<div style="page-break-before: always;"></div>');
            if (!slideHtmls) throw new Error("No slides available.");
            const fullHtml = getFullHtml(slideHtmls, rootFontSize);
            let pdfOptions: any = { printBackground: true, margin: { top: '0', right: '0', bottom: '0', left: '0' } };
            if (orientation === 'horizontal') { pdfOptions.width = '1920px'; pdfOptions.height = '1080px'; }
            else if (orientation === 'vertical') { pdfOptions.width = '1080px'; pdfOptions.height = '1920px'; }
            else { pdfOptions.width = '1080px'; pdfOptions.height = '1080px'; }
            const response = await fetch(`${HCTI_API_BASE}/pdf`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic ' + btoa(`${HCTI_API_ID}:${HCTI_API_KEY}`) },
                body: JSON.stringify({ html: fullHtml, pdf_options: pdfOptions, ms_delay: 1500 })
            });
            if (!response.ok) throw new Error((await response.json()).message || 'فشل في إنشاء PDF');
            const data = await response.json();
            triggerDownload(data.url, 'presentation.pdf');
        } catch (error) {
             alert(`حدث خطأ غير متوقع أثناء تصدير PDF: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsExporting(false);
        }
    };

    const exportAllAsPng = async () => {
        if (typeof JSZip === 'undefined' || typeof html2canvas === 'undefined') {
            alert('مكتبة الضغط أو التصوير غير متاحة بعد. يرجى الانتظار والمحاولة مرة أخرى.');
            return;
        }
        setIsExportingPng(true);
        try {
            const zip = new JSZip();

            let exportWidth = 1920;
            if (orientation === 'vertical' || orientation === 'square') {
                exportWidth = 1080;
            }

            for (let i = 0; i < slides.length; i++) {
                const element = slideRefs.current[i].current;
                if (!element) continue;

                const scale = exportWidth / element.offsetWidth;

                const canvas = await html2canvas(element, { 
                    scale: scale, 
                    useCORS: true, 
                    allowTaint: true,
                    backgroundColor: null
                });
                const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                if (blob) {
                    zip.file(`slide-${i + 1}.png`, blob);
                }
            }
            const content = await zip.generateAsync({ type: 'blob' });
            triggerDownload(URL.createObjectURL(content), 'slides.zip');
        } catch (error) {
            alert(`حدث خطأ أثناء تصدير كل الصور: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsExportingPng(false);
        }
    };
    
    const handleExportVideo = async () => {
        setShowVideoModal(false);
        if (typeof html2canvas === 'undefined') {
            alert('مكتبة تصوير الشاشة غير متاحة. يرجى المحاولة مرة أخرى.');
            return;
        }

        setIsExportingVideo(true);
        setVideoExportMessage('بدء تصدير الفيديو...');
        setVideoExportProgress(0);

        let exportWidth = 1080, exportHeight = 1080;
        if (orientation === 'horizontal') { exportWidth = 1920; exportHeight = 1080; }
        if (orientation === 'vertical') { exportWidth = 1080; exportHeight = 1920; }

        const imageUrls: string[] = [];
        try {
            for (let i = 0; i < slides.length; i++) {
                setVideoExportMessage(`جاري تجهيز الشريحة ${i + 1}/${slides.length}...`);
                const element = slideRefs.current[i].current;
                if (!element) continue;

                const canvas = await html2canvas(element, {
                    scale: exportWidth / element.offsetWidth,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: null,
                });
                
                imageUrls.push(canvas.toDataURL('image/png'));
                setVideoExportProgress((i + 1) / slides.length * 0.5);
            }

            setVideoExportMessage('جاري تحميل الصور...');
            const images = await Promise.all(imageUrls.map(url => new Promise<HTMLImageElement>((res, rej) => {
                const img = new Image();
                img.onload = () => res(img);
                img.onerror = rej;
                img.src = url;
            })));

            setVideoExportMessage('إعداد مُرمِّز الفيديو...');
            const canvas = document.createElement('canvas');
            canvas.width = exportWidth;
            canvas.height = exportHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('لا يمكن الحصول على سياق Canvas');
            
            const videoStream = canvas.captureStream(30);
            let finalStream: MediaStream = videoStream;
            let audioContext: AudioContext | null = null;
            let audioEle: HTMLAudioElement | null = null;

            if (backgroundMusicUrl) {
                setVideoExportMessage('إعداد الصوت...');
                audioContext = new AudioContext();
                audioEle = new Audio(backgroundMusicUrl);
                audioEle.crossOrigin = "anonymous";
                
                await new Promise<void>((resolve, reject) => {
                    audioEle!.addEventListener('canplaythrough', () => resolve(), { once: true });
                    audioEle!.addEventListener('error', () => reject(new Error('فشل تحميل ملف الصوت.')), { once: true });
                    audioEle!.load();
                });

                const source = audioContext.createMediaElementSource(audioEle);
                const dest = audioContext.createMediaStreamDestination();
                source.connect(dest);
                
                const audioTrack = dest.stream.getAudioTracks()[0];
                const videoTrack = videoStream.getVideoTracks()[0];
                finalStream = new MediaStream([videoTrack, audioTrack]);
            }


            const mimeType = 'video/webm;codecs=vp9';
            if (!MediaRecorder.isTypeSupported(mimeType)) throw new Error(`${mimeType} format not supported.`);
            
            const recorder = new MediaRecorder(finalStream, { mimeType });
            const chunks: Blob[] = [];
            recorder.ondataavailable = e => e.data.size > 0 && chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                triggerDownload(URL.createObjectURL(blob), 'presentation.mp4');
                setIsExportingVideo(false);
                imageUrls.forEach(URL.revokeObjectURL);
                audioEle?.pause();
                audioContext?.close();
            };
            recorder.start();
            if (audioEle) audioEle.play();

            setVideoExportMessage('جاري عرض إطارات الفيديو...');
            const slideDuration = 5000;
            const transitionDuration = 500;
            const totalDuration = slides.length * slideDuration;
            let startTime: number | null = null;

            const animate = (time: number) => {
                if (startTime === null) startTime = time;
                const elapsed = time - startTime;
                
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                const currentSlideIndex = Math.floor(elapsed / slideDuration);
                const nextSlideIndex = currentSlideIndex + 1;
                const timeIntoSlide = elapsed % slideDuration;

                const inTransition = timeIntoSlide > (slideDuration - transitionDuration) && nextSlideIndex < images.length;
                const progress = inTransition ? (timeIntoSlide - (slideDuration - transitionDuration)) / transitionDuration : 0;
                
                if (inTransition) {
                    const currentImg = images[currentSlideIndex];
                    const nextImg = images[nextSlideIndex];
                    switch (transitionType) {
                        case 'fade':
                            ctx.globalAlpha = 1 - progress;
                            ctx.drawImage(currentImg, 0, 0, canvas.width, canvas.height);
                            ctx.globalAlpha = progress;
                            ctx.drawImage(nextImg, 0, 0, canvas.width, canvas.height);
                            ctx.globalAlpha = 1;
                            break;
                        case 'slide-up':
                            ctx.drawImage(currentImg, 0, -canvas.height * progress, canvas.width, canvas.height);
                            ctx.drawImage(nextImg, 0, canvas.height * (1-progress), canvas.width, canvas.height);
                            break;
                        case 'slide-left':
                            ctx.drawImage(currentImg, -canvas.width * progress, 0, canvas.width, canvas.height);
                            ctx.drawImage(nextImg, canvas.width * (1 - progress), 0, canvas.width, canvas.height);
                            break;
                        case 'slide-right':
                            ctx.drawImage(currentImg, canvas.width * progress, 0, canvas.width, canvas.height);
                            ctx.drawImage(nextImg, -canvas.width * (1 - progress), 0, canvas.width, canvas.height);
                            break;
                    }
                } else if(images[currentSlideIndex]) {
                    ctx.drawImage(images[currentSlideIndex], 0, 0, canvas.width, canvas.height);
                }

                setVideoExportProgress(0.5 + (elapsed / totalDuration * 0.5));
                if (elapsed >= totalDuration) {
                    recorder.stop();
                } else {
                    requestAnimationFrame(animate);
                }
            };
            requestAnimationFrame(animate);

        } catch (error) {
            alert(`حدث خطأ أثناء تصدير الفيديو: ${error instanceof Error ? error.message : String(error)}`);
            setIsExportingVideo(false);
            imageUrls.forEach(URL.revokeObjectURL);
        }
    };


    const handleNewImage = (index: number) => {
        const currentSlide = slides[index];
        const newKey = (currentSlide.imageRefreshKey || 0) + 1;
        const { userImageUrl, ...restOfSlide } = currentSlide;
        const newSlide = { ...restOfSlide, imageRefreshKey: newKey, userImageUrl: undefined };
        onSlideUpdate(index, newSlide);
    };

    const handleImageReset = (index: number) => {
        const { userImageUrl, imageRefreshKey, ...restOfSlide } = slides[index];
        const newSlide = { ...restOfSlide, userImageUrl: undefined, imageRefreshKey: 0 };
        onSlideUpdate(index, newSlide);
    };

    const handleFileUploadClick = (index: number) => {
        fileInputRefs.current[index].current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            const base64Url = loadEvent.target?.result as string;
            if (base64Url) {
                const updatedSlide = { ...slides[index], userImageUrl: base64Url };
                onSlideUpdate(index, updatedSlide);
            }
        };
        reader.readAsDataURL(file);
        event.target.value = ''; // Allow re-uploading the same file
    };

    const handleLogoUploadClick = () => {
        logoInputRef.current?.click();
    };

    const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            const base64Url = loadEvent.target?.result as string;
            if (base64Url) {
                onLogoUpload(base64Url);
            }
        };
        reader.readAsDataURL(file);
        event.target.value = '';
    };

     const handleMusicUploadClick = () => {
        musicInputRef.current?.click();
    };

    const handleMusicFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onMusicUpload(file);
        }
        if (event.target) {
            event.target.value = '';
        }
    };
    
    const handleRemoveMusic = () => {
        onMusicUpload(null);
    };
    
    const handleFontSizeChange = (index: number, type: 'title' | 'content', delta: number) => {
        const currentSlide = slides[index];
        const field = type === 'title' ? 'titleFontSize' : 'contentFontSize';
        const currentValue = currentSlide[field] || (type === 'title' ? 3.75 : 1.5);
        let newValue = currentValue + delta;
    
        if (type === 'title') newValue = Math.max(1.5, Math.min(8, newValue));
        else newValue = Math.max(0.75, Math.min(4, newValue));
    
        onSlideUpdate(index, { ...currentSlide, [field]: newValue });
    };

    const handleContentItemFontSizeChange = (slideIndex: number, itemIndex: number, delta: number) => {
        const currentSlide = slides[slideIndex];
        const currentItem = currentSlide.content[itemIndex];
        const baseSize = currentItem.fontSize || currentSlide.contentFontSize || 1.5;
        let newValue = Math.max(0.75, Math.min(4, baseSize + delta));
        const newContent = [...currentSlide.content];
        newContent[itemIndex] = { ...currentItem, fontSize: newValue };
        onSlideUpdate(slideIndex, { ...currentSlide, content: newContent });
    };


    const handleFontChange = (index: number) => {
        const currentSlide = slides[index];
        const currentFont = currentSlide.fontFamily || 'Cairo';
        const currentIndex = FONT_OPTIONS.indexOf(currentFont);
        const nextIndex = (currentIndex + 1) % FONT_OPTIONS.length;
        const updatedSlide = { ...currentSlide, fontFamily: FONT_OPTIONS[nextIndex] };
        onSlideUpdate(index, updatedSlide);
    };
    
    const handleBackgroundTransform = (index: number, change: { scale?: number; pan?: { x?: number; y?: number } }) => {
        const currentSlide = slides[index];
        const currentTransform = currentSlide.backgroundTransform || { scale: 1, position: { x: 50, y: 50 } };
        let newScale = change.scale !== undefined ? Math.max(1, Math.min(5, change.scale)) : currentTransform.scale;
        let newPosition = { ...currentTransform.position };
        if (change.pan) {
            newPosition.x = Math.max(0, Math.min(100, newPosition.x + (change.pan.x || 0)));
            newPosition.y = Math.max(0, Math.min(100, newPosition.y + (change.pan.y || 0)));
        }
        onSlideUpdate(index, { ...currentSlide, backgroundTransform: { scale: newScale, position: newPosition } });
    };

    const resetBackgroundTransform = (index: number) => {
        onSlideUpdate(index, { ...slides[index], backgroundTransform: { scale: 1, position: { x: 50, y: 50 } } });
    };

    const handleTextTransform = (index: number, change: { x?: number; y?: number }) => {
        const currentSlide = slides[index];
        const currentTransform = currentSlide.textTransform || { position: { x: 50, y: 50 } };
        let newPosition = { ...currentTransform.position };
        newPosition.x = Math.max(5, Math.min(95, newPosition.x + (change.x || 0)));
        newPosition.y = Math.max(5, Math.min(95, newPosition.y + (change.y || 0)));
        onSlideUpdate(index, { ...currentSlide, textTransform: { position: newPosition } });
    };

    const resetTextTransform = (index: number) => {
        onSlideUpdate(index, { ...slides[index], textTransform: { position: { x: 50, y: 50 } } });
    };

    const handleAddContentItem = (index: number, position: 'start' | 'end') => {
        const currentSlide = slides[index];
        const newContentItem: SlideContentItem = { text: 'نص جديد', icon: 'default', isBold: false };
        let newContent = position === 'start' ? [newContentItem, ...currentSlide.content] : [...currentSlide.content, newContentItem];
        onSlideUpdate(index, { ...currentSlide, content: newContent });
    };

    const handleTextStyleChange = (index: number, style: TextStyle) => {
        onSlideUpdate(index, { ...slides[index], textStyle: style });
    };
    
    const handleSlideTextColorChange = (index: number, color: string) => {
        onSlideUpdate(index, { ...slides[index], textColor: color });
    };

    const handleTitleColorChange = (index: number, color: string) => {
        onSlideUpdate(index, { ...slides[index], titleColor: color });
    };
    
    const handleTitleBoldToggle = (index: number) => {
        const slide = slides[index];
        onSlideUpdate(index, { ...slide, isTitleBold: !slide.isTitleBold });
    };

    const handleContentItemColorChange = (slideIndex: number, itemIndex: number, color: string) => {
        const slide = slides[slideIndex];
        const newContent = [...slide.content];
        newContent[itemIndex] = { ...newContent[itemIndex], textColor: color };
        onSlideUpdate(slideIndex, { ...slide, content: newContent });
    };

    const handleContentItemBoldToggle = (slideIndex: number, itemIndex: number) => {
        const slide = slides[slideIndex];
        const newContent = [...slide.content];
        const item = newContent[itemIndex];
        newContent[itemIndex] = { ...item, isBold: !item.isBold };
        onSlideUpdate(slideIndex, { ...slide, content: newContent });
    };

    const handleIconSelect = (icon: string) => {
        if (pickerOpenFor) {
            const { slideIndex, itemIndex } = pickerOpenFor;
            const currentSlide = slides[slideIndex];
            const newContent = [...currentSlide.content];
            newContent[itemIndex] = { ...newContent[itemIndex], icon };
            const updatedSlide = { ...currentSlide, content: newContent };
            onSlideUpdate(slideIndex, updatedSlide);
            setPickerOpenFor(null);
        }
    };

    const buttonClass = "bg-gray-200 text-gray-800 font-bold w-7 h-7 rounded-md hover:bg-gray-300 transition text-lg flex items-center justify-center leading-none";

    const AddSlideButton = ({ onClick }: { onClick: () => void }) => (
        <div className="flex justify-center items-center my-4 col-span-1 lg:col-span-2">
            <button
                onClick={onClick}
                className="w-full border-2 border-dashed border-gray-400 rounded-xl text-gray-500 hover:bg-gray-100 hover:border-gray-500 transition-all duration-300 py-6 flex items-center justify-center gap-3 text-lg font-bold"
                aria-label="إضافة شريحة جديدة"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                إضافة شريحة جديدة
            </button>
        </div>
    );
    
    return (
        <div className="mt-12">
            {isExportingVideo && (
                <div className="fixed inset-0 bg-black/70 z-[100] flex flex-col items-center justify-center text-white">
                    <svg className="animate-spin h-12 w-12 text-white mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <h3 className="text-2xl font-bold mb-2">{videoExportMessage}</h3>
                    <div className="w-1/2 bg-gray-600 rounded-full h-4">
                        <div className="bg-blue-500 h-4 rounded-full" style={{ width: `${videoExportProgress * 100}%` }}></div>
                    </div>
                </div>
            )}
            {showVideoModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowVideoModal(false)}>
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">خيارات تصدير الفيديو</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="transitionType" className="block text-sm font-medium text-gray-700 mb-1">نوع الانتقال</label>
                                <select
                                    id="transitionType"
                                    value={transitionType}
                                    onChange={(e) => setTransitionType(e.target.value as TransitionType)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="fade">تلاشي (Fade)</option>
                                    <option value="slide-up">انزلاق للأعلى (Slide Up)</option>
                                    <option value="slide-left">انزلاق لليسار (Slide Left)</option>
                                    <option value="slide-right">انزلاق لليمين (Slide Right)</option>
                                </select>
                            </div>
                             <p className="text-sm text-gray-500">سيتم تصدير الفيديو بمدة 5 ثواني لكل شريحة.</p>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setShowVideoModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">إلغاء</button>
                            <button onClick={handleExportVideo} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">بدء التصدير</button>
                        </div>
                    </div>
                </div>
            )}
            {pickerOpenFor && (
                <IconPicker isOpen={!!pickerOpenFor} onClose={() => setPickerOpenFor(null)} onSelectIcon={handleIconSelect} currentIcon={slides[pickerOpenFor.slideIndex].content[pickerOpenFor.itemIndex].icon} />
            )}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 flex-wrap">
                <h2 className="text-3xl font-bold text-gray-800">الشرائح التي تم إنشاؤها</h2>
                <div className="flex gap-4 flex-wrap justify-center">
                    <input type="file" ref={logoInputRef} onChange={handleLogoFileChange} accept="image/*" style={{ display: 'none' }} />
                     <button onClick={handleLogoUploadClick} className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-300 ease-in-out flex items-center gap-2">رفع شعار</button>
                    <input type="file" ref={musicInputRef} onChange={handleMusicFileChange} accept="audio/*" style={{ display: 'none' }} />
                    <div className="flex items-center gap-2">
                        <button onClick={handleMusicUploadClick} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all duration-300 ease-in-out flex items-center gap-2">رفع موسيقى</button>
                        {musicFileName && (
                            <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg text-sm">
                                <span className="text-gray-700 truncate max-w-[150px]" title={musicFileName}>{musicFileName}</span>
                                <button onClick={handleRemoveMusic} className="text-red-500 hover:text-red-700" title="إزالة الموسيقى">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg">
                        <label className="text-sm font-semibold whitespace-nowrap">حجم الشعار:</label>
                        <input type="range" min="24" max="96" step="4" value={logoSize} onChange={(e) => onLogoSizeChange(parseInt(e.target.value, 10))} className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                    </div>
                    <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg">
                        <label className="text-sm font-semibold whitespace-nowrap">سطوع الخلفية:</label>
                        <input type="range" min="0" max="0.9" step="0.05" value={backgroundOpacity} onChange={(e) => onBackgroundOpacityChange(parseFloat(e.target.value))} className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                    </div>
                     <div className="flex items-center bg-gray-200 rounded-lg p-1">
                        <button onClick={() => onOrientationChange('horizontal')} className={`px-4 py-1 text-sm font-semibold rounded-md transition-colors ${orientation === 'horizontal' ? 'bg-white text-gray-800 shadow' : 'bg-transparent text-gray-600'}`}>أفقي</button>
                        <button onClick={() => onOrientationChange('vertical')} className={`px-4 py-1 text-sm font-semibold rounded-md transition-colors ${orientation === 'vertical' ? 'bg-white text-gray-800 shadow' : 'bg-transparent text-gray-600'}`}>عمودي</button>
                        <button onClick={() => onOrientationChange('square')} className={`px-4 py-1 text-sm font-semibold rounded-md transition-colors ${orientation === 'square' ? 'bg-white text-gray-800 shadow' : 'bg-transparent text-gray-600'}`}>مربع</button>
                    </div>
                    <button onClick={() => onThemeChange('asharq')} className="bg-[#f08080] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#d87070] transition-colors">asharq</button>
                    <button onClick={() => onThemeChange('najah')} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">najah</button>
                     <button onClick={exportAsPdf} disabled={isExporting || isExportingPng || isExportingVideo} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2">
                        {isExporting ? 'جاري...' : 'تصدير PDF'}
                     </button>
                     <button onClick={() => setShowVideoModal(true)} disabled={isExporting || isExportingPng || isExportingVideo} className="bg-teal-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2">
                        تصدير فيديو
                     </button>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <AddSlideButton onClick={() => onAddSlide(0)} />
                {slides.flatMap((slide, index) => [
                    <div key={slide.id} className="flex flex-col gap-4">
                        <SlideComponent ref={slideRefs.current[index]} slide={slide} onUpdate={(updatedSlide) => onSlideUpdate(index, updatedSlide)} logoUrl={logoUrl} themeColor={themeColor} backgroundOpacity={backgroundOpacity} orientation={orientation} index={index} logoSize={logoSize} />
                        <div className="bg-white p-3 rounded-xl shadow-md border border-gray-200 flex flex-col gap-3">
                            <div className="flex justify-between items-center gap-2 flex-wrap">
                                <span className="text-sm font-semibold text-gray-600">أدوات التحكم بالشريحة</span>
                                <div className="flex gap-2 flex-wrap">
                                     <button onClick={() => handleImageReset(index)} className="bg-gray-200 text-gray-800 font-bold py-2 px-3 rounded-lg hover:bg-gray-300 transition text-sm flex items-center gap-1" title="استعادة الصورة المقترحة"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M3 12a9 9 0 0 1 9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg></button>
                                    <button onClick={() => handleNewImage(index)} className="bg-blue-100 text-blue-800 font-bold py-2 px-3 rounded-lg hover:bg-blue-200 transition text-sm flex items-center gap-2">صورة جديدة</button>
                                    <button onClick={() => handleFileUploadClick(index)} className="bg-blue-100 text-blue-800 font-bold py-2 px-3 rounded-lg hover:bg-blue-200 transition text-sm flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> رفع</button>
                                    <input type="file" ref={fileInputRefs.current[index]} onChange={(e) => handleFileChange(e, index)} accept="image/*" style={{ display: 'none' }} />
                                    <button id={`export-png-${index}`} onClick={() => exportAsPng(index)} className="bg-gray-700 text-white font-bold py-2 px-3 rounded-lg hover:bg-gray-800 transition text-sm">تصدير PNG</button>
                                     <button onClick={() => onDeleteSlide(index)} className="bg-red-100 text-red-800 font-bold py-2 px-3 rounded-lg hover:bg-red-200 transition text-sm flex items-center gap-1" title="حذف الشريحة"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg> حذف</button>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-3 flex flex-col gap-3">
                                <h4 className="text-sm font-semibold text-gray-600">تحرير المحتوى النصي</h4>
                                <div className="space-y-3">
                                    <div>
                                        <label htmlFor={`title-editor-${index}`} className="block text-xs font-medium text-gray-500 mb-1">عنوان الشريحة</label>
                                        <textarea
                                            id={`title-editor-${index}`}
                                            value={slide.title}
                                            onChange={(e) => onSlideUpdate(index, { ...slide, title: e.target.value })}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 transition"
                                            rows={2}
                                        />
                                    </div>
                                    {slide.content.map((item, itemIndex) => (
                                        <div key={itemIndex}>
                                            <label htmlFor={`content-editor-${index}-${itemIndex}`} className="block text-xs font-medium text-gray-500 mb-1">
                                                النقطة #{itemIndex + 1}
                                            </label>
                                            <div className="flex items-start gap-2">
                                                <textarea
                                                    id={`content-editor-${index}-${itemIndex}`}
                                                    value={item.text}
                                                    onChange={(e) => {
                                                        const newContent = [...slide.content];
                                                        newContent[itemIndex] = { ...newContent[itemIndex], text: e.target.value };
                                                        onSlideUpdate(index, { ...slide, content: newContent });
                                                    }}
                                                    className="flex-grow px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 transition"
                                                    rows={3}
                                                />
                                                <button
                                                    onClick={() => {
                                                        const newContent = slide.content.filter((_, i) => i !== itemIndex);
                                                        onSlideUpdate(index, { ...slide, content: newContent });
                                                    }}
                                                    className="flex-shrink-0 mt-1 bg-red-100 text-red-700 p-2 rounded-lg hover:bg-red-200 transition"
                                                    aria-label={`حذف النقطة ${itemIndex + 1}`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-3 flex flex-col gap-3">
                                <span className="text-sm font-semibold text-gray-600">أدوات التحكم بالخلفية</span>
                                <div className="flex items-center justify-between">
                                    <label className="text-sm text-gray-700">تكبير/تصغير:</label>
                                    <input type="range" min="1" max="3" step="0.1" value={slide.backgroundTransform?.scale || 1} onChange={(e) => handleBackgroundTransform(index, { scale: parseFloat(e.target.value) })} className="w-1/2" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="text-sm text-gray-700">تحريك:</label>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => handleBackgroundTransform(index, { pan: { x: -5 } })} className={buttonClass} aria-label="Pan left">←</button>
                                        <button onClick={() => handleBackgroundTransform(index, { pan: { y: -5 } })} className={buttonClass} aria-label="Pan up">↑</button>
                                        <button onClick={() => handleBackgroundTransform(index, { pan: { y: 5 } })} className={buttonClass} aria-label="Pan down">↓</button>
                                        <button onClick={() => handleBackgroundTransform(index, { pan: { x: 5 } })} className={buttonClass} aria-label="Pan right">→</button>
                                        <button onClick={() => resetBackgroundTransform(index)} className="bg-gray-200 text-gray-800 font-bold py-1 px-2 rounded-md hover:bg-gray-300 transition text-xs" title="إعادة تعيين"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg></button>
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-gray-200 pt-3 flex flex-col gap-3">
                                 <span className="text-sm font-semibold text-gray-600">أدوات التحكم بالنص</span>
                                <div className="flex items-center justify-between">
                                    <label className="text-sm text-gray-700">نمط النص:</label>
                                    <div className="flex items-center bg-gray-200 rounded-lg p-1 text-xs">
                                        <button onClick={() => handleTextStyleChange(index, 'default')} className={`px-2 py-1 font-semibold rounded-md transition-colors ${(!slide.textStyle || slide.textStyle === 'default') ? 'bg-white text-gray-800 shadow' : 'bg-transparent text-gray-600'}`}>صندوق شفاف</button>
                                        <button onClick={() => handleTextStyleChange(index, 'highlight')} className={`px-2 py-1 font-semibold rounded-md transition-colors ${slide.textStyle === 'highlight' ? 'bg-white text-gray-800 shadow' : 'bg-transparent text-gray-600'}`}>تظليل</button>
                                        <button onClick={() => handleTextStyleChange(index, 'minimal')} className={`px-2 py-1 font-semibold rounded-md transition-colors ${slide.textStyle === 'minimal' ? 'bg-white text-gray-800 shadow' : 'bg-transparent text-gray-600'}`}>بسيط</button>
                                        <button onClick={() => handleTextStyleChange(index, 'card')} className={`px-2 py-1 font-semibold rounded-md transition-colors ${slide.textStyle === 'card' ? 'bg-white text-gray-800 shadow' : 'bg-transparent text-gray-600'}`}>بطاقة</button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="text-sm text-gray-700">موضع النص:</label>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => handleTextTransform(index, { x: -5 })} className={buttonClass} aria-label="Move text left">←</button>
                                        <button onClick={() => handleTextTransform(index, { y: -5 })} className={buttonClass} aria-label="Move text up">↑</button>
                                        <button onClick={() => handleTextTransform(index, { y: 5 })} className={buttonClass} aria-label="Move text down">↓</button>
                                        <button onClick={() => handleTextTransform(index, { x: 5 })} className={buttonClass} aria-label="Move text right">→</button>
                                        <button onClick={() => resetTextTransform(index)} className="bg-gray-200 text-gray-800 font-bold py-1 px-2 rounded-md hover:bg-gray-300 transition text-xs" title="إعادة تعيين"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg></button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="text-sm text-gray-700">الخط الحالي:</label>
                                    <div className="flex items-center gap-2"><span className="text-sm text-gray-800 font-bold">{slide.fontFamily}</span><button onClick={() => handleFontChange(index)} className="bg-gray-200 text-gray-800 font-bold py-2 px-3 rounded-lg hover:bg-gray-300 transition text-sm">تغيير الخط</button></div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="text-sm text-gray-700">لون النص العام:</label>
                                    <input type="color" value={slide.textColor || '#ffffff'} onChange={(e) => handleSlideTextColorChange(index, e.target.value)} className="w-10 h-10 p-1 bg-white border border-gray-300 rounded-md cursor-pointer" title="اختر اللون العام للنص"/>
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="text-sm text-gray-700">حجم العنوان:</label>
                                    <div className="flex items-center gap-2">
                                        <input type="color" value={slide.titleColor || '#FF4136'} onChange={(e) => handleTitleColorChange(index, e.target.value)} className="w-7 h-7 p-0.5 bg-white border border-gray-300 rounded-md cursor-pointer" title="اختر لون العنوان" />
                                        <button onClick={() => handleTitleBoldToggle(index)} className={`w-7 h-7 rounded-md transition font-black text-lg flex items-center justify-center ${slide.isTitleBold ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`} title="Bold">B</button>
                                        <button onClick={() => handleFontSizeChange(index, 'title', -0.25)} className={buttonClass} aria-label="Decrease title font size">-</button>
                                        <span className="text-sm text-gray-800 w-16 text-center">{slide.titleFontSize?.toFixed(2) || '3.75'} rem</span>
                                        <button onClick={() => handleFontSizeChange(index, 'title', 0.25)} className={buttonClass} aria-label="Increase title font size">+</button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="text-sm text-gray-700">حجم النص الافتراضي:</label>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleFontSizeChange(index, 'content', -0.1)} className={buttonClass} aria-label="Decrease content font size">-</button>
                                        <span className="text-sm text-gray-800 w-16 text-center">{slide.contentFontSize?.toFixed(2) || '1.50'} rem</span>
                                        <button onClick={() => handleFontSizeChange(index, 'content', 0.1)} className={buttonClass} aria-label="Increase content font size">+</button>
                                    </div>
                                </div>
                                <div className="border-t border-gray-200 pt-3 space-y-2">
                                     <span className="text-sm font-semibold text-gray-600">التحكم في العناصر</span>
                                    {slide.content.map((item, itemIndex) => (
                                        <div key={itemIndex} className="flex items-center justify-between gap-2">
                                             <div className="flex items-center gap-2 flex-1">
                                                <button onClick={() => setPickerOpenFor({ slideIndex: index, itemIndex })} className="p-1 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors flex-shrink-0" aria-label={`Change icon for item ${itemIndex + 1}`}><div className="text-gray-800 w-6 h-6 flex items-center justify-center"><Icon name={item.icon} /></div></button>
                                                <label className="text-xs text-gray-600 truncate flex-1 pr-2" title={item.text}>"{item.text.substring(0, 25)}..."</label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input type="color" value={item.textColor || slide.textColor || '#ffffff'} onChange={(e) => handleContentItemColorChange(index, itemIndex, e.target.value)} className="w-7 h-7 p-0.5 bg-white border border-gray-300 rounded-md cursor-pointer" title="اختر لون النص" />
                                                <button onClick={() => handleContentItemBoldToggle(index, itemIndex)} className={`w-7 h-7 rounded-md transition font-bold text-lg flex items-center justify-center ${item.isBold ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`} title="Bold">B</button>
                                                <button onClick={() => handleContentItemFontSizeChange(index, itemIndex, -0.1)} className={buttonClass} aria-label={`Decrease font size for item ${itemIndex + 1}`}>-</button>
                                                <span className="text-sm text-gray-800 w-16 text-center">{(item.fontSize || slide.contentFontSize)?.toFixed(2) || '1.50'} rem</span>
                                                <button onClick={() => handleContentItemFontSizeChange(index, itemIndex, 0.1)} className={buttonClass} aria-label={`Increase font size for item ${itemIndex + 1}`}>+</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center justify-end pt-2 gap-2">
                                    <button onClick={() => handleAddContentItem(index, 'start')} className="bg-blue-100 text-blue-800 font-bold py-2 px-3 rounded-lg hover:bg-blue-200 transition text-sm">إضافة في البداية</button>
                                    <button onClick={() => handleAddContentItem(index, 'end')} className="bg-blue-100 text-blue-800 font-bold py-2 px-3 rounded-lg hover:bg-blue-200 transition text-sm">إضافة في النهاية</button>
                                </div>
                            </div>
                        </div>
                    </div>,
                    <AddSlideButton key={`add_${slide.id}`} onClick={() => onAddSlide(index + 1)} />
                ])}
            </div>
            <div className="mt-12 flex justify-center">
                <button onClick={exportAllAsPng} disabled={isExportingPng || isExporting || isExportingVideo} className="bg-orange-500 text-white font-bold py-4 px-8 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center text-xl gap-3">
                    {isExportingPng ? (<><svg className="animate-spin -ms-1 me-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>جاري التنزيل...</span></>) : ('تنزيل كافة الشرائح (PNG)')}
                </button>
            </div>
        </div>
    );
};
