
import React, { forwardRef, useState, useEffect, useCallback, useRef } from 'react';
import type { Slide as SlideType, TextStyle } from '../types';
import { Icon } from './Icon';
import { generateImage, searchStockImage } from '../services/geminiService';
import type { Orientation } from '../App';

interface SlideProps {
    slide: SlideType;
    onUpdate: (updatedSlide: SlideType) => void;
    logoUrl: string | null;
    themeColor: string;
    backgroundOpacity: number;
    orientation: Orientation;
    index: number;
    logoSize: number;
}

const hexToRgba = (hex: string, alpha: number): string => {
    let c: any;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length === 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        return `rgba(${[(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',')},${alpha})`;
    }
    // Fallback for rgb color strings which might be passed in some cases
    if (hex.startsWith('rgb')) {
        return hex.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
    }
    return hex;
};

export const Slide = forwardRef<HTMLDivElement, SlideProps>(({ slide, onUpdate, logoUrl, themeColor, backgroundOpacity, orientation, index, logoSize }, ref) => {
    
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isImageLoading, setIsImageLoading] = useState(true);
    const [imageError, setImageError] = useState<string | null>(null);
    const hasLoadedInitially = useRef(false);

    const loadImage = useCallback(async () => {
        setIsImageLoading(true);
        setImageUrl(null);
        setImageError(null);
        
        try {
            if (slide.userImageUrl) {
                setImageUrl(slide.userImageUrl);
                return;
            }

            if (slide.visual.method === 'search') {
                const pageToFetch = (slide.imageRefreshKey || 0) + 1;
                const imageOrientation = orientation === 'vertical' ? 'portrait' : orientation === 'square' ? 'squarish' : 'landscape';
                const url = await searchStockImage(slide.visual.query, pageToFetch, imageOrientation);
                setImageUrl(url);
            } else if (slide.visual.method === 'generate') {
                const imageAspectRatio = orientation === 'vertical' ? '9:16' : orientation === 'square' ? '1:1' : '16:9';
                const base64Data = await generateImage(slide.visual.query, imageAspectRatio);
                const dataUrl = `data:image/jpeg;base64,${base64Data}`;
                setImageUrl(dataUrl);
            }
        } catch (error) {
            console.error("Failed to load image:", error);
            setImageError("فشل تحميل الصورة.");
        } finally {
            setIsImageLoading(false);
        }
    }, [slide.visual, slide.userImageUrl, slide.imageRefreshKey, orientation]);

    useEffect(() => {
        // Stagger the initial image load to reduce the chance of hitting API rate limits.
        const isInitialLoad = !hasLoadedInitially.current;
        // Only apply a delay on the very first load of the component.
        const delay = isInitialLoad ? index * 500 : 0;

        const timer = setTimeout(() => {
            // The loadImage callback already handles all the logic for fetching based on
            // userImageUrl, imageRefreshKey, etc. We just need to trigger it.
            loadImage();
            if (isInitialLoad) {
                // Mark that the initial load has been attempted.
                hasLoadedInitially.current = true;
            }
        }, delay);

        return () => clearTimeout(timer);
    }, [loadImage, index]);
    
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        // Do not start dragging if the user is clicking on an editable text element
        if (target.closest('[contenteditable="true"]')) {
            return;
        }

        // Only drag with the primary mouse button
        if (e.button !== 0) return;
        
        e.preventDefault();
        e.stopPropagation();

        const slideContainer = (ref as React.RefObject<HTMLDivElement>).current;
        if (!slideContainer) return;

        const { x: initialTextX, y: initialTextY } = slide.textTransform?.position || { x: 50, y: 50 };
        
        const startX = e.clientX;
        const startY = e.clientY;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const slideBounds = slideContainer.getBoundingClientRect();
            if (!slideBounds.width || !slideBounds.height) return;

            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;

            const dxPercent = (dx / slideBounds.width) * 100;
            const dyPercent = (dy / slideBounds.height) * 100;
            
            let newX = initialTextX + dxPercent;
            let newY = initialTextY + dyPercent;

            // Clamp values to keep the text block within view
            newX = Math.max(5, Math.min(95, newX));
            newY = Math.max(5, Math.min(95, newY));
            
            onUpdate({
                ...slide,
                textTransform: {
                    position: { x: newX, y: newY }
                }
            });
        };

        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }, [slide, onUpdate, ref]);

    const { scale = 1, position = { x: 50, y: 50 } } = slide.backgroundTransform || {};
    const { position: textPosition = { x: 50, y: 50 } } = slide.textTransform || {};
    const textStyle = slide.textStyle || 'default';

    const TextContent = () => {
        const titleClass = {
            'default': "mb-8 text-center [text-shadow:_0_0.033em_0.267em_rgba(0,0,0,0.5)]",
            'card': "mb-8 text-center",
            'minimal': "mb-8 text-center [text-shadow:_0_0.05em_0.133em_rgba(0,0,0,0.8)]",
            'highlight': "mb-8 text-center [text-shadow:_0_0.033em_0.1em_rgba(0,0,0,0.6)]"
        }[textStyle];
    
        const contentClass = {
            'default': "leading-relaxed [text-shadow:_0_0.042em_0.417em_rgba(0,0,0,0.6)]",
            'card': "leading-relaxed",
            'minimal': "leading-relaxed [text-shadow:_0_0.083em_0.25em_rgba(0,0,0,0.7)]",
            'highlight': "leading-relaxed [text-shadow:_0_0.042em_0.167em_rgba(0,0,0,0.6)]"
        }[textStyle];
    
        const titleContent = textStyle === 'highlight' ? (
            <span style={{ backgroundColor: hexToRgba(themeColor, 0.8), boxShadow: `0.5em 0 0 ${hexToRgba(themeColor, 0.8)}, -0.5em 0 0 ${hexToRgba(themeColor, 0.8)}` }} className="px-2 leading-relaxed inline">{slide.title}</span>
        ) : slide.title;
        
        const itemContent = (item: SlideType['content'][0]) => textStyle === 'highlight' ? (
            <span style={{ backgroundColor: hexToRgba(themeColor, 0.8), boxShadow: `0.5em 0 0 ${hexToRgba(themeColor, 0.8)}, -0.5em 0 0 ${hexToRgba(themeColor, 0.8)}` }} className="px-2 leading-relaxed inline">{item.text}</span>
        ) : item.text;
        
        return (
            <div className="w-full">
                <h2
                    className={titleClass}
                    style={{
                        fontSize: `${slide.titleFontSize || 3.75}rem`,
                        lineHeight: 1.3,
                        color: slide.titleColor || '#FF4136',
                        fontWeight: slide.isTitleBold ? 900 : 400,
                    }}
                >
                    {titleContent}
                </h2>
                <ul className="space-y-5">
                    {slide.content.map((item, index) => {
                        const isSource = item.text.includes('المصدر');
                        const defaultSize = item.fontSize || slide.contentFontSize || 1.5;
                        const finalSize = isSource ? defaultSize * 0.8 : defaultSize;

                        return (
                            <li key={index} className="flex items-start gap-4">
                                <div className="flex-shrink-0 pt-1">
                                  <Icon name={item.icon} />
                                </div>
                                <p
                                    className={contentClass}
                                    style={{
                                        fontSize: `${finalSize}rem`,
                                        color: item.textColor,
                                        fontWeight: item.isBold ? 700 : 400,
                                    }}
                                >
                                    {itemContent(item)}
                                </p>
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    };

    const wrapperClass = {
        'default': "bg-black/20 backdrop-blur-[0.25rem] p-6 rounded-lg",
        'card': "bg-gray-900/80 p-6 rounded-lg shadow-[0_1.5625rem_3.125rem_-0.75rem_rgba(0,0,0,0.25)]",
        'minimal': "p-6",
        'highlight': "p-6"
    }[textStyle];

    return (
        <div
            ref={ref}
            className={`w-full bg-gray-800 relative overflow-hidden flex items-center justify-center p-2 ${orientation === 'vertical' ? 'aspect-[9/16]' : orientation === 'square' ? 'aspect-square' : 'aspect-video'}`}
        >
            <div 
                className="w-full h-full border-[0.3125rem] relative overflow-hidden shadow-[0_1.5625rem_3.125rem_-0.75rem_rgba(0,0,0,0.25)] bg-gray-700"
                style={{ fontFamily: slide.fontFamily || 'Cairo', borderColor: themeColor }}
            >
                 {isImageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center z-30 bg-gray-800/50">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-t-4 border-white"></div>
                    </div>
                )}

                {imageError && !isImageLoading && (
                     <div className="absolute inset-0 flex items-center justify-center z-30 text-white text-center p-4 bg-red-800/50">
                        <p>{imageError}</p>
                    </div>
                )}
                
                {imageUrl && (
                     <img
                        src={imageUrl}
                        alt={slide.visual.query}
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ease-in-out ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                        crossOrigin="anonymous"
                        key={imageUrl} // Use key to force re-render on URL change
                        onLoad={() => setIsImageLoading(false)}
                        onError={() => {
                            setIsImageLoading(false);
                            setImageError("تعذر عرض الصورة. تحقق من الرابط.");
                        }}
                        style={{
                            transform: `scale(${scale})`,
                            objectPosition: `${position.x}% ${position.y}%`,
                        }}
                    />
                )}
                
                <div 
                    className={`absolute inset-0 bg-black transition-opacity duration-500 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                    style={{ backgroundColor: `rgba(0, 0, 0, ${backgroundOpacity})` }}
                ></div>
                
                {logoUrl && (
                    <img 
                        src={logoUrl} 
                        alt="Logo"
                        className="absolute top-4 right-4 w-auto object-contain z-20"
                        style={{
                            height: `${logoSize}px`,
                            filter: 'drop-shadow(0 0.625rem 0.5rem rgba(0, 0, 0, 0.04)) drop-shadow(0 0.25rem 0.1875rem rgba(0, 0, 0, 0.1))'
                        }}
                    />
                )}
                
                <div
                    onMouseDown={handleMouseDown}
                    className={`absolute z-10 w-[90%] transition-all duration-300 ease-in-out cursor-move ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                    style={{
                        top: `${textPosition.y}%`,
                        left: `${textPosition.x}%`,
                        transform: 'translate(-50%, -50%)',
                        color: slide.textColor || '#FFFFFF',
                    }}
                >
                    <div className={wrapperClass}>
                       <TextContent />
                    </div>
                </div>
            </div>
        </div>
    );
});
