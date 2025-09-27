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
    const totalContentLength = slide.content.reduce((acc, item) => acc + item.text.length, 0);

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

    // Title font size: Calculated with a linear function for smoother scaling.
    const baseTitleSize = 5.5; // Start with a larger base size
    const titleLengthFactor = 0.045; // Reduce size more aggressively for longer titles
    let titleFontSize = baseTitleSize - titleLength * titleLengthFactor;

    // Content font size: Calculated based on a "density score" for better accuracy.
    const densityScore = (numContentItems * 20) + totalContentLength;
    const baseContentSize = 2.0;
    const densityFactor = 0.0015;
    let contentFontSize = baseContentSize - densityScore * densityFactor;
    
    // Apply the orientation multiplier to the calculated sizes.
    titleFontSize *= orientationMultiplier;
    contentFontSize *= orientationMultiplier;
    
    // Clamp values to ensure they stay within a reasonable range.
    // The max value is also scaled by the multiplier.
    titleFontSize = Math.max(1.5, Math.min(5.0 * orientationMultiplier, titleFontSize));
    contentFontSize = Math.max(0.8, Math.min(2.2 * orientationMultiplier, contentFontSize));
    
    return { titleFontSize, contentFontSize };
};


const App: React.FC = () => {
    const [mainTitle, setMainTitle] = useState<string>('');
    const [rawText, setRawText] = useState<string>('');
    const [slides, setSlides] = useState<Slide[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [backgroundOpacity, setBackgroundOpacity] = useState<number>(0.5);
    const [themeColor, setThemeColor] = useState<string>('#007BFF');
    const [orientation, setOrientation] = useState<Orientation>('horizontal');
    const [numberOfSlides, setNumberOfSlides] = useState<number>(5);

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
            // FIX: Explicitly type generatedSlides to ensure correct type inference for its elements.
            const generatedSlides: Slide[] = generatedSlidesRaw.map(slide => {
                const { titleFontSize, contentFontSize } = calculateInitialFontSizes(slide, orientation);
                return {
                    ...slide,
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
                }
            });
            setSlides(generatedSlides);
        } catch (err) {
            console.error(err);
            setError("حدث خطأ أثناء إنشاء الشرائح. يرجى المحاولة مرة أخرى.");
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

    const handleLogoUpload = (url: string) => {
        setLogoUrl(url);
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
                    onGenerate={handleGenerate}
                    isLoading={isLoading}
                    numberOfSlides={numberOfSlides}
                    setNumberOfSlides={setNumberOfSlides}
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
