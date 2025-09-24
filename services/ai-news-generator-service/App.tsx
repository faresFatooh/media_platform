
import { getStyles } from './services/apiService';   
import React, { useState, useCallback, useEffect } from 'react';
import { InputType, BreakingNewsItem, GeneratedArticle, EditorialStyle, CustomNewsSource, MonitoredSource, MonitoredContentItem } from './types';
import { generateNewsArticle, fetchBreakingNews, generateImageForArticle, fetchAllMonitoredContent } from './services/geminiService';
import { BookOpen, Newspaper, Link as LinkIcon, Type as TypeIcon, FileText, PlusCircle, Wand2, Tv, Download, Share2, Clipboard, Image, X, Twitter, Facebook, Settings, Trash2, Instagram, Linkedin, MessageSquare, Pencil, Save, Ban, Monitor, RefreshCw } from 'lucide-react';

// Custom hook for localStorage
function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  return [storedValue, setValue];
}

const socialIcons: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
    facebook: Facebook,
    twitter: Twitter,
    instagram: Instagram,
    linkedin: Linkedin,
    whatsapp: MessageSquare,
    tiktok: Share2, // Using a generic icon for TikTok
};


const Header: React.FC<{onOpenBreakingNews: () => void; hasNewNews: boolean; onOpenMonitor: () => void;}> = ({onOpenBreakingNews, hasNewNews, onOpenMonitor}) => (
    <header className="bg-gray-900/50 backdrop-blur-sm p-4 border-b border-gray-700 sticky top-0 z-20">
        <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
                <Newspaper className="text-cyan-400 w-8 h-8" />
                <h1 className="text-2xl font-bold text-white tracking-tight">مولّد الأخبار بالذكاء الاصطناعي</h1>
            </div>
            <div className="flex items-center gap-4">
                <button
                    onClick={onOpenMonitor}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                    <Monitor className="w-5 h-5" />
                    <span>مراقبة</span>
                </button>
                <button
                    onClick={onOpenBreakingNews}
                    className="relative flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                >
                    {hasNewNews && (
                        <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                    )}
                    <Tv className="w-5 h-5" />
                    <span>أخبار آخر ساعة</span>
                </button>
            </div>
        </div>
    </header>
);

const EditorialStyleSelector: React.FC<{ 
    styles: EditorialStyle[];
    selectedStyleId: string;
    onSelectStyle: (id: string) => void;
    onManageStyles: () => void;
}> = ({ styles, selectedStyleId, onSelectStyle, onManageStyles }) => {
    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-3 text-gray-100"><BookOpen className="text-cyan-400"/>حدد الأسلوب التحريري</h2>
            <div className="flex items-center gap-4">
                <select
                    value={selectedStyleId}
                    onChange={(e) => onSelectStyle(e.target.value)}
                    className="flex-grow bg-gray-900 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-3"
                >
                    <option value="">-- اختر أسلوبًا --</option>
                    {styles.map(style => (
                        <option key={style.id} value={style.id}>{style.name}</option>
                    ))}
                </select>
                <button onClick={onManageStyles} className="flex items-center gap-2 px-4 py-3 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors">
                    <Settings className="w-5 h-5" />
                    <span>إدارة</span>
                </button>
            </div>
        </div>
    );
};

const InputSource: React.FC<{ onInputsChange: (inputs: {type: string; value: string | File}[])=> void, initialInputs: {type: string; value: string}[] }> = ({ onInputsChange, initialInputs }) => {
    
    const [inputs, setInputs] = useState<( {id: number, type: InputType, value: string | File} )[]>(
        initialInputs.length > 0
        ? initialInputs.map((input, index) => ({ id: Date.now() + index, type: InputType.TEXT, value: input.value }))
        : [{ id: Date.now(), type: InputType.TITLE, value: '' }]
    );
    
    useEffect(() => {
        if(initialInputs.length > 0) {
           const newInputs = initialInputs.map((input, index) => ({ id: Date.now() + index, type: InputType.TEXT, value: input.value }));
           setInputs(newInputs);
        } else {
           // Clear inputs if selection is cleared (e.g. after generation)
           setInputs([{ id: Date.now(), type: InputType.TITLE, value: '' }]);
        }
    }, [initialInputs])

    useEffect(() => {
        onInputsChange(inputs.map(({type, value})=> ({type, value})));
    }, [inputs, onInputsChange]);

    const addInput = () => {
        setInputs([...inputs, { id: Date.now(), type: InputType.TITLE, value: '' }]);
    };
    
    const removeInput = (id: number) => {
        setInputs(inputs.filter(input => input.id !== id));
    };

    const updateInput = (id: number, newType?: InputType, newValue?: string | File) => {
        setInputs(inputs.map(input => {
            if (input.id === id) {
                const updatedInput = { ...input };
                if (newType) updatedInput.type = newType;
                if (newValue !== undefined) updatedInput.value = newValue;
                 if(newType && input.type !== newType) updatedInput.value = '';
                return updatedInput;
            }
            return input;
        }));
    };

    const renderInput = (input: {id: number, type: InputType, value: string | File}) => {
        const commonInputClass = "w-full p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition text-gray-200";
        switch (input.type) {
            case InputType.FILE:
                return <input type="file" accept="image/*,audio/*,video/*,application/pdf,.doc,.docx" onChange={(e) => e.target.files && updateInput(input.id, undefined, e.target.files[0])} className={`${commonInputClass} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100`}/>;
            case InputType.TEXT:
                return <textarea value={input.value as string} onChange={(e) => updateInput(input.id, undefined, e.target.value)} placeholder="أدخل نصًا جاهزًا..." className={`${commonInputClass} h-24`}/>;
            default:
                return <input type="text" value={input.value as string} onChange={(e) => updateInput(input.id, undefined, e.target.value)} placeholder={input.type === InputType.TITLE ? "أدخل عنوانًا فقط..." : "أدخل رابط موقع..."} className={commonInputClass}/>;
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-3 text-gray-100"><Wand2 className="text-cyan-400"/>مصادر توليد الخبر</h2>
                <button onClick={addInput} className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 transition-colors text-sm">
                    <PlusCircle className="w-4 h-4" />
                    <span>إضافة مصدر</span>
                </button>
            </div>
            <div className="space-y-4">
            {inputs.map((input) => (
                <div key={input.id} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                         <select value={input.type} onChange={(e) => updateInput(input.id, e.target.value as InputType)} className="bg-gray-700 border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-48 p-2">
                            <option value={InputType.TITLE}>عنوان فقط</option>
                            <option value={InputType.TEXT}>نص جاهز</option>
                            <option value={InputType.URL}>رابط موقع</option>
                            <option value={InputType.FILE}>ملف (صورة, صوت, PDF...)</option>
                         </select>
                         {inputs.length > 1 && (
                            <button onClick={() => removeInput(input.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    {renderInput(input)}
                </div>
            ))}
            </div>
        </div>
    );
};

const GeneratedArticleDisplay: React.FC<{ article: GeneratedArticle; onArticleUpdate: (updatedArticle: GeneratedArticle, improveStyle: boolean) => void; }> = ({ article, onArticleUpdate }) => {
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [imageError, setImageError] = useState<string | null>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [editedHeadline, setEditedHeadline] = useState(article.headline);
    const [editedBody, setEditedBody] = useState(article.body);

    useEffect(() => {
        setEditedHeadline(article.headline);
        setEditedBody(article.body);
        setIsEditing(false);
    }, [article]);

    const handleGenerateImage = async () => {
        if (!article) return;
        setIsImageLoading(true);
        setImageError(null);
        setGeneratedImage(null);
        const image = await generateImageForArticle(article.headline);
        if (image) {
            setGeneratedImage(image);
        } else {
            setImageError("فشل توليد الصورة. الرجاء المحاولة مرة أخرى.");
        }
        setIsImageLoading(false);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("تم نسخ النص!");
    };
    
    const exportToWord = () => {
        if (!article) return;
        const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML to Word Document</title></head><body dir="rtl">`;
        const footer = "</body></html>";
        const sourceHTML = header + `<h1>${article.headline}</h1>` + article.body.replace(/\n/g, '<br/>') + footer;
        
        const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
        const fileDownload = document.createElement("a");
        document.body.appendChild(fileDownload);
        fileDownload.href = source;
        fileDownload.download = 'article.doc';
        fileDownload.click();
        document.body.removeChild(fileDownload);
    }
    
     const handleSaveAndImprove = () => {
        const updatedArticle = { ...article, headline: editedHeadline, body: editedBody };
        onArticleUpdate(updatedArticle, true);
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setEditedHeadline(article.headline);
        setEditedBody(article.body);
        setIsEditing(false);
    };
    
    if (!article) return null;

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 mt-6">
            <div className="flex justify-between items-center mb-4">
                {isEditing ? (
                     <input 
                        type="text" 
                        value={editedHeadline} 
                        onChange={(e) => setEditedHeadline(e.target.value)}
                        className="w-full text-2xl font-bold bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 text-cyan-400"
                    />
                ) : (
                    <h2 className="text-2xl font-bold text-cyan-400">{article.headline}</h2>
                )}
                 <div className="flex gap-2">
                    {isEditing ? (
                        <>
                         <button onClick={handleSaveAndImprove} className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                                <Save size={16}/> حفظ وتحسين
                            </button>
                            <button onClick={handleCancelEdit} className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
                                <Ban size={16}/> إلغاء
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors text-sm">
                            <Pencil size={16}/> تعديل وتحسين
                        </button>
                    )}
                </div>
            </div>
            
             {isEditing ? (
                 <textarea 
                    value={editedBody} 
                    onChange={(e) => setEditedBody(e.target.value)}
                    className="w-full h-96 p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 text-gray-300 whitespace-pre-wrap dark-scrollbar"
                />
             ) : (
                <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: article.body.replace(/\n/g, '<br />') }}></div>
             )}
            
            <div className="mt-6">
                <h3 className="font-bold text-lg text-gray-200 mb-2">الكلمات المفتاحية (SEO)</h3>
                <div className="flex flex-wrap gap-2">
                    {article.seoKeywords.map((keyword, i) => <span key={i} className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">{keyword}</span>)}
                </div>
            </div>

            {article.keyPoints && article.keyPoints.length > 0 && (
                 <div className="mt-6 border-t border-gray-700 pt-6">
                    <h3 className="font-bold text-lg text-gray-200 mb-3">أهم النقاط</h3>
                    <ul className="space-y-2">
                        {article.keyPoints.map((point, i) => (
                            <li key={i} className="flex items-center gap-3 bg-gray-900/40 p-2 rounded-md">
                                <span className="text-cyan-400">●</span>
                                <p className="flex-1 text-gray-300">{point}</p>
                                <button onClick={() => copyToClipboard(point)} className="text-gray-400 hover:text-cyan-400 p-1 rounded-full hover:bg-gray-700 transition-colors">
                                    <Clipboard className="w-4 h-4"/>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="mt-6 border-t border-gray-700 pt-6">
                 <h3 className="font-bold text-lg text-gray-200 mb-4">توليد ونشر</h3>
                 <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-900/50 p-4 rounded-lg">
                        <h4 className="font-bold mb-3 text-gray-200">1. توليد صورة للمقال</h4>
                        <button onClick={handleGenerateImage} disabled={isImageLoading} className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed">
                            <Image className="w-5 h-5" />
                            {isImageLoading ? 'جاري التوليد...' : 'توليد صورة بالذكاء الاصطناعي'}
                        </button>
                        {isImageLoading && <div className="mt-4 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>}
                        {imageError && <p className="text-red-400 mt-2 text-sm">{imageError}</p>}
                        {generatedImage && <img src={generatedImage} alt="Generated for article" className="mt-4 rounded-lg shadow-lg"/>}
                    </div>

                    <div className="bg-gray-900/50 p-4 rounded-lg">
                        <h4 className="font-bold mb-3 text-gray-200">2. تصدير وتوزيع</h4>
                        <div className="space-y-3">
                           <button onClick={exportToWord} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                             <Download className="w-5 h-5"/> <span>تصدير كملف Word</span>
                           </button>
                           <div className="pt-2">
                           {article.socialPosts.map(post => {
                                const platformKey = post.platform.toLowerCase();
                                const Icon = socialIcons[platformKey] || Share2;
                                return (
                                <div key={post.platform} className="mb-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <h5 className="font-semibold text-gray-300 flex items-center gap-2"><Icon className="w-4 h-4"/>{post.platform}</h5>
                                        <button onClick={() => copyToClipboard(post.content)} className="text-gray-400 hover:text-cyan-400">
                                            <Clipboard className="w-4 h-4"/>
                                        </button>
                                    </div>
                                    <p className="text-sm bg-gray-800 p-2 rounded text-gray-400">{post.content}</p>
                                </div>
                                )
                            })}
                           </div>
                        </div>
                    </div>
                 </div>
            </div>
        </div>
    );
};

const BreakingNewsModal: React.FC<{
    isOpen: boolean; 
    onClose: () => void; 
    onSelectNews: (news: BreakingNewsItem)=>void;
    news: BreakingNewsItem[];
    isLoading: boolean;
    onRefresh: () => void;
    customSources: CustomNewsSource[];
    onSourcesChange: (sources: CustomNewsSource[]) => void;
}> = ({isOpen, onClose, onSelectNews, news, isLoading, onRefresh, customSources, onSourcesChange}) => {
    const [newSourceUrl, setNewSourceUrl] = useState('');

    const addSource = () => {
        if (newSourceUrl && !customSources.some(s => s.url === newSourceUrl)) {
            onSourcesChange([...customSources, { id: `cs-${Date.now()}`, url: newSourceUrl }]);
            setNewSourceUrl('');
        }
    };
    
    const removeSource = (id: string) => {
        onSourcesChange(customSources.filter(s => s.id !== id));
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-30">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl border border-gray-700 max-h-[80vh] flex flex-col">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">أخبار آخر ساعة</h2>
                    <div>
                         <button onClick={onRefresh} disabled={isLoading} className="text-gray-400 hover:text-white mr-4 disabled:text-gray-600 disabled:cursor-not-allowed">
                            <RefreshCw className={isLoading ? 'animate-spin' : ''} />
                         </button>
                         <button onClick={onClose} className="text-gray-400 hover:text-white"><X/></button>
                    </div>
                </div>
                <div className="p-6 overflow-y-auto dark-scrollbar">
                    {isLoading ? (
                         <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div></div>
                    ) : (
                        <div className="space-y-4">
                            {news.length > 0 ? news.map((item, index) => (
                                <div key={index} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-cyan-400">{item.headline}</h3>
                                        {item.publicationTime && (
                                            <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{item.publicationTime}</span>
                                        )}
                                    </div>
                                    <p className="text-gray-300 mt-1">{item.summary}</p>
                                    {item.source && (
                                        <a href={item.source.uri} target="_blank" rel="noopener noreferrer" className="mt-2 text-xs text-gray-400 hover:text-cyan-400 flex items-center gap-1 transition-colors">
                                           <LinkIcon size={12}/> {item.source.title || 'المصدر'}
                                        </a>
                                    )}
                                    <button onClick={()=>{onSelectNews(item); onClose();}} className="mt-3 px-3 py-1 bg-cyan-600 text-white text-sm rounded hover:bg-cyan-700 transition-colors">
                                        تحويل إلى خبر
                                    </button>
                                </div>
                            )) : <p className="text-gray-400 text-center">لا توجد أخبار حالياً، حاول التحديث لاحقاً.</p>}
                        </div>
                    )}
                </div>
                <div className="p-4 border-t border-gray-700 bg-gray-800/50">
                    <h3 className="text-lg font-semibold mb-2 text-gray-200">إدارة المصادر المخصصة</h3>
                    <div className="flex gap-2 mb-3">
                        <input type="url" value={newSourceUrl} onChange={e => setNewSourceUrl(e.target.value)} placeholder="أضف رابط موقع، قناة تيليجرام..." className="flex-grow p-2 bg-gray-900 border border-gray-600 rounded-md text-gray-200"/>
                        <button onClick={addSource} className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700">إضافة</button>
                    </div>
                    <ul className="space-y-1 max-h-24 overflow-y-auto dark-scrollbar">
                        {customSources.map(source => (
                            <li key={source.id} className="flex justify-between items-center text-sm bg-gray-700/50 p-1.5 rounded">
                                <span className="text-gray-300 truncate">{source.url}</span>
                                <button onClick={() => removeSource(source.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

const EditorialStyleModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    styles: EditorialStyle[];
    onSave: (styles: EditorialStyle[]) => void;
}> = ({ isOpen, onClose, styles, onSave }) => {
    const [localStyles, setLocalStyles] = useState<EditorialStyle[]>([]);
    const [editingStyle, setEditingStyle] = useState<EditorialStyle | null>(null);

    useEffect(() => {
        setLocalStyles(JSON.parse(JSON.stringify(styles)));
    }, [styles, isOpen]);

    const handleSave = () => {
        onSave(localStyles);
        onClose();
    };

    const addStyle = () => {
        const newStyle = { id: `style-${Date.now()}`, name: 'أسلوب جديد', content: '' };
        setLocalStyles([...localStyles, newStyle]);
        setEditingStyle(newStyle);
    };

    const deleteStyle = (id: string) => {
        setLocalStyles(localStyles.filter(s => s.id !== id));
        if (editingStyle?.id === id) {
            setEditingStyle(null);
        }
    };
    
    const updateStyle = (id: string, field: 'name' | 'content', value: string) => {
        const updatedStyles = localStyles.map(s => s.id === id ? {...s, [field]: value} : s);
        setLocalStyles(updatedStyles);
        if (editingStyle?.id === id) {
            setEditingStyle(updatedStyles.find(s => s.id === id) || null);
        }
    };

    if (!isOpen) return null;

    return (
         <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-40">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl border border-gray-700 max-h-[90vh] flex flex-col">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">إدارة الأساليب التحريرية</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X/></button>
                </div>
                <div className="flex-grow p-6 overflow-hidden grid grid-cols-3 gap-6">
                    <div className="col-span-1 flex flex-col bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                        <button onClick={addStyle} className="w-full flex items-center justify-center gap-2 px-4 py-2 mb-4 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors">
                            <PlusCircle className="w-5 h-5"/> إضافة أسلوب
                        </button>
                        <ul className="overflow-y-auto dark-scrollbar space-y-2">
                           {localStyles.map(style => (
                               <li key={style.id} onClick={() => setEditingStyle(style)} className={`p-3 rounded-md cursor-pointer transition-colors flex justify-between items-center ${editingStyle?.id === style.id ? 'bg-cyan-800/50' : 'hover:bg-gray-700/50'}`}>
                                   <span className="truncate">{style.name}</span>
                                   <button onClick={(e) => { e.stopPropagation(); deleteStyle(style.id); }} className="text-gray-500 hover:text-red-500"><Trash2 size={16}/></button>
                               </li>
                           ))}
                        </ul>
                    </div>
                    <div className="col-span-2 flex flex-col bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                       {editingStyle ? (
                           <>
                           <label className="text-gray-400 mb-2">اسم الأسلوب</label>
                           <input type="text" value={editingStyle.name} onChange={e => updateStyle(editingStyle.id, 'name', e.target.value)} className="w-full p-2 mb-4 bg-gray-700 border border-gray-600 rounded-md text-white"/>
                           <label className="text-gray-400 mb-2">المحتوى (نص أو رابط موقع)</label>
                           <textarea value={editingStyle.content} onChange={e => updateStyle(editingStyle.id, 'content', e.target.value)} className="w-full flex-grow p-3 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 text-gray-200 dark-scrollbar" placeholder="مثال: انسخ فقرة من موقع إخباري أو ضع رابط الموقع هنا..."/>
                           </>
                       ) : (
                           <div className="flex items-center justify-center h-full text-gray-500">
                               <p>اختر أسلوبًا لتحريره أو أضف أسلوبًا جديدًا.</p>
                           </div>
                       )}
                    </div>
                </div>
                 <div className="p-4 border-t border-gray-700 flex justify-end">
                    <button onClick={handleSave} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">حفظ وإغلاق</button>
                </div>
            </div>
        </div>
    );
};

const MonitorModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    monitoredSources: MonitoredSource[];
    onSourcesChange: (sources: MonitoredSource[]) => void;
    onSelectContent: (content: MonitoredContentItem) => void;
}> = ({ isOpen, onClose, monitoredSources, onSourcesChange, onSelectContent }) => {
    const [newSourceUrl, setNewSourceUrl] = useState('');
    const [content, setContent] = useState<MonitoredContentItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isContinuous, setIsContinuous] = useState(false);
    // FIX: The return type of `setInterval` in the browser is `number`, not `NodeJS.Timeout`.
    const intervalRef = React.useRef<number | null>(null);

    const addSource = () => {
        if (newSourceUrl && !monitoredSources.some(s => s.url === newSourceUrl)) {
            onSourcesChange([...monitoredSources, { id: `ms-${Date.now()}`, url: newSourceUrl }]);
            setNewSourceUrl('');
        }
    };
    
    const removeSource = (id: string) => {
        onSourcesChange(monitoredSources.filter(s => s.id !== id));
    };

    const handleFetchUpdates = useCallback(async (isAutoUpdate = false) => {
        if (monitoredSources.length === 0) {
             setContent([]);
             return;
        };
        
        if (!isAutoUpdate) {
            setIsLoading(true);
        }
        
        const newItems = await fetchAllMonitoredContent(monitoredSources);
        
        setContent(prevContent => {
            const prevContentMap = new Map(prevContent.map(item => [item.sourceUrl, item.title]));
            return newItems.map(newItem => ({
                ...newItem,
                isNew: prevContentMap.get(newItem.sourceUrl) !== newItem.title && !!newItem.title
            }));
        });

        if (!isAutoUpdate) {
            setIsLoading(false);
        }
    }, [monitoredSources]);

    useEffect(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (isContinuous && monitoredSources.length > 0) {
            handleFetchUpdates(true); // Fetch immediately when toggled on
            intervalRef.current = setInterval(() => {
                handleFetchUpdates(true);
            }, 5 * 60 * 1000); // 5 minutes
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isContinuous, monitoredSources, handleFetchUpdates]);


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl border border-gray-700 max-h-[90vh] flex flex-col">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">مراقبة المصادر</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X/></button>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto dark-scrollbar">
                    {/* Source Management */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                             <h3 className="text-lg font-semibold text-gray-200">قائمة المراقبة</h3>
                             <div className="flex items-center gap-2">
                                <span className={`text-sm ${isContinuous ? 'text-cyan-400' : 'text-gray-400'}`}>مراقبة مستمرة</span>
                                <button onClick={() => setIsContinuous(!isContinuous)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isContinuous ? 'bg-cyan-600' : 'bg-gray-600'}`}>
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isContinuous ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>

                         <div className="flex gap-2">
                            <input type="url" value={newSourceUrl} onChange={e => setNewSourceUrl(e.target.value)} placeholder="أضف رابط للمراقبة..." className="flex-grow p-2 bg-gray-900 border border-gray-600 rounded-md text-gray-200"/>
                            <button onClick={addSource} className="p-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700"><PlusCircle size={20}/></button>
                        </div>
                        <ul className="space-y-2 max-h-48 overflow-y-auto dark-scrollbar p-2 bg-gray-900/50 rounded">
                            {monitoredSources.map(source => (
                                <li key={source.id} className="flex justify-between items-center text-sm bg-gray-700/50 p-1.5 rounded">
                                    <span className="text-gray-300 truncate">{source.url}</span>
                                    <button onClick={() => removeSource(source.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>
                                </li>
                            ))}
                            {monitoredSources.length === 0 && <li className="text-gray-500 text-center text-xs">لا توجد مصادر للمراقبة.</li>}
                        </ul>
                         <button onClick={() => handleFetchUpdates(false)} disabled={isLoading || monitoredSources.length === 0} className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed">
                            <RefreshCw className={isLoading ? 'animate-spin' : ''} />
                            {isLoading ? 'جاري الجلب...' : 'جلب آخر التحديثات'}
                        </button>
                    </div>

                    {/* Fetched Content */}
                    <div className="space-y-4">
                         <h3 className="text-lg font-semibold text-gray-200">آخر التحديثات</h3>
                         <div className="space-y-3 max-h-96 overflow-y-auto dark-scrollbar p-2 bg-gray-900/50 rounded">
                            {isLoading && <div className="flex justify-center items-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>}
                            {!isLoading && content.length === 0 && <p className="text-gray-500 text-center pt-8">لم يتم جلب أي محتوى. اضغط على زر الجلب للبدء.</p>}
                            {content.map((item, index) => (
                                <div key={index} className="bg-gray-800 p-3 rounded relative">
                                    {item.isNew && (
                                        <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-cyan-500 text-white text-xs px-2 py-0.5 rounded-full">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                                            </span>
                                            جديد
                                        </div>
                                    )}
                                    <p className="font-bold text-cyan-400 text-sm pr-12">{item.title}</p>
                                    <p className="text-gray-400 text-xs mt-1">{item.summary}</p>
                                    <button onClick={() => {onSelectContent(item); onClose();}} className="mt-2 text-xs px-2 py-1 bg-cyan-700 text-white rounded hover:bg-cyan-800">
                                        استخدام كمصدر
                                    </button>
                                </div>
                            ))}
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};




const App: React.FC = () => {
    // --- ✅ 2. Replace useLocalStorage with useState for data from the database ---
    const [editorialStyles, setEditorialStyles] = useState<EditorialStyle[]>([]);
    const [customNewsSources, setCustomNewsSources] = useState<CustomNewsSource[]>([]);
    const [monitoredSources, setMonitoredSources] = useState<MonitoredSource[]>([]);
    
    // This can stay in localStorage as it's a UI preference, not critical data
    const [selectedStyleId, setSelectedStyleId] = useLocalStorage<string>('selectedStyleId', '');

    // --- All your other state hooks remain the same ---
    const [inputs, setInputs] = useState<{type: string, value: string | File}[]>([]);
    const [generatedArticle, setGeneratedArticle] = useState<GeneratedArticle | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Will be used for initial data load
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState('');
    const [breakingNews, setBreakingNews] = useState<BreakingNewsItem[]>([]);
    const [isBreakingNewsLoading, setIsBreakingNewsLoading] = useState(true);
    const [hasNewBreakingNews, setHasNewBreakingNews] = useState(false);
    const [inputSelection, setInputSelection] = useState<{type: string; value: string}[]>([]);
    const [isBreakingNewsOpen, setBreakingNewsOpen] = useState(false);
    const [isStyleModalOpen, setStyleModalOpen] = useState(false);
    const [isMonitorOpen, setMonitorOpen] = useState(false);

    // --- ✅ 3. Add authentication state and listener ---
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== "https://frontend-rgr7.onrender.com") { // Check your main frontend URL
                return;
            }
            if (event.data && event.data.type === 'AUTH_TOKEN') {
                localStorage.setItem('access_token', event.data.token);
                setIsAuthenticated(true);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // --- ✅ 4. Fetch initial data from the database after authentication ---
    useEffect(() => {
        if (isAuthenticated) {
            const fetchInitialData = async () => {
                try {
                    setIsLoading(true);
                    // Fetch all data in parallel for better performance
                    const [styles, customSources, monitoredSources] = await Promise.all([
                        getStyles(),
                        getCustomSources(),
                        getMonitoredSources()
                    ]);
                    setEditorialStyles(styles);
                    setCustomNewsSources(customSources);
                    setMonitoredSources(monitoredSources);
                } catch (err) {
                    setError("Failed to load initial data from the database.");
                    console.error(err);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchInitialData();
        }
    }, [isAuthenticated]);

    // All your existing functions (fetchNews, handleGenerate, etc.) remain the same for now
    const fetchNews = useCallback(async () => { /* ... */ }, [customNewsSources]);
    const handleGenerate = useCallback(async () => { /* ... */ }, [selectedStyleId, editorialStyles, inputs]);
    const handleArticleUpdate = (updatedArticle: GeneratedArticle, improveStyle: boolean) => { /* ... */ };

    // --- ✅ 5. Create new handler for saving styles to the database ---
    const handleSaveStyles = async (updatedStyles: EditorialStyle[]) => {
        // This is a simplified version. A full version would compare the old and new lists
        // to figure out what was added, deleted, or changed.
        try {
            // For now, let's just demonstrate creating a new style if one was added.
            for (const style of updatedStyles) {
                if (typeof style.id === 'string' && style.id.startsWith('style-')) { // A temporary ID for new styles
                    await createStyle({ name: style.name, content: style.content });
                }
                // A full implementation would handle updates and deletes here as well.
            }
            // After saving, re-fetch the list from the database to get the latest data
            const freshStyles = await getStyles();
            setEditorialStyles(freshStyles);
            setNotification('Styles saved to the database successfully!');
        } catch (err) {
            setError('Failed to save styles to the database.');
        }
        setStyleModalOpen(false);
    };

    // ... other handlers like handleSelectNewsItem, etc. remain the same ...
    const handleSelectNewsItem = (itemText: string) => { /* ... */ };


    if (isLoading && isAuthenticated) {
        return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Loading Data from Database...</div>
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200">
            <Header onOpenBreakingNews={() => setBreakingNewsOpen(true)} hasNewNews={hasNewBreakingNews} onOpenMonitor={() => setMonitorOpen(true)}/>
            
            {/* --- ✅ 6. Pass the new database-aware handler to the modal --- */}
            <EditorialStyleModal 
                isOpen={isStyleModalOpen} 
                onClose={() => setStyleModalOpen(false)} 
                styles={editorialStyles} 
                onSave={handleSaveStyles} // Use the new save handler
            />

            {/* The rest of your JSX remains the same */}
            <BreakingNewsModal 
                isOpen={isBreakingNewsOpen} 
                onClose={()=>setBreakingNewsOpen(false)}
                // ... other props
                customSources={customNewsSources}
                onSourcesChange={setCustomNewsSources} // TODO: This should also be converted to an API call
            />
            <MonitorModal 
                isOpen={isMonitorOpen}
                onClose={() => setMonitorOpen(false)}
                // ... other props
                monitoredSources={monitoredSources}
                onSourcesChange={setMonitoredSources} // TODO: This should also be converted to an API call
            />
            
            <main className="container mx-auto p-4 md:p-8">
                <div className="space-y-6">
                    <EditorialStyleSelector 
                        styles={editorialStyles} 
                        selectedStyleId={selectedStyleId} 
                        onSelectStyle={setSelectedStyleId} 
                        onManageStyles={() => setStyleModalOpen(true)} 
                    />
                    {/* ... The rest of your main page JSX ... */}
                </div>
            </main>
             {/* ... Your notification div ... */}
        </div>
    );
};


export default App;
