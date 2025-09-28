import React, { useState, useCallback, useEffect } from 'react';
import { InputForm } from './components/InputForm';
import { SlideViewer } from './components/SlideViewer';
import { SocialIconGenerator } from './components/SocialIconGenerator';
import { generateSlidesFromText, generateSlidesFromTextChunks, searchStockImage, createFacebookPost, updateFacebookPost } from './services/geminiService';
import type { Slide } from './types';

export type Orientation = 'horizontal' | 'vertical' | 'square';

const calculateInitialFontSizes = (
  slide: Pick<Slide, 'title' | 'content'>,
  orientation: Orientation
) => {
  const titleLength = slide.title.length;
  const numContentItems = slide.content.length;
  const totalContentLength = slide.content.reduce((acc, item) => {
    const weight = item.text.includes('المصدر') ? 0.8 : 1.0;
    return acc + (item.text.length * weight);
  }, 0);

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

  const baseTitleSize = 5.5;
  const titleLengthFactor = 0.05;
  const titleContentFactor = 0.1;
  let titleFontSize = baseTitleSize - (titleLength * titleLengthFactor) - (numContentItems * titleContentFactor);

  const densityScore = (numContentItems * 20) + totalContentLength;
  const baseContentSize = 1.8;
  const densityFactor = 0.0018;
  let contentFontSize = baseContentSize - densityScore * densityFactor;

  titleFontSize *= orientationMultiplier;
  contentFontSize *= orientationMultiplier;

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
  const [socialIconUrl, setSocialIconUrl] = useState<string | null>(null);
  const [backgroundOpacity, setBackgroundOpacity] = useState<number>(0.5);
  const [themeColor, setThemeColor] = useState<string>('#007BFF');
  const [orientation, setOrientation] = useState<Orientation>('square');
  const [backgroundMusicUrl, setBackgroundMusicUrl] = useState<string | null>(null);
  const [musicFileName, setMusicFileName] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState<number>(48);
  const [socialIconSize, setSocialIconSize] = useState<number>(36);
  const [socialIconPosition, setSocialIconPosition] = useState<{ x: number; y: number }>({ x: 50, y: 95 });
  const [inputMode, setInputMode] = useState<'fullText' | 'manual'>('fullText');
  const [textChunks, setTextChunks] = useState<string[]>(['']);
  const [activeTool, setActiveTool] = useState<'infographic' | 'socialIcon'>('infographic');

  // ✅ اختيار الشريحة للنشر
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number>(0);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishMsg, setPublishMsg] = useState<string | null>(null);

  // ✅ نمط النشر (جديد/تعديل)
  const [publishMode, setPublishMode] = useState<'new' | 'update'>('new');
  const [lastPostId, setLastPostId] = useState<string | null>(null);

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

  useEffect(() => {
    return () => {
      if (backgroundMusicUrl) {
        URL.revokeObjectURL(backgroundMusicUrl);
      }
    };
  }, [backgroundMusicUrl]);

  const handleGenerate = useCallback(async () => {
    if (!mainTitle.trim()) {
      setError("يرجى ملء حقل العنوان الرئيسي.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSlides([]);

    try {
      let generatedSlidesRaw: Slide[];

      if (inputMode === 'fullText') {
        if (!rawText.trim()) {
          setError("يرجى ملء حقل النص الكامل.");
          setIsLoading(false);
          return;
        }
        if (numberOfSlides < 1 || numberOfSlides > 15) {
          setError("يرجى تحديد عدد شرائح بين 1 و 15.");
          setIsLoading(false);
          return;
        }
        generatedSlidesRaw = await generateSlidesFromText(mainTitle, rawText, numberOfSlides);
      } else {
        const validChunks = textChunks.filter(chunk => chunk.trim() !== '');
        if (validChunks.length === 0) {
          setError("يرجى إدخال محتوى لشريحة واحدة على الأقل.");
          setIsLoading(false);
          return;
        }
        generatedSlidesRaw = await generateSlidesFromTextChunks(mainTitle, validChunks);
      }

      const generatedSlides: Slide[] = generatedSlidesRaw.map((slide, index) => {
        const { titleFontSize, contentFontSize } = calculateInitialFontSizes(slide, orientation);
        return {
          id: `gen_${Date.now()}_${index}`,
          ...slide,
          content: slide.content.map(item => ({ ...item, isBold: false })),
          titleFontSize,
          contentFontSize,
          fontFamily: 'Cairo',
          imageRefreshKey: 0,
          backgroundTransform: { scale: 1, position: { x: 50, y: 50 } },
          textTransform: { position: { x: 50, y: 50 } },
          textStyle: 'default',
          isTitleBold: true,
          titleColor: '#FF4136',
          textColor: '#FFFFFF',
        }
      });
      setSlides(generatedSlides);
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء إنشاء الشرائح. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  }, [mainTitle, rawText, numberOfSlides, orientation, inputMode, textChunks]);

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
      visual: { method: 'search', query: 'minimalist abstract background' },
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

  const handleLogoUpload = (url: string) => setLogoUrl(url);
  const handleSocialIconUpload = (url: string) => setSocialIconUrl(url);

  const handleMusicUpload = (file: File | null) => {
    if (backgroundMusicUrl) URL.revokeObjectURL(backgroundMusicUrl);
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
        currentSlides.map(slide => ({ ...slide, fontFamily: 'Neue Haas Grotesk Bloomberg' }))
      );
    } else {
      setThemeColor('#007BFF');
      setSlides(currentSlides =>
        currentSlides.map(slide => ({ ...slide, fontFamily: 'Cairo' }))
      );
    }
  };

  // ✅ نشر/تعديل الشريحة المختارة
const handlePublishToFacebook = async () => {
  if (slides.length === 0) {
    alert("لا يوجد إنفوغرافيك جاهز للنشر.");
    return;
  }

  setIsPublishing(true);
  setPublishMsg(null);

  try {
    const selectedSlide = slides[selectedSlideIndex];
    // ❌ احذف caption (النص رح يكون داخل الصورة نفسها)
    // const caption = `${selectedSlide.title}\n\n${selectedSlide.content.map(c => `• ${c.text}`).join("\n")}`;
    const imageUrl = selectedSlide.visual?.query ? await searchStockImage(selectedSlide.visual.query) : null;

    if (publishMode === 'new') {
      // 🚀 امسح آخر ID قبل النشر الجديد
      setLastPostId(null);

      // ✅ مرر caption فاضي
      const res = await createFacebookPost({ imageUrl: imageUrl || undefined });
      setLastPostId(res?.post_id || null);
      setPublishMsg("✅ تم نشر شريحة جديدة بنجاح على فيسبوك!");
    } else if (publishMode === 'update') {
      if (!lastPostId) {
        setPublishMsg("❌ لا يوجد منشور سابق لتعديله.");
      } else {
        // ✅ تعديل فقط الكابشن (فاضي برضو)
        await updateFacebookPost(lastPostId, "");
        setPublishMsg("✏️ تم تعديل المنشور السابق بنجاح!");
      }
    }
  } catch (err) {
    console.error("Facebook publish error:", err);
    setPublishMsg("❌ فشل النشر/التعديل. تحقق من الإعدادات.");
  } finally {
    setIsPublishing(false);
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
        <div className="mb-8 flex justify-center border-b border-gray-200">
          <button
            onClick={() => setActiveTool('infographic')}
            className={`px-6 py-3 text-lg font-semibold border-b-4 transition-colors duration-300 ${activeTool === 'infographic' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            aria-pressed={activeTool === 'infographic'}
          >
            مولد الانفوجرافيك
          </button>
          <button
            onClick={() => setActiveTool('socialIcon')}
            className={`px-6 py-3 text-lg font-semibold border-b-4 transition-colors duration-300 ${activeTool === 'socialIcon' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            aria-pressed={activeTool === 'socialIcon'}
          >
            أيقونة السوشيال ميديا
          </button>
        </div>

        {activeTool === 'infographic' ? (
          <>
            <InputForm
              mainTitle={mainTitle}
              setMainTitle={setMainTitle}
              rawText={rawText}
              setRawText={setRawText}
              numberOfSlides={numberOfSlides}
              setNumberOfSlides={setNumberOfSlides}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              inputMode={inputMode}
              setInputMode={setInputMode}
              textChunks={textChunks}
              setTextChunks={setTextChunks}
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
              <>
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
                  socialIconUrl={socialIconUrl}
                  onSocialIconUpload={handleSocialIconUpload}
                  socialIconSize={socialIconSize}
                  onSocialIconSizeChange={setSocialIconSize}
                  socialIconPosition={socialIconPosition}
                  onSocialIconPositionChange={setSocialIconPosition}
                />

                {/* ✅ اختيار الشريحة للنشر */}
                <div className="mt-8 text-center">
                  <label className="block mb-2 font-medium">اختر الشريحة للنشر:</label>
                  <select
                    value={selectedSlideIndex}
                    onChange={(e) => setSelectedSlideIndex(Number(e.target.value))}
                    className="px-4 py-2 border rounded-lg"
                  >
                    {slides.map((s, i) => (
                      <option key={s.id} value={i}>
                        {i + 1} - {s.title}
                      </option>
                    ))}
                  </select>

                  {/* ✅ اختيار وضع النشر */}
                  <div className="mt-6">
                    <label className="block mb-2 font-medium">اختر وضع النشر:</label>
                    <select
                      value={publishMode}
                      onChange={(e) => setPublishMode(e.target.value as 'new' | 'update')}
                      className="px-4 py-2 border rounded-lg"
                    >
                      <option value="new">إنشاء منشور جديد</option>
                      <option value="update">تعديل آخر منشور</option>
                    </select>
                  </div>

                  <button
                    onClick={handlePublishToFacebook}
                    disabled={isPublishing}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isPublishing ? "جاري النشر..." : publishMode === 'new' ? "نشر جديد" : "تعديل المنشور"}
                  </button>

                  {publishMsg && (
                    <p className="mt-4 text-center text-lg font-semibold">{publishMsg}</p>
                  )}
                </div>
              </>
            )}
          </>
        ) : (
          <SocialIconGenerator />
        )}
      </main>

      <footer className="bg-white mt-12 py-4 border-t">
        <p className="text-center text-gray-500">تم التطوير بواسطة الذكاء الاصطناعي</p>
      </footer>
    </div>
  );
};

export default App;
