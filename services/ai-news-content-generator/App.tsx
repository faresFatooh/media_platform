import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  fetchRecentNews,
  generateNewsFromSource,
  generateAllAssets,
  translateText,
} from './services/geminiService';
import { GenerationMode, GeneratedResult, RecentNewsItem, SocialCaptions } from './types';
import {
  CopyIcon, CheckIcon, TranslateIcon, SpinnerIcon, FacebookIcon, InstagramIcon, TwitterIcon,
  LinkedinIcon, TiktokIcon, SnapchatIcon, DownloadIcon, ChevronLeftIcon, ChevronRightIcon,
  NewspaperIcon, ChartBarIcon, LightbulbIcon, PresentationChartLineIcon, PlusIcon, TrashIcon, VideoIcon,
  ShareIcon, PencilIcon
} from './components/Icons';

interface Persona {
  id: string;
  name: string;
  prompt: string;
}

const DEFAULT_PERSONAS: Persona[] = [
  {
    id: 'default-professional',
    name: 'صحفي احترافي',
    prompt: 'أعد صياغة هذا الخبر بأسلوب صحفي احترافي وموجز، مع الحفاظ على دقته وموضوعيته.',
  },
  {
    id: 'default-social',
    name: 'مؤثر اجتماعي',
    prompt: 'أعد صياغة هذا الخبر بأسلوب جذاب ومثير للاهتمام مناسب لمنصات التواصل الاجتماعي، استخدم لغة بسيطة وإيموجيز.',
  }
];

const socialIconMap: Record<keyof SocialCaptions, { icon: React.ReactNode; name: string }> = {
  facebook: { icon: <FacebookIcon />, name: 'Facebook' },
  instagram: { icon: <InstagramIcon />, name: 'Instagram' },
  x_twitter: { icon: <TwitterIcon />, name: 'X (Twitter)' },
  linkedin: { icon: <LinkedinIcon />, name: 'LinkedIn' },
  tiktok: { icon: <TiktokIcon />, name: 'TikTok' },
  snapchat: { icon: <SnapchatIcon />, name: 'Snapchat' },
};

const infographicIconMap: { [key: string]: React.ReactNode } = {
  newspaper: <NewspaperIcon className="w-12 h-12 mx-auto text-indigo-500" />,
  "chart-bar": <ChartBarIcon className="w-12 h-12 mx-auto text-indigo-500" />,
  lightbulb: <LightbulbIcon className="w-12 h-12 mx-auto text-indigo-500" />,
  "presentation-chart-line": <PresentationChartLineIcon className="w-12 h-12 mx-auto text-indigo-500" />,
  video: <VideoIcon className="w-12 h-12 mx-auto text-indigo-500" />,
};

const getInfographicIcon = (iconName: string) => {
    return infographicIconMap[iconName.toLowerCase()] || <NewspaperIcon className="w-12 h-12 mx-auto text-indigo-500" />;
}

const CopyButton = ({ textToCopy }: { textToCopy: string | undefined }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [textToCopy]);

  if (!textToCopy) return null;

  return (
    <button onClick={handleCopy} className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors" title="نسخ إلى الحافظة">
      {copied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <CopyIcon className="w-4 h-4" />}
    </button>
  );
};

const ShareButton = ({ platform, text }: { platform: keyof SocialCaptions, text: string }) => {
    const handleShare = useCallback(() => {
        const encodedText = encodeURIComponent(text);
        let url = '';

        switch(platform) {
            case 'x_twitter':
                url = `https://twitter.com/intent/tweet?text=${encodedText}`;
                window.open(url, '_blank', 'noopener,noreferrer');
                break;
            case 'facebook':
                 navigator.clipboard.writeText(text).then(() => {
                    alert('تم نسخ النص! الصقه في نافذة فيسبوك التي ستفتح الآن.');
                    window.open('https://facebook.com', '_blank', 'noopener,noreferrer');
                });
                break;
            case 'linkedin':
                navigator.clipboard.writeText(text).then(() => {
                    alert('تم نسخ النص! الصقه في نافذة لينكدإن التي ستفتح الآن.');
                    window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank', 'noopener,noreferrer');
                });
                break;
            default:
                 navigator.clipboard.writeText(text).then(() => {
                    alert(`تم نسخ نص ${socialIconMap[platform].name} إلى الحافظة.`);
                });
                break;
        }
    }, [platform, text]);
    
    return (
        <button onClick={handleShare} className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors" title={`مشاركة على ${socialIconMap[platform].name}`}>
            <ShareIcon className="w-4 h-4" />
        </button>
    );
};


const App: React.FC = () => {
  const [generationMode, setGenerationMode] = useState<GenerationMode>(GenerationMode.Recent);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({
    recent: false,
    generate: false,
    assets: false,
    translate: false,
  });
  const [error, setError] = useState<string | null>(null);
  
  const [sourceContent, setSourceContent] = useState('');
  const [customSources, setCustomSources] = useState<string[]>([]);
  const [newSource, setNewSource] = useState('');

  const [personas, setPersonas] = useState<Persona[]>(() => {
    try {
        const saved = localStorage.getItem('newsGenPersonas');
        return saved ? JSON.parse(saved) : DEFAULT_PERSONAS;
    } catch {
        return DEFAULT_PERSONAS;
    }
  });
  const [activePersonaId, setActivePersonaId] = useState<string>(personas[0]?.id || '');
  const [isManagingPersonas, setIsManagingPersonas] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Partial<Persona> | null>(null);

  const [recentNews, setRecentNews] = useState<RecentNewsItem[]>([]);
  const [generatedArticle, setGeneratedArticle] = useState<string>('');
  const [generatedResult, setGeneratedResult] = useState<GeneratedResult | null>(null);
  const [activeResultTab, setActiveResultTab] = useState('article');
  
  const [infographicIndex, setInfographicIndex] = useState(0);

  useEffect(() => {
    localStorage.setItem('newsGenPersonas', JSON.stringify(personas));
  }, [personas]);

  const setLoading = useCallback((key: string, value: boolean) => {
    setIsLoading(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleFetchRecentNews = useCallback(async () => {
    setLoading('recent', true);
    setError(null);
    setRecentNews([]);
    try {
      const news = await fetchRecentNews(customSources);
      setRecentNews(news);
    } catch (e) {
      // FIX: The error object 'e' is of type 'unknown'. We must check if it's an instance of Error before accessing 'e.message'.
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setLoading('recent', false);
    }
  }, [customSources, setLoading]);

  const handleGenerateArticle = useCallback(async () => {
    const activePersona = personas.find(p => p.id === activePersonaId);
    if (!activePersona) {
        setError('الرجاء اختيار سياسة تحرير.');
        return;
    }
    if (!sourceContent) {
      setError('الرجاء إدخال محتوى المصدر (روابط أو نص).');
      return;
    }
    setLoading('generate', true);
    setError(null);
    setGeneratedArticle('');
    setGeneratedResult(null);
    try {
      const article = await generateNewsFromSource(sourceContent, activePersona.prompt, generationMode);
      setGeneratedArticle(article);
    } catch (e) {
      // FIX: The error object 'e' is of type 'unknown'. We must check if it's an instance of Error before accessing 'e.message'.
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setLoading('generate', false);
    }
  }, [sourceContent, activePersonaId, personas, generationMode, setLoading]);
  
  const handleGenerateAssets = useCallback(async () => {
    if (!generatedArticle) {
        setError('يجب توليد المقال أولاً.');
        return;
    }
    setLoading('assets', true);
    setError(null);
    try {
      const assets = await generateAllAssets(generatedArticle);
      setGeneratedResult(assets);
      setActiveResultTab('article');
      setInfographicIndex(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setLoading('assets', false);
    }
  }, [generatedArticle, setLoading]);

  const handleTranslate = useCallback(async () => {
      if (!generatedResult?.article) return;
      setLoading('translate', true);
      try {
          const translation = await translateText(generatedResult.article);
          setGeneratedResult(prev => prev ? { ...prev, translatedArticle: translation } : null);
      } catch (e) {
          setError(e instanceof Error ? e.message : 'Translation failed.');
      } finally {
          setLoading('translate', false);
      }
  }, [generatedResult, setLoading]);

  const handleAddSource = () => {
    if (newSource && !customSources.includes(newSource)) {
      setCustomSources([...customSources, newSource]);
      setNewSource('');
    }
  };

  const handleRemoveSource = (sourceToRemove: string) => {
    setCustomSources(customSources.filter(source => source !== sourceToRemove));
  };
    
  const handleSavePersona = () => {
    if (!editingPersona || !editingPersona.name || !editingPersona.prompt) {
        alert("الرجاء إدخال اسم وتعليمات للـ Persona.");
        return;
    }
    if (editingPersona.id) { // Update
        setPersonas(personas.map(p => p.id === editingPersona.id ? editingPersona as Persona : p));
    } else { // Create
        const newPersona: Persona = { ...editingPersona, id: crypto.randomUUID() } as Persona;
        setPersonas([...personas, newPersona]);
    }
    setEditingPersona(null);
  };

  const handleDeletePersona = (id: string) => {
    if (personas.length <= 1) {
        alert("يجب أن يكون لديك Persona واحدة على الأقل.");
        return;
    }
    if (confirm("هل أنت متأكد من حذف هذه الـ Persona؟")) {
        setPersonas(personas.filter(p => p.id !== id));
        if (activePersonaId === id) {
            setActivePersonaId(personas[0]?.id || '');
        }
    }
  };

  const handleRecentNewsClick = (newsItem: RecentNewsItem) => {
    setSourceContent(`${newsItem.title}\n\n${newsItem.snippet}`);
    setGenerationMode(GenerationMode.Text);
  };
  
  const currentSlide = useMemo(() => {
    return generatedResult?.infographicSlides[infographicIndex];
  }, [generatedResult, infographicIndex]);

  const nextSlide = () => {
    if (generatedResult) {
      setInfographicIndex((prev) => (prev + 1) % generatedResult.infographicSlides.length);
    }
  };

  const prevSlide = () => {
    if (generatedResult) {
      setInfographicIndex((prev) => (prev - 1 + generatedResult.infographicSlides.length) % generatedResult.infographicSlides.length);
    }
  };


  return (
    <div className="bg-gray-50 min-h-screen font-sans" dir="rtl">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-800">مولّد المحتوى الإخباري</h1>
            <p className="text-sm text-gray-500">أداة ذكية لإنشاء وإعادة صياغة الأخبار والمحتوى التسويقي بسرعة وكفاءة.</p>
        </div>
      </header>
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Input Panel */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">1. اختر المصدر</h2>
                 <div className="flex border-b border-gray-200 mb-4">
                    {(Object.values(GenerationMode)).map((mode) => (
                        <button key={mode} onClick={() => setGenerationMode(mode)} className={`px-4 py-2 -mb-px text-sm font-medium transition-colors duration-200 ${generationMode === mode ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            { {recent: 'أخبار حديثة', url: 'من رابط', text: 'من نص'}[mode] }
                        </button>
                    ))}
                </div>

                {/* Content based on mode */}
                {generationMode === GenerationMode.Recent && (
                  <div>
                    <h3 className="font-semibold mb-2 text-gray-600">إضافة مصادر أخبار مخصصة</h3>
                    <div className="flex gap-2 mb-2">
                        <input type="text" value={newSource} onChange={(e) => setNewSource(e.target.value)} placeholder="مثال: BBC Arabic" className="flex-grow p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"/>
                        <button onClick={handleAddSource} className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 flex items-center gap-1"><PlusIcon className="w-4 h-4" /> إضافة</button>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {customSources.map(s => (
                            <span key={s} className="flex items-center gap-1 bg-gray-100 text-gray-700 text-sm px-2 py-1 rounded-full">
                                {s}
                                <button onClick={() => handleRemoveSource(s)}><TrashIcon className="w-3 h-3 text-gray-500 hover:text-red-500"/></button>
                            </span>
                        ))}
                    </div>
                    <button onClick={handleFetchRecentNews} disabled={isLoading.recent} className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center gap-2">
                         {isLoading.recent ? <SpinnerIcon /> : null}
                         جلب آخر الأخبار
                    </button>
                    {recentNews.length > 0 && (
                        <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-2">
                            {recentNews.map((item, index) => (
                                <div key={index} onClick={() => handleRecentNewsClick(item)} className="p-3 border rounded-md hover:bg-gray-100 cursor-pointer">
                                    <p className="font-semibold text-gray-800">{item.title}</p>
                                    <p className="text-sm text-gray-500">{item.snippet}</p>
                                </div>
                            ))}
                        </div>
                    )}
                  </div>
                )}

                {(generationMode === GenerationMode.URL || generationMode === GenerationMode.Text) && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {generationMode === GenerationMode.URL ? 'روابط المصادر (رابط واحد في كل سطر)' : 'نص المصدر'}
                        </label>
                        <textarea value={sourceContent} onChange={(e) => setSourceContent(e.target.value)} rows={generationMode === GenerationMode.URL ? 3 : 7} placeholder={generationMode === GenerationMode.URL ? 'https://example.com/news-article' : 'الصق النص هنا...'} className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                    </div>
                )}
                
                <hr className="my-6" />

                <h2 className="text-xl font-semibold mb-4 text-gray-700">2. توليد الخبر</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="persona" className="block text-sm font-medium text-gray-700 mb-1">سياسة التحرير (Persona)</label>
                        <div className="flex items-center gap-2">
                            <select id="persona" value={activePersonaId} onChange={(e) => setActivePersonaId(e.target.value)} className="w-full p-2 border bg-white rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                                {personas.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <button onClick={() => setIsManagingPersonas(!isManagingPersonas)} className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                                {isManagingPersonas ? 'إغلاق' : 'إدارة'}
                            </button>
                        </div>
                    </div>

                    {isManagingPersonas && (
                        <div className="p-4 border rounded-md bg-gray-50 space-y-4">
                            <h4 className="font-semibold text-gray-700">إدارة سياسات التحرير</h4>
                            <div className="space-y-2">
                                {personas.map(p => (
                                    <div key={p.id} className="flex justify-between items-center bg-white p-2 rounded border text-sm">
                                        <span className="font-medium text-gray-800">{p.name}</span>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setEditingPersona(p)} title="تعديل"><PencilIcon className="text-gray-500 hover:text-blue-500"/></button>
                                            <button onClick={() => handleDeletePersona(p.id)} title="حذف"><TrashIcon className="text-gray-500 hover:text-red-500"/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {editingPersona ? (
                                <div className="p-3 border-t space-y-2">
                                    <h5 className="font-semibold text-sm">{editingPersona.id ? 'تعديل' : 'إضافة'} Persona</h5>
                                    <input type="text" placeholder="اسم الـ Persona (مثال: محرر اقتصادي)" value={editingPersona.name || ''} onChange={e => setEditingPersona({...editingPersona, name: e.target.value})} className="w-full p-2 text-sm border rounded-md"/>
                                    <textarea placeholder="أدخل تعليمات الصياغة هنا..." value={editingPersona.prompt || ''} onChange={e => setEditingPersona({...editingPersona, prompt: e.target.value})} rows={4} className="w-full p-2 text-sm border rounded-md"></textarea>
                                    <div className="flex gap-2">
                                        <button onClick={handleSavePersona} className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700">حفظ</button>
                                        <button onClick={() => setEditingPersona(null)} className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300">إلغاء</button>
                                    </div>
                                </div>
                            ) : (
                                <button onClick={() => setEditingPersona({name: '', prompt: ''})} className="w-full mt-2 px-3 py-2 bg-white border text-indigo-600 text-sm rounded-md hover:bg-gray-50 flex items-center justify-center gap-2">
                                    <PlusIcon className="w-4 h-4"/> إضافة Persona جديدة
                                </button>
                            )}
                        </div>
                    )}

                     <button onClick={handleGenerateArticle} disabled={isLoading.generate || generationMode === GenerationMode.Recent} className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-green-300 flex items-center justify-center gap-2">
                        {isLoading.generate ? <SpinnerIcon /> : null}
                        توليد الخبر
                    </button>
                </div>
                
                {generatedArticle && (
                    <div className="mt-6 border-t pt-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">3. توليد المرفقات</h2>
                        <div className="bg-gray-100 p-3 rounded-md mb-4 max-h-40 overflow-y-auto">
                            <p className="text-sm text-gray-800 whitespace-pre-wrap">{generatedArticle}</p>
                        </div>
                        <button onClick={handleGenerateAssets} disabled={isLoading.assets} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center gap-2">
                             {isLoading.assets ? <SpinnerIcon /> : null}
                            توليد جميع المرفقات
                        </button>
                    </div>
                )}

            </div>

            {/* Result Panel */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 min-h-[500px]">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">النتائج</h2>
                {isLoading.assets ? (
                    <div className="flex items-center justify-center h-full"><SpinnerIcon className="w-8 h-8 text-indigo-500" /></div>
                ) : error ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>
                ) : !generatedResult ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                        <NewspaperIcon className="w-16 h-16 mb-4" />
                        <p>ستظهر الأصول المُولَّدة هنا بعد اكتمال العملية.</p>
                    </div>
                ) : (
                    <div>
                        <div className="flex border-b border-gray-200 mb-4">
                            {Object.entries({article: 'المقال والصورة', social: 'منصات التواصل', infographic: 'انفوجرافيك', seo: 'SEO والميتا'}).map(([key, value]) => (
                                <button key={key} onClick={() => setActiveResultTab(key)} className={`px-4 py-2 -mb-px text-sm font-medium transition-colors duration-200 ${activeResultTab === key ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                                    {value}
                                </button>
                            ))}
                        </div>
                        {activeResultTab === 'article' && (
                            <div className="space-y-4">
                                {generatedResult.generatedImage && (
                                  <div className="relative">
                                    <img src={`data:image/jpeg;base64,${generatedResult.generatedImage}`} alt="Generated visual" className="w-full rounded-lg object-cover" />
                                     <a href={`data:image/jpeg;base64,${generatedResult.generatedImage}`} download="generated-image.jpg" className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors">
                                        <DownloadIcon />
                                    </a>
                                  </div>
                                )}
                                {generatedResult.imageCaption && (
                                    <div className="flex justify-between items-start mt-2 bg-gray-100 p-3 text-sm text-gray-700 rounded-md">
                                        <p className="italic">{generatedResult.imageCaption}</p>
                                        <CopyButton textToCopy={generatedResult.imageCaption} />
                                    </div>
                                )}
                                {generatedResult.headlineSuggestions && (
                                    <div>
                                        <h4 className="font-semibold mt-4 mb-2 text-gray-800">عناوين مقترحة</h4>
                                        <div className="space-y-2">
                                            {generatedResult.headlineSuggestions.map((headline, i) => (
                                                <div key={i} className="flex items-center justify-between bg-gray-50 p-2 rounded-md border">
                                                    <p className="text-sm text-gray-800">{headline}</p>
                                                    <CopyButton textToCopy={headline} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {generatedResult.subheadings && (
                                    <div>
                                        <h4 className="font-semibold mt-4 mb-2 text-gray-800">عناوين فرعية مقترحة</h4>
                                        <div className="space-y-2">
                                            {generatedResult.subheadings.map((sub, i) => (
                                                <div key={i} className="flex items-center justify-between bg-gray-50 p-2 rounded-md border">
                                                    <p className="text-sm text-gray-800">{sub}</p>
                                                    <CopyButton textToCopy={sub} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="bg-gray-100 p-4 rounded-md mt-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-semibold text-gray-800">المقال النهائي</h3>
                                        <div className="flex items-center gap-1">
                                            <CopyButton textToCopy={generatedResult.article} />
                                            <button onClick={handleTranslate} disabled={isLoading.translate} className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors" title="Translate to English">
                                                {isLoading.translate ? <SpinnerIcon className="w-4 h-4" /> : <TranslateIcon className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 whitespace-pre-wrap">{generatedResult.article}</p>
                                </div>
                                {generatedResult.translatedArticle && (
                                    <div className="bg-blue-50 p-4 rounded-md">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="font-semibold text-gray-800">الترجمة الإنجليزية</h3>
                                            <CopyButton textToCopy={generatedResult.translatedArticle} />
                                        </div>
                                        <p className="text-gray-700 whitespace-pre-wrap">{generatedResult.translatedArticle}</p>
                                    </div>
                                )}
                            </div>
                        )}
                        {activeResultTab === 'social' && (
                           <div className="space-y-3">
                                {Object.entries(generatedResult.socialCaptions).map(([platform, caption]) => (
                                    <div key={platform} className="bg-gray-50 p-3 rounded-md border">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2 text-gray-700 font-semibold">
                                                {socialIconMap[platform as keyof SocialCaptions].icon}
                                                <span>{socialIconMap[platform as keyof SocialCaptions].name}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <CopyButton textToCopy={caption} />
                                                <ShareButton platform={platform as keyof SocialCaptions} text={caption} />
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{caption}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                         {activeResultTab === 'infographic' && currentSlide && (
                            <div className="text-center p-4 border rounded-lg bg-gray-50 relative">
                                {getInfographicIcon(currentSlide.icon)}
                                <h4 className="text-lg font-bold mt-4 text-gray-800">{currentSlide.title}</h4>
                                <p className="mt-2 text-gray-600 min-h-[4em]">{currentSlide.content}</p>
                                <div className="absolute top-1/2 -translate-y-1/2 left-2">
                                    <button onClick={prevSlide} className="p-2 rounded-full bg-white shadow hover:bg-gray-100"><ChevronLeftIcon /></button>
                                </div>
                                <div className="absolute top-1/2 -translate-y-1/2 right-2">
                                    <button onClick={nextSlide} className="p-2 rounded-full bg-white shadow hover:bg-gray-100"><ChevronRightIcon /></button>
                                </div>
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                    {generatedResult.infographicSlides.map((_, i) => (
                                        <div key={i} className={`w-2 h-2 rounded-full ${i === infographicIndex ? 'bg-indigo-500' : 'bg-gray-300'}`}></div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {activeResultTab === 'seo' && (
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-semibold mb-2 text-gray-800">وصف الميتا (Meta Description)</h4>
                                    <div className="bg-gray-50 p-3 rounded-md border flex justify-between items-start">
                                        <p className="text-sm text-gray-600">{generatedResult.metaDescription}</p>
                                        <CopyButton textToCopy={generatedResult.metaDescription} />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2 text-gray-800">الرابط المقترح (URL Slug)</h4>
                                    <div className="bg-gray-50 p-3 rounded-md border flex justify-between items-center" dir="ltr">
                                        <p className="text-sm text-gray-600 font-mono">{generatedResult.urlSlug}</p>
                                        <CopyButton textToCopy={generatedResult.urlSlug} />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2 text-gray-800">النقاط الرئيسية</h4>
                                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                                        {generatedResult.keyPoints.map((point, i) => <li key={i}>{point}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2 text-gray-800">الكلمات المفتاحية (SEO)</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {generatedResult.seoKeywords.map((keyword, i) => (
                                            <span key={i} className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-full">{keyword}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;