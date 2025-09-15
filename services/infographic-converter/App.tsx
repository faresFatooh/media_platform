
import React, { useState, useCallback, useEffect } from 'react';
import { InputForm } from './components/InputForm';
import { SlideViewer } from './components/SlideViewer';
import { generateSlidesFromText } from './services/geminiService';
import type { Slide } from './types';

export type Orientation = 'horizontal' | 'vertical' | 'square';

const calculateInitialFontSizes = (
    slide: Pick<Slide, 'title' | 'content'>,
    orientation: Orientation
) => {
    const titleLength = slide.title.length;
    const numContentItems = slide.content.length;
    const totalContentLength = slide.content.reduce((acc, item) => {
        // Treat "المصدر" lines as if they are shorter to compensate for smaller font size
        const weight = item.text.includes('المصدر') ? 0.8 : 1.0;
        return acc + (item.text.length * weight);
    }, 0);

    // This multiplier adjusts font sizes based on the available horizontal space.
    let orientationMultiplier: number;
    switch (orientation) {
        case 'vertical':
            orientationMultiplier = 0.75;
            break;
        case 'square':
            orientationMultiplier = 0.9;
            break;
        case 'horizontal':
        default:
            orientationMultiplier = 1.0;
            break;
    }

    // Title font size: Now more aggressive and considers content item count.
    const baseTitleSize = 5.5;
    const titleLengthFactor = 0.05; // Increased from 0.045
    const titleContentFactor = 0.1; // New factor for content item count
    let titleFontSize = baseTitleSize - (titleLength * titleLengthFactor) - (numContentItems * titleContentFactor);

    // Content font size: Calibrated to target a standard size around 20px (1.25rem).
    const densityScore = (numContentItems * 20) + totalContentLength;
    const baseContentSize = 1.8;
    const densityFactor = 0.0018;
    let contentFontSize = baseContentSize - densityScore * densityFactor;
    
    // Apply the orientation multiplier to the calculated sizes.
    titleFontSize *= orientationMultiplier;
    contentFontSize *= orientationMultiplier;
    
    // Clamp values with a lower minimum to allow for smaller fonts on dense slides.
    titleFontSize = Math.max(1.2, Math.min(5.0 * orientationMultiplier, titleFontSize));
    contentFontSize = Math.max(0.7, Math.min(1.8 * orientationMultiplier, contentFontSize));
    
    return { titleFontSize, contentFontSize };
};


const App: React.FC = () => {
    const [mainTitle, setMainTitle] = useState<string>('');
    const [rawText, setRawText] = useState<string>('');
    const [numberOfSlides, setNumberOfSlides] = useState<number>(5);
    const [slides, setSlides] = useState<Slide[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [backgroundOpacity, setBackgroundOpacity] = useState<number>(0.5);
    const [themeColor, setThemeColor] = useState<string>('#007BFF');
    const [orientation, setOrientation] = useState<Orientation>('square');
    const [backgroundMusicUrl, setBackgroundMusicUrl] = useState<string | null>(null);
    const [musicFileName, setMusicFileName] = useState<string | null>(null);
    const [logoSize, setLogoSize] = useState<number>(48); // default to 48px, which is h-12

    useEffect(() => {
        if (slides.length > 0) {
            setSlides(currentSlides =>
                currentSlides.map(slide => {
                    const { titleFontSize, contentFontSize } = calculateInitialFontSizes(slide, orientation);
                    return {
                        ...slide,
                        titleFontSize,
                        contentFontSize,
                    };
                })
            );
        }
    }, [orientation]);

    // Effect for cleaning up the object URL on component unmount
    useEffect(() => {
        return () => {
            if (backgroundMusicUrl) {
                URL.revokeObjectURL(backgroundMusicUrl);
            }
        };
    }, [backgroundMusicUrl]);


    const handleGenerate = useCallback(async () => {
        if (!mainTitle.trim() || !rawText.trim()) {
            setError("يرجى ملء كل من العنوان الرئيسي والنص الكامل.");
            return;
        }
        if (numberOfSlides < 1 || numberOfSlides > 10) {
            setError("يرجى تحديد عدد شرائح بين 1 و 10.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setSlides([]);

        try {
            const generatedSlidesRaw = await generateSlidesFromText(mainTitle, rawText, numberOfSlides);
            // FIX: Explicitly type `generatedSlides` as `Slide[]` to fix a type inference issue.
            const generatedSlides: Slide[] = generatedSlidesRaw.map((slide, index) => {
                const { titleFontSize, contentFontSize } = calculateInitialFontSizes(slide, orientation);
                return {
                    id: `gen_${Date.now()}_${index}`,
                    ...slide,
                    content: slide.content.map(item => ({...item, isBold: false})),
                    titleFontSize,
                    contentFontSize,
                    fontFamily: 'Cairo', // Default font
                    imageRefreshKey: 0, // For triggering image refetch
                    backgroundTransform: { // Default background transform
                        scale: 1,
                        position: { x: 50, y: 50 },
                    },
                    textTransform: { // Default text position
                        position: { x: 50, y: 50 },
                    },
                    textStyle: 'default', // Default text style
                    isTitleBold: true, // Title is bold by default
                    titleColor: '#FF4136', // Default red title
                    textColor: '#FFFFFF',  // Default white text
                }
            });
            setSlides(generatedSlides);
        } catch (err) {
            console.error(err);
            setError("حدث خطأ أثناء إنشاء الشرائح. يجى المحاولة مرة أخرى.");
        } finally {
            setIsLoading(false);
        }
    }, [mainTitle, rawText, numberOfSlides, orientation]);

    const handleSlideUpdate = useCallback((index: number, updatedSlide: Slide) => {
        setSlides(currentSlides => {
            const newSlides = [...currentSlides];
            newSlides[index] = updatedSlide;
            return newSlides;
        });
    }, []);

    const handleAddSlide = useCallback((index: number) => {
        const newSlideTemplate: Omit<Slide, 'id' | 'titleFontSize' | 'contentFontSize'> = {
            title: 'عنوان جديد',
            content: [{ text: 'أدخل النص هنا', icon: 'idea', isBold: false }],
            visual: {
                method: 'search',
                query: 'minimalist abstract background'
            },
            fontFamily: 'Cairo',
            imageRefreshKey: Date.now(),
            backgroundTransform: { scale: 1, position: { x: 50, y: 50 } },
            textTransform: { position: { x: 50, y: 50 } },
            textStyle: 'default',
        };
        
        const { titleFontSize, contentFontSize } = calculateInitialFontSizes(newSlideTemplate, orientation);

        const newSlide: Slide = {
            id: `new_${Date.now()}`,
            ...newSlideTemplate,
            titleFontSize,
            contentFontSize,
            isTitleBold: true,
            titleColor: '#FF4136',
            textColor: '#FFFFFF',
        };

        setSlides(currentSlides => {
            const newSlides = [...currentSlides];
            newSlides.splice(index, 0, newSlide);
            return newSlides;
        });
    }, [orientation]);

    const handleDeleteSlide = useCallback((index: number) => {
        if (window.confirm('هل أنت متأكد من رغبتك في حذف هذه الشريحة؟')) {
            setSlides(currentSlides => currentSlides.filter((_, i) => i !== index));
        }
    }, []);

    const handleLogoUpload = (url: string) => {
        setLogoUrl(url);
    };

    const handleMusicUpload = (file: File | null) => {
        // Revoke previous URL to avoid memory leaks
        if (backgroundMusicUrl) {
            URL.revokeObjectURL(backgroundMusicUrl);
        }
        if (file) {
            const url = URL.createObjectURL(file);
            setBackgroundMusicUrl(url);
            setMusicFileName(file.name);
        } else {
            setBackgroundMusicUrl(null);
            setMusicFileName(null);
        }
    };
    
    const handleThemeChange = (theme: 'asharq' | 'najah') => {
        if (theme === 'asharq') {
            setThemeColor('#f08080');
            setSlides(currentSlides =>
                currentSlides.map(slide => ({
                    ...slide,
                    fontFamily: 'Neue Haas Grotesk Bloomberg',
                }))
            );
        } else { // najah
            setThemeColor('#007BFF');
            setSlides(currentSlides =>
                currentSlides.map(slide => ({
                    ...slide,
                    fontFamily: 'Cairo',
                }))
            );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800">
            <header className="bg-white shadow-md">
                <div className="container mx-auto px-4 py-6">
                    <h1 className="text-4xl font-bold text-center text-gray-900">
                        مُحَوِّل النصوص إلى <span style={{ color: themeColor }}>انفوجرافيك</span>
                    </h1>
                    <p className="text-center text-lg text-gray-600 mt-2">
                        حوّل مقالاتك وتقاريرك الطويلة إلى عروض تقديمية بصرية مذهلة بضغطة زر.
                    </p>
                </div>
            </header>
            
            <main className="container mx-auto px-4 py-8">
                <InputForm
                    mainTitle={mainTitle}
                    setMainTitle={setMainTitle}
                    rawText={rawText}
                    setRawText={setRawText}
                    numberOfSlides={numberOfSlides}
                    setNumberOfSlides={setNumberOfSlides}
                    onGenerate={handleGenerate}
                    isLoading={isLoading}
                />

                {error && (
                    <div className="mt-8 bg-red-100 border-r-4 border-red-500 text-red-700 p-4 rounded-lg" role="alert">
                        <p className="font-bold">خطأ</p>
                        <p>{error}</p>
                    </div>
                )}

                {isLoading && (
                     <div className="mt-12 text-center">
                        <div className="inline-flex items-center justify-center gap-4">
                             <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-t-4 border-[#007BFF]"></div>
                             <span className="text-2xl font-semibold text-gray-700">جاري التحليل والإنشاء... قد تستغرق هذه العملية لحظات.</span>
                        </div>
                    </div>
                )}

                {slides.length > 0 && !isLoading && (
                    <SlideViewer 
                        slides={slides} 
                        onSlideUpdate={handleSlideUpdate} 
                        logoUrl={logoUrl} 
                        onLogoUpload={handleLogoUpload}
                        backgroundOpacity={backgroundOpacity}
                        onBackgroundOpacityChange={setBackgroundOpacity}
                        themeColor={themeColor}
                        onThemeChange={handleThemeChange}
                        orientation={orientation}
                        onOrientationChange={setOrientation}
                        onAddSlide={handleAddSlide}
                        onDeleteSlide={handleDeleteSlide}
                        onMusicUpload={handleMusicUpload}
                        backgroundMusicUrl={backgroundMusicUrl}
                        musicFileName={musicFileName}
                        logoSize={logoSize}
                        onLogoSizeChange={setLogoSize}
                    />
                )}
            </main>

            <footer className="bg-white mt-12 py-4 border-t">
                <p className="text-center text-gray-500">تم التطوير بواسطة الذكاء الاصطناعي</p>
            </footer>
        </div>
    );
};

export default App;
