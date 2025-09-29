import React, { useState, useCallback, useEffect } from 'react';
import type { DocumentaryScript, PromoContent, GeneratedMedia, VideoTemplate, ShortsScript } from './types';
import { generateYouTubeIdeas, generateDocumentaryScript, generatePromoContent, generateImageForScene, generateVideoForScene, generateVideoTemplates, generateShortsScripts } from './services/geminiService';
import { validateElevenLabsApiKey } from './services/elevenLabsService';
import Header from './components/Header';
import Controls from './components/Controls';
import ScriptDisplay from './components/ScriptDisplay';
import SidePanel from './components/SidePanel';
import IdeaModal from './components/IdeaModal';
import TemplateModal from './components/TemplateModal';

const App: React.FC = () => {
    const [topic, setTopic] = useState<string>('');
    const [duration, setDuration] = useState<number>(5);
    const [script, setScript] = useState<DocumentaryScript | null>(null);
    const [promoContent, setPromoContent] = useState<PromoContent | null>(null);
    const [ideas, setIdeas] = useState<string[] | null>(null);
    const [templates, setTemplates] = useState<VideoTemplate[] | null>(null);
    const [shortsScripts, setShortsScripts] = useState<ShortsScript[] | null>(null);
    const [generatedMedia, setGeneratedMedia] = useState<GeneratedMedia>({ images: [], videos: [] });
    
    const [isLoading, setIsLoading] = useState({
        ideas: false,
        script: false,
        promo: false,
        media: false,
        templates: false,
        shorts: false,
    });
    const [mediaGenerationProgress, setMediaGenerationProgress] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [showIdeasModal, setShowIdeasModal] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);

    // ElevenLabs API Key State
    const [elevenLabsApiKey, setElevenLabsApiKey] = useState<string>(() => localStorage.getItem('elevenLabsApiKey') || '');
    const [isApiKeyValidated, setIsApiKeyValidated] = useState(false);

    // Effect to validate the key on initial load
    useEffect(() => {
        const validateKeyOnLoad = async () => {
            if (elevenLabsApiKey) {
                const result = await validateElevenLabsApiKey(elevenLabsApiKey);
                setIsApiKeyValidated(result.success);
            }
        };
        validateKeyOnLoad();
    }, [elevenLabsApiKey]);

    const handleApiKeyChange = (key: string) => {
        setElevenLabsApiKey(key);
        localStorage.setItem('elevenLabsApiKey', key);
        setIsApiKeyValidated(false); // Reset validation status when key changes
    };


    const handleGenerateIdeas = useCallback(async () => {
        setIsLoading(prev => ({ ...prev, ideas: true }));
        setError(null);
        try {
            const result = await generateYouTubeIdeas();
            setIdeas(result);
            setShowIdeasModal(true);
        } catch (err) {
            setError('فشل في توليد الأفكار. يرجى المحاولة مرة أخرى.');
            console.error(err);
        } finally {
            setIsLoading(prev => ({ ...prev, ideas: false }));
        }
    }, []);

    const handleGenerateTemplates = useCallback(async () => {
        setIsLoading(prev => ({ ...prev, templates: true }));
        setError(null);
        try {
            const result = await generateVideoTemplates();
            setTemplates(result);
            setShowTemplateModal(true);
        } catch (err) {
            setError('فشل في اقتراح القوالب. يرجى المحاولة مرة أخرى.');
            console.error(err);
        } finally {
            setIsLoading(prev => ({ ...prev, templates: false }));
        }
    }, []);

    const handleGenerateScript = useCallback(async () => {
        if (!topic) {
            setError('يرجى إدخال موضوع للفيلم.');
            return;
        }
        setIsLoading(prev => ({ ...prev, script: true }));
        setError(null);
        setScript(null);
        setPromoContent(null);
        setShortsScripts(null);
        setGeneratedMedia({ images: [], videos: [] });
        try {
            const result = await generateDocumentaryScript(topic, duration);
            setScript(result);
        } catch (err) {
            setError('فشل في توليد النص. يرجى المحاولة مرة أخرى.');
            console.error(err);
        } finally {
            setIsLoading(prev => ({ ...prev, script: false }));
        }
    }, [topic, duration]);
    
    const handleGeneratePromo = useCallback(async () => {
        if (!script) {
            setError('يجب توليد نص الفيلم أولاً.');
            return;
        }
        setIsLoading(prev => ({ ...prev, promo: true }));
        setError(null);
        try {
            const result = await generatePromoContent(script);
            setPromoContent(result);
        } catch (err) {
            setError('فشل في توليد المحتوى الترويجي.');
            console.error(err);
        } finally {
            setIsLoading(prev => ({ ...prev, promo: false }));
        }
    }, [script]);

    const handleGenerateShorts = useCallback(async () => {
        if (!script) {
            setError('يجب توليد نص الفيلم أولاً.');
            return;
        }
        setIsLoading(prev => ({ ...prev, shorts: true }));
        setError(null);
        try {
            const result = await generateShortsScripts(script);
            setShortsScripts(result);
        } catch (err) {
            setError('فشل في توليد نصوص المقاطع القصيرة.');
            console.error(err);
        } finally {
            setIsLoading(prev => ({ ...prev, shorts: false }));
        }
    }, [script]);

    const handleGenerateMedia = useCallback(async (prompt: string, type: 'image' | 'video') => {
        setIsLoading(prev => ({ ...prev, media: true }));
        setError(null);
        setMediaGenerationProgress(`جارٍ توليد ${type === 'image' ? 'صورة' : 'فيديو'}...`);
        try {
            if (type === 'image') {
                const imageUrl = await generateImageForScene(prompt);
                setGeneratedMedia(prev => ({...prev, images: [...prev.images, {prompt, url: imageUrl}]}));
            } else {
                 setMediaGenerationProgress('بدء عملية توليد الفيديو. قد يستغرق هذا بضع دقائق...');
                const videoUrl = await generateVideoForScene(prompt, (message) => setMediaGenerationProgress(message));
                setGeneratedMedia(prev => ({...prev, videos: [...prev.videos, {prompt, url: videoUrl}]}));
            }
        } catch (err) {
            setError(`فشل في توليد ${type === 'image' ? 'الصورة' : 'الفيديو'}.`);
            console.error(err);
        } finally {
            setIsLoading(prev => ({ ...prev, media: false }));
            setMediaGenerationProgress('');
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col font-sans" dir="rtl">
            <Header />
            <main className="flex-grow container mx-auto p-4 flex flex-col lg:flex-row gap-6">
                <div className="w-full lg:w-1/3 xl:w-1/4 flex-shrink-0">
                    <Controls
                        topic={topic}
                        setTopic={setTopic}
                        duration={duration}
                        setDuration={setDuration}
                        onGenerateIdeas={handleGenerateIdeas}
                        onGenerateTemplates={handleGenerateTemplates}
                        onGenerateScript={handleGenerateScript}
                        isLoadingIdeas={isLoading.ideas}
                        isLoadingTemplates={isLoading.templates}
                        isLoadingScript={isLoading.script}
                        elevenLabsApiKey={elevenLabsApiKey}
                        onApiKeyChange={handleApiKeyChange}
                        isApiKeyValidated={isApiKeyValidated}
                        onValidateApiKey={setIsApiKeyValidated}
                    />
                </div>
                <div className="w-full lg:w-2/3 xl:w-3/4 flex flex-col gap-6">
                    {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg text-center">{error}</div>}
                    <ScriptDisplay 
                        script={script} 
                        isLoading={isLoading.script} 
                        onScriptChange={setScript}
                        elevenLabsApiKey={elevenLabsApiKey}
                        isApiKeyValidated={isApiKeyValidated} 
                    />
                    {script && (
                         <SidePanel 
                            script={script}
                            promoContent={promoContent}
                            shortsScripts={shortsScripts}
                            generatedMedia={generatedMedia}
                            onGeneratePromo={handleGeneratePromo}
                            onGenerateShorts={handleGenerateShorts}
                            onGenerateMedia={handleGenerateMedia}
                            isLoadingPromo={isLoading.promo}
                            isLoadingShorts={isLoading.shorts}
                            isLoadingMedia={isLoading.media}
                            mediaGenerationProgress={mediaGenerationProgress}
                         />
                    )}
                </div>
            </main>
            {showIdeasModal && ideas && (
                <IdeaModal ideas={ideas} onClose={() => setShowIdeasModal(false)} onSelectIdea={(idea) => { setTopic(idea); setShowIdeasModal(false); }} />
            )}
            {showTemplateModal && templates && (
                <TemplateModal
                    templates={templates}
                    onClose={() => setShowTemplateModal(false)}
                    onSelectTemplate={(template) => {
                        setTopic(template.promptPlaceholder);
                        setShowTemplateModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default App;