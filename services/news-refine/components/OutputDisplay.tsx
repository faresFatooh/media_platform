

import React, { useState, useEffect } from 'react';
import type { NewsRefineOutput, NewsRefineInput, SocialPlatform, AudioPrefs } from '../types';
import { generatePodcastScript } from '../services/geminiService';
import { generateAudioFromElevenLabs as generatePodcastAudio } from '../services/elevenLabsService';
import { postToSocialMedia, schedulePostToSocialMedia } from '../services/hootsuiteService';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { CodeIcon } from './icons/CodeIcon';
import { SeoIcon } from './icons/SeoIcon';
import { LanguageIcon } from './icons/LanguageIcon';
import { JsonIcon } from './icons/JsonIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { EnvelopeIcon } from './icons/EnvelopeIcon';
import { PodcastIcon } from './icons/PodcastIcon';
import { AudioControls } from './AudioControls';
import { FacebookIcon } from './icons/FacebookIcon';
import { XIcon } from './icons/XIcon';
import { InstagramIcon } from './icons/InstagramIcon';
import { ShareIcon } from './icons/ShareIcon';
import { ExportIcon } from './icons/ExportIcon';
import { PdfIcon } from './icons/PdfIcon';
import { TxtIcon } from './icons/TxtIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { LinkedInIcon } from './icons/LinkedInIcon';
import { YouTubeIcon } from './icons/YouTubeIcon';
import { BroadcastIcon } from './icons/BroadcastIcon';
import { PodcastModal } from './PodcastModal';

type Tab = 'article' | 'html' | 'english' | 'json';
type PodcastStatus = 'idle' | 'scripting' | 'generating_audio' | 'ready' | 'error';

const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button
            onClick={handleCopy}
            className="absolute top-3 left-3 bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-xs hover:bg-slate-200 transition-colors z-10 flex items-center space-x-1 space-x-reverse print:hidden"
        >
            <ClipboardIcon />
            <span>{copied ? 'تم النسخ!' : 'نسخ'}</span>
        </button>
    );
};

interface OutputDisplayProps {
    output: NewsRefineOutput;
    options: NewsRefineInput;
    audioPrefs: AudioPrefs;
    onSendEmail: () => void;
    showToast: (message: string, type: 'success' | 'error') => void;
}

export const OutputDisplay: React.FC<OutputDisplayProps> = ({ output, options, audioPrefs, onSendEmail, showToast }) => {
    const [activeTab, setActiveTab] = useState<Tab>('article');
    
    const [podcastStatus, setPodcastStatus] = useState<PodcastStatus>('idle');
    const [podcastAudioUrl, setPodcastAudioUrl] = useState<string | null>(null);
    const [podcastError, setPodcastError] = useState<string | null>(null);
    const [isPodcastModalOpen, setIsPodcastModalOpen] = useState(false);

    const [isPostingTo, setIsPostingTo] = useState<SocialPlatform | null>(null);
    const [isScheduling, setIsScheduling] = useState<SocialPlatform | null>(null);

    const isLoading = !!(isPostingTo || isScheduling);

    useEffect(() => {
        const generatePodcast = async () => {
            const articleTextForPodcast = `${output.article.title}\n\n${output.article.dek}\n\n${output.article.body_paragraphs.join('\n\n')}`;
            
            try {
                setPodcastStatus('scripting');
                const script = await generatePodcastScript(output.article.title, articleTextForPodcast);
                
                setPodcastStatus('generating_audio');
                const audioUrl = await generatePodcastAudio(script, audioPrefs);

                setPodcastAudioUrl(audioUrl);
                setPodcastStatus('ready');
            } catch (err) {
                console.error("Podcast generation failed:", err);
                const errorMessage = err instanceof Error ? err.message : 'فشل توليد البودكاست. الرجاء المحاولة مرة أخرى.';
                setPodcastError(errorMessage);
                setPodcastStatus('error');
            }
        };
        
        if (output) {
            setPodcastAudioUrl(null);
            setPodcastError(null);
            setPodcastStatus('idle');
            generatePodcast();
        } else {
            setPodcastStatus('idle');
        }
    }, [output, audioPrefs]);

    const TabButton: React.FC<{ tabId: Tab; label: string; icon: React.ReactNode; disabled?: boolean }> = ({ tabId, label, icon, disabled }) => (
        <button
            onClick={() => !disabled && setActiveTab(tabId)}
            disabled={disabled}
            className={`flex items-center space-x-2 space-x-reverse px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${activeTab === tabId
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );

    const articleText = `${output.article.title}\n\n${output.article.dek}\n\n${output.article.body_paragraphs.join('\n\n')}`;
    const englishArticleText = output.english_version.enabled ? `${output.english_version.title}\n\n${output.english_version.body_paragraphs?.join('\n\n')}` : '';
    
    const handleShare = async (platform: SocialPlatform) => {
        setIsPostingTo(platform);
        try {
            await postToSocialMedia(platform, output.article, output.seo, output.generated_image_b64);
            const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
            showToast(`تم النشر بنجاح على ${platformName}!`, 'success');
        } catch (error) {
            const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
            showToast(`فشل النشر على ${platformName}.`, 'error');
        } finally {
            setIsPostingTo(null);
        }
    };

    const handleSchedule = async (platform: SocialPlatform) => {
        setIsScheduling(platform);
        try {
            const scheduleTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
            await schedulePostToSocialMedia(platform, output.article, output.seo, scheduleTime, output.generated_image_b64);
            const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
            showToast(`تمت جدولة المنشور بنجاح على ${platformName}!`, 'success');
        } catch (error) {
            const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
            showToast(`فشلت جدولة المنشور على ${platformName}.`, 'error');
        } finally {
            setIsScheduling(null);
        }
    };
    
    const handleExportAsTxt = () => {
        const { title, dek, body_paragraphs } = output.article;
        const content = `${title}\n\n${dek}\n\n${body_paragraphs.join('\n\n')}`;
        const filename = `${title.replace(/[\/\\?%*:|"<>]/g, '-').replace(/\s+/g, '_')}.txt`;
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleExportAsPdf = () => {
        setActiveTab('article');
        setTimeout(() => window.print(), 100);
    };

    const socialPlatforms = [
      { id: 'facebook', name: 'Facebook', icon: <FacebookIcon />, color: 'bg-blue-600 hover:bg-blue-700', enabled: true },
      { id: 'twitter', name: 'X', icon: <XIcon />, color: 'bg-slate-900 hover:bg-slate-800', enabled: true },
      { id: 'instagram', name: 'Instagram', icon: <InstagramIcon />, color: 'bg-pink-600 hover:bg-pink-700', enabled: !!output.generated_image_b64 },
      { id: 'linkedin', name: 'LinkedIn', icon: <LinkedInIcon className="h-5 w-5 text-blue-700" />, color: '', enabled: false },
      { id: 'youtube', name: 'YouTube', icon: <YouTubeIcon className="h-5 w-5 text-red-600"/>, color: '', enabled: false },
    ] as const;

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden print:shadow-none print:border-none">
            <div className="p-6 md:p-8 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">النتيجة النهائية</h2>
                    <p className="text-slate-500 mt-1">تمت إعادة صياغة الخبر وتجهيزه للنشر.</p>
                </div>
                <button
                    onClick={onSendEmail}
                    className="flex-shrink-0 bg-sky-600 text-white font-bold py-2 px-5 rounded-lg shadow-md hover:bg-sky-700 transition-all duration-300 flex items-center space-x-2 space-x-reverse"
                >
                    <EnvelopeIcon />
                    <span>إرسال للناشر</span>
                </button>
            </div>

            {output.generated_image_b64 && (
                <div className="p-6 md:p-8 bg-slate-50/70 print:hidden">
                    <h3 className="text-lg font-bold text-slate-700 mb-3">الصورة المولّدة</h3>
                    <img
                        src={`data:image/jpeg;base64,${output.generated_image_b64}`}
                        alt="AI Generated news illustration"
                        className="rounded-lg shadow-md border border-slate-200 w-full object-cover max-h-96"
                    />
                    <p className="text-xs text-slate-500 mt-2 text-center italic">
                        <strong>Image Prompt:</strong> {output.article.image_prompt_english}
                    </p>
                </div>
            )}
            
            <div className="border-y border-slate-200 divide-y divide-slate-200 print:hidden">
                <AudioControls text={articleText} />
                <div className="p-6 bg-slate-50">
                    <div className="flex items-center mb-4">
                        <div className="bg-sky-100 text-sky-600 p-2 rounded-full ml-3"><PodcastIcon /></div>
                        <div>
                            <h4 className="font-bold text-slate-700">الإنتاج الصوتي للبودكاست</h4>
                            <p className="text-sm text-slate-500">يتم توليد نسخة صوتية من الخبر تلقائياً.</p>
                        </div>
                    </div>
                    
                    {(podcastStatus === 'scripting' || podcastStatus === 'generating_audio') && (
                        <div className="flex items-center text-sm text-sky-600 p-3 bg-sky-50 rounded-lg">
                            <svg className="animate-spin h-5 w-5 ml-3 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>
                                {podcastStatus === 'scripting' 
                                    ? 'جاري كتابة نص البودكاست...' 
                                    : 'جاري تحويل النص إلى صوت احترافي...'}
                            </span>
                        </div>
                    )}

                    {podcastStatus === 'error' && podcastError && (
                        <div className="mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md text-sm">
                            <p className="font-bold">خطأ في توليد البودكاست</p>
                            <p>{podcastError}</p>
                        </div>
                    )}

                    {podcastStatus === 'ready' && podcastAudioUrl && (
                        <div className="mt-4 space-y-3">
                            <div>
                                <h5 className="font-bold text-slate-800 mb-2">البودكاست جاهز للاستماع</h5>
                                <audio controls className="w-full rounded-lg" src={podcastAudioUrl}>
                                    متصفحك لا يدعم عنصر الصوت.
                                </audio>
                            </div>
                            <button
                                onClick={() => setIsPodcastModalOpen(true)}
                                className="w-full flex items-center justify-center gap-2 bg-slate-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-800 transition-colors"
                            >
                                <BroadcastIcon className="h-5 w-5" />
                                <span>ربط ونشر البودكاست</span>
                            </button>
                        </div>
                    )}
                </div>
                <div className="p-6 bg-slate-50">
                    <div className="flex items-center mb-4">
                        <div className="bg-sky-100 text-sky-600 p-2 rounded-full ml-3"><ShareIcon /></div>
                        <div>
                            <h4 className="font-bold text-slate-700">النشر والجدولة</h4>
                            <p className="text-sm text-slate-500">مشاركة الخبر مباشرة أو جدولته عبر Hootsuite.</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {socialPlatforms.map(p => (
                            <div key={p.id} className={`p-2 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${p.enabled ? 'bg-white border' : 'bg-slate-100'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-1 rounded-full ${!p.enabled ? 'grayscale opacity-60' : ''}`}>{p.icon}</div>
                                    <span className={`font-semibold ${p.enabled ? 'text-slate-800' : 'text-slate-500'}`}>{p.name}</span>
                                </div>
                                {p.enabled ? (
                                    <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                                        <button onClick={() => handleSchedule(p.id)} disabled={isLoading} className="flex items-center justify-center gap-1.5 w-full text-xs font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 px-3 py-1.5 rounded-md disabled:opacity-50 transition-colors">
                                            {isScheduling === p.id ? <div className="animate-spin h-4 w-4 border-2 border-slate-600 border-t-transparent rounded-full"></div> : <CalendarIcon />}
                                            <span>جدولة</span>
                                        </button>
                                        <button onClick={() => handleShare(p.id)} disabled={isLoading} className={`flex items-center justify-center gap-2 w-full text-xs font-bold text-white px-3 py-1.5 rounded-md disabled:bg-slate-400 transition-colors ${p.color}`}>
                                            {isPostingTo === p.id ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div> : <span>نشر الآن</span>}
                                        </button>
                                    </div>
                                ) : (
                                    <span className="text-xs text-slate-400 font-medium self-end sm:self-center">{p.name === 'Instagram' ? 'يتطلب صورة' : 'قريباً'}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                 <div className="p-6 bg-slate-50">
                    <div className="flex items-center mb-4">
                        <div className="bg-sky-100 text-sky-600 p-2 rounded-full ml-3"><ExportIcon /></div>
                        <div>
                            <h4 className="font-bold text-slate-700">تصدير المقال</h4>
                            <p className="text-sm text-slate-500">حفظ المقال بتنسيقات مختلفة.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button onClick={handleExportAsPdf} className="flex items-center justify-center gap-2 w-full bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"><PdfIcon /><span>تنزيل كـ PDF</span></button>
                        <button onClick={handleExportAsTxt} className="flex items-center justify-center gap-2 w-full bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors"><TxtIcon /><span>تنزيل كملف نصي</span></button>
                    </div>
                </div>
            </div>

            <div className="border-t border-slate-200 print:hidden">
                <nav className="flex border-b border-slate-200 px-4 overflow-x-auto" aria-label="Tabs">
                    <TabButton tabId="article" label="المقال و SEO" icon={<DocumentTextIcon />} />
                    <TabButton tabId="html" label="HTML" icon={<CodeIcon />} />
                    <TabButton tabId="english" label="النسخة الإنجليزية" icon={<LanguageIcon />} disabled={!output.english_version.enabled} />
                    <TabButton tabId="json" label="JSON" icon={<JsonIcon />} />
                </nav>
                <div className="p-6 md:p-8">
                    {activeTab === 'article' && (
                        <div id="printable-area">
                            <article className="prose prose-slate max-w-none rtl" dir="rtl">
                                <h1>{output.article.title}</h1>
                                <p className="lead">{output.article.dek}</p>
                                {output.article.body_paragraphs.map((p, i) => <p key={i}>{p}</p>)}
                                {output.article.quotes && output.article.quotes.length > 0 && (
                                    <div className="my-6">
                                        <h3 className="font-bold">اقتباسات رئيسية:</h3>
                                        {output.article.quotes.map((q, i) => (
                                            <blockquote key={i} className="border-r-4 border-sky-500 pr-4 italic text-slate-600">
                                                <p>"{q.quote}"</p>
                                                <footer className="text-sm not-italic">- {q.speaker}, <cite>{new URL(q.source).hostname}</cite></footer>
                                            </blockquote>
                                        ))}
                                    </div>
                                )}
                                {output.article.context_box && output.article.context_box.length > 0 && (
                                    <aside className="my-6 p-4 bg-slate-100 rounded-lg">
                                        <h4 className="font-bold text-slate-800">في السياق</h4>
                                        <ul className="list-disc pr-5">{output.article.context_box.map((item, i) => <li key={i}>{item}</li>)}</ul>
                                    </aside>
                                )}
                            </article>
                            
                            <div className="mt-12 border-t pt-8">
                                <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                                    <SeoIcon />
                                    <span>بيانات SEO والمُحسّنات</span>
                                </h2>
                                <div className="space-y-6 text-sm" dir="rtl">
                                     <div><h4 className="font-bold text-slate-700">Meta Title</h4><p className="p-2 bg-slate-100 rounded-md mt-1">{output.seo.meta_title}</p></div>
                                     <div><h4 className="font-bold text-slate-700">Meta Description</h4><p className="p-2 bg-slate-100 rounded-md mt-1">{output.seo.meta_description}</p></div>
                                     <div><h4 className="font-bold text-slate-700">Keywords</h4><div className="flex flex-wrap gap-2 mt-1">{output.seo.keywords.map(kw => <span key={kw} className="bg-sky-100 text-sky-800 px-2 py-1 rounded-full">{kw}</span>)}</div></div>
                                     <div><h4 className="font-bold text-slate-700">AI Summary</h4><p className="p-2 bg-slate-100 rounded-md mt-1">{output.seo.ai_summary}</p></div>
                                     <div>
                                        <h4 className="font-bold text-slate-700">Generation Tags</h4>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {options.output.include_aiseo && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">AISEO</span>}
                                            <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-semibold capitalize">{options.style_prefs.tone}</span>
                                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-semibold capitalize">{options.style_prefs.editing_level}</span>
                                            {output.generated_image_b64 && <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded-full text-xs font-semibold">Image Generated</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'html' && (<div className="relative"><CopyButton textToCopy={output.html} /><pre className="bg-slate-800 text-white p-4 rounded-lg overflow-x-auto text-sm" dir="ltr"><code>{output.html}</code></pre></div>)}
                    
                    {activeTab === 'english' && output.english_version.enabled && (<div className="relative"><CopyButton textToCopy={englishArticleText} /><article className="prose prose-slate max-w-none"><h1>{output.english_version.title}</h1>{output.english_version.body_paragraphs?.map((p, i) => <p key={i}>{p}</p>)}</article></div>)}
                    {activeTab === 'json' && (<div className="relative"><CopyButton textToCopy={JSON.stringify(output, null, 2)} /><pre className="bg-slate-800 text-white p-4 rounded-lg overflow-x-auto text-sm" dir="ltr"><code>{JSON.stringify(output, null, 2)}</code></pre></div>)}
                </div>
            </div>
            {isPodcastModalOpen && podcastAudioUrl && (
                <PodcastModal
                    audioUrl={podcastAudioUrl}
                    articleTitle={output.article.title}
                    onClose={() => setIsPodcastModalOpen(false)}
                    showToast={showToast}
                />
            )}
        </div>
    );
};
