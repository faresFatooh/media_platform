import React, { useState } from 'react';
import { VideoClapperIcon } from './icons/VideoClapperIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { generateBulletedSummary, generateInfographic } from '../services/geminiService';
import type { NewsRefineOutput } from '../types';

const ToolCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    children: React.ReactNode;
}> = ({ icon, title, description, children }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
        <div className="flex items-center mb-4">
            <div className="bg-sky-100 text-sky-600 p-3 rounded-full ml-4">{icon}</div>
            <div>
                <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                <p className="text-slate-500 text-sm">{description}</p>
            </div>
        </div>
        <div className="mt-6 border-t border-slate-200 pt-6">
            {children}
        </div>
    </div>
);

interface MediaToolsProps {
    latestArticle: NewsRefineOutput | null;
}

export const MediaTools: React.FC<MediaToolsProps> = ({ latestArticle }) => {
    // State for Summary Generator
    const [summarySource, setSummarySource] = useState<'latest' | 'url'>('url');
    const [videoUrl, setVideoUrl] = useState('');
    const [summary, setSummary] = useState('');
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [summaryError, setSummaryError] = useState('');

    // State for Infographic Generator
    const [infographicData, setInfographicData] = useState('');
    const [infographicImage, setInfographicImage] = useState('');
    const [isGeneratingInfographic, setIsGeneratingInfographic] = useState(false);
    const [infographicError, setInfographicError] = useState('');

    const handleGenerateSummary = async () => {
        let sourceContent: { source: 'url' | 'text'; value: string } | null = null;

        if (summarySource === 'latest' && latestArticle) {
            const { title, dek, body_paragraphs } = latestArticle.article;
            const fullText = `${title}\n\n${dek}\n\n${body_paragraphs.join('\n\n')}`;
            sourceContent = { source: 'text', value: fullText };
        } else if (summarySource === 'url' && videoUrl) {
            sourceContent = { source: 'url', value: videoUrl };
        } else {
            setSummaryError('الرجاء اختيار مصدر صالح للملخص.');
            return;
        }

        setIsGeneratingSummary(true);
        setSummaryError('');
        setSummary('');
        try {
            const result = await generateBulletedSummary(sourceContent);
            setSummary(result);
        } catch (error) {
            setSummaryError('فشل في توليد الملخص. الرجاء المحاولة مرة أخرى.');
        } finally {
            setIsGeneratingSummary(false);
        }
    };


    const handleGenerateInfographic = async () => {
        if (!infographicData) {
            setInfographicError('الرجاء إدخال البيانات.');
            return;
        }
        setIsGeneratingInfographic(true);
        setInfographicError('');
        setInfographicImage('');
        try {
            const result = await generateInfographic(infographicData);
            setInfographicImage(result);
        } catch (error) {
            setInfographicError('فشل في توليد الإنفوجرافيك. الرجاء المحاولة مرة أخرى.');
        } finally {
            setIsGeneratingInfographic(false);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">أدوات الميديا الذكية</h1>
                <p className="text-slate-500 mt-1">أدوات متقدمة لتوليد محتوى مرئي وجذاب تلقائياً.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ToolCard
                    icon={<VideoClapperIcon />}
                    title="مولّد الملخصات النقطية"
                    description="لخّص أي مقال على شكل نقاط رئيسية للنشر السريع."
                >
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">مصدر الخبر</label>
                            <div className="flex gap-x-6 gap-y-2 flex-wrap">
                                <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                                    <input
                                        type="radio"
                                        name="summarySource"
                                        value="latest"
                                        checked={summarySource === 'latest'}
                                        onChange={() => setSummarySource('latest')}
                                        disabled={!latestArticle}
                                        className="form-radio text-sky-600"
                                    />
                                    <span className={!latestArticle ? 'text-slate-400' : ''}>آخر خبر تم توليده</span>
                                </label>
                                <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                                    <input
                                        type="radio"
                                        name="summarySource"
                                        value="url"
                                        checked={summarySource === 'url'}
                                        onChange={() => setSummarySource('url')}
                                        className="form-radio text-sky-600"
                                    />
                                    <span>رابط خارجي</span>
                                </label>
                            </div>
                        </div>

                        {summarySource === 'url' ? (
                             <div>
                                <label htmlFor="video-link" className="block text-sm font-medium text-slate-700 mb-1">
                                    رابط الخبر الخارجي
                                </label>
                                <input type="url" id="video-link" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://example.com/news/..." className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500" />
                            </div>
                        ) : (
                             <div className="p-3 bg-slate-100 border border-slate-200 rounded-md">
                                <p className="text-sm font-medium text-slate-800 truncate">
                                    {latestArticle ? latestArticle.article.title : 'اذهب إلى "صياغة الأخبار" لتوليد خبر أولاً.'}
                                </p>
                            </div>
                        )}
                        
                         <button onClick={handleGenerateSummary} disabled={isGeneratingSummary || (summarySource === 'latest' && !latestArticle)} className="w-full bg-sky-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-sky-700 disabled:bg-slate-400 flex items-center justify-center gap-2">
                            {isGeneratingSummary && <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>}
                            {isGeneratingSummary ? '...جاري التلخيص' : 'تلخيص الخبر'}
                        </button>
                        {summaryError && <p className="text-sm text-red-600">{summaryError}</p>}
                        {summary && (
                            <div className="mt-4">
                                <h4 className="font-bold text-slate-700 mb-2">النقاط الرئيسية:</h4>
                                <textarea readOnly value={summary} rows={8} className="w-full p-3 border border-slate-200 rounded-md bg-slate-50 text-sm whitespace-pre-wrap"></textarea>
                            </div>
                        )}
                    </div>
                </ToolCard>

                <ToolCard
                    icon={<ChartBarIcon />}
                    title="مولّد الإنفوجرافيك التلقائي"
                    description="حوّل الأرقام والإحصائيات إلى رسوم بيانية احترافية."
                >
                    <div className="space-y-4">
                         <div>
                             <label htmlFor="data-input" className="block text-sm font-medium text-slate-700 mb-1">
                                أدخل البيانات (كل سطر يمثل فئة وقيمة)
                            </label>
                            <textarea
                                id="data-input"
                                rows={4}
                                value={infographicData}
                                onChange={(e) => setInfographicData(e.target.value)}
                                placeholder="مثال:&#10;طلاب الهندسة, 2500&#10;طلاب الطب, 1800&#10;طلاب الآداب, 3200"
                                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 font-mono text-sm"
                            ></textarea>
                        </div>
                         <button onClick={handleGenerateInfographic} disabled={isGeneratingInfographic} className="w-full bg-sky-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-sky-700 disabled:bg-slate-400 flex items-center justify-center gap-2">
                             {isGeneratingInfographic && <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>}
                            {isGeneratingInfographic ? '...جاري التصميم' : 'تصميم الإنفوجرافيك'}
                        </button>
                        {infographicError && <p className="text-sm text-red-600">{infographicError}</p>}
                        {infographicImage && (
                            <div className="mt-4">
                                <h4 className="font-bold text-slate-700 mb-2">النتيجة:</h4>
                                <img src={`data:image/jpeg;base64,${infographicImage}`} alt="Generated Infographic" className="rounded-lg border border-slate-200" />
                            </div>
                        )}
                    </div>
                </ToolCard>
            </div>
            <p className="text-center text-sm text-slate-500">ملاحظة: يتم تنفيذ هذه العمليات بواسطة نماذج Gemini للغة والصور.</p>
        </div>
    );
};