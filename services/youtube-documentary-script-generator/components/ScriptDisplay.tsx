import React, { useState, useEffect, useRef } from 'react';
import type { DocumentaryScript, Scene, ElevenLabsVoice } from '../types';
import { getElevenLabsVoices, generateElevenLabsAudio } from '../services/elevenLabsService';
import LoadingSpinner from './LoadingSpinner';
import { SparklesIcon, SpeakerWaveIcon, StopIcon } from './icons';

interface ScriptDisplayProps {
    script: DocumentaryScript | null;
    isLoading: boolean;
    onScriptChange: (script: DocumentaryScript) => void;
    elevenLabsApiKey: string;
    isApiKeyValidated: boolean;
}

const ScriptDisplay: React.FC<ScriptDisplayProps> = ({ script, isLoading, onScriptChange, elevenLabsApiKey, isApiKeyValidated }) => {
    const [voices, setVoices] = useState<ElevenLabsVoice[]>([]);
    const [selectedVoiceId, setSelectedVoiceId] = useState<string | undefined>();
    const [playbackState, setPlaybackState] = useState<{ sceneNumber: number | null; status: 'idle' | 'loading' | 'playing' }>({ sceneNumber: null, status: 'idle' });
    const [ttsError, setTtsError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const audioUrlRef = useRef<string | null>(null);

    useEffect(() => {
        async function fetchVoices() {
            if (!isApiKeyValidated) {
                setVoices([]);
                setTtsError("الرجاء إدخال مفتاح ElevenLabs API صالح والتحقق منه في لوحة التحكم لتفعيل ميزة التعليق الصوتي.");
                return;
            }
            try {
                setTtsError(null);
                const availableVoices = await getElevenLabsVoices(elevenLabsApiKey);
                setVoices(availableVoices);
                if (availableVoices.length > 0) {
                    const defaultVoice = availableVoices.find(v => v.name === "Rachel") || availableVoices[0];
                    setSelectedVoiceId(defaultVoice.voice_id);
                }
            } catch (error) {
                console.error("Failed to fetch ElevenLabs voices:", error);
                setTtsError("لا يمكن تحميل الأصوات. تحقق من مفتاح ElevenLabs API أو اتصال الشبكة.");
            }
        }

        fetchVoices();
        
        const audioEl = audioRef.current;
        const handlePlaybackEnd = () => {
            setPlaybackState({ sceneNumber: null, status: 'idle' });
        };
        audioEl?.addEventListener('ended', handlePlaybackEnd);
        audioEl?.addEventListener('pause', handlePlaybackEnd);

        return () => {
             audioEl?.removeEventListener('ended', handlePlaybackEnd);
             audioEl?.removeEventListener('pause', handlePlaybackEnd);
            if (audioUrlRef.current) {
                URL.revokeObjectURL(audioUrlRef.current);
            }
        };
    }, [isApiKeyValidated, elevenLabsApiKey]);

    const handlePlayStop = async (scene: Scene) => {
        if (playbackState.status === 'playing' && playbackState.sceneNumber === scene.sceneNumber) {
            audioRef.current?.pause();
            setPlaybackState({ sceneNumber: null, status: 'idle' });
            return;
        }

        if (playbackState.status !== 'idle') return;

        setPlaybackState({ sceneNumber: scene.sceneNumber, status: 'loading' });
        setTtsError(null);

        try {
            if (!selectedVoiceId) {
                throw new Error("No voice selected");
            }

            const audioUrl = await generateElevenLabsAudio(scene.narration, selectedVoiceId, elevenLabsApiKey);
            
            if (audioUrlRef.current) {
                URL.revokeObjectURL(audioUrlRef.current);
            }
            audioUrlRef.current = audioUrl;

            if (audioRef.current) {
                audioRef.current.src = audioUrl;
                audioRef.current.play().catch(e => {
                    console.error("Playback failed:", e);
                    setTtsError("فشل تشغيل الصوت.");
                    setPlaybackState({ sceneNumber: null, status: 'idle' });
                });
                setPlaybackState({ sceneNumber: scene.sceneNumber, status: 'playing' });
            }
        } catch (error) {
            console.error("Failed to generate audio:", error);
            setTtsError("فشل في توليد الصوت. حاول مرة أخرى.");
            setPlaybackState({ sceneNumber: null, status: 'idle' });
        }
    };

    const handleSceneChange = (index: number, field: keyof Scene, value: string | number) => {
        if (!script) return;
        const newScenes = [...script.scenes];
        newScenes[index] = { ...newScenes[index], [field]: value };
        onScriptChange({ ...script, scenes: newScenes });
    };

    const handleFieldChange = (field: keyof DocumentaryScript, value: string) => {
        if (!script) return;
        onScriptChange({ ...script, [field]: value });
    };

    if (isLoading) {
        return (
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col items-center justify-center min-h-[300px]">
                <LoadingSpinner />
                <p className="mt-4 text-gray-400">...جارٍ كتابة نص الفيلم الوثائقي</p>
            </div>
        );
    }

    if (!script) {
        return (
            <div className="bg-gray-800/50 border-2 border-dashed border-gray-700 p-6 rounded-xl flex flex-col items-center justify-center min-h-[300px] text-center">
                 <SparklesIcon className="w-12 h-12 text-gray-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-400">لم يتم توليد النص بعد</h3>
                <p className="text-gray-500">استخدم لوحة التحكم على اليمين لبدء العملية.</p>
            </div>
        );
    }
    
    return (
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg space-y-6">
            <audio ref={audioRef} hidden />
            <div className="space-y-2">
                <label className="text-sm font-medium text-cyan-400">عنوان الفيلم</label>
                 <input type="text" value={script.title} onChange={(e) => handleFieldChange('title', e.target.value)} className="w-full bg-gray-700/50 p-2 rounded-md border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-cyan-400">المقدمة (Hook)</label>
                    <textarea value={script.hook} onChange={(e) => handleFieldChange('hook', e.target.value)} rows={4} className="w-full bg-gray-700/50 p-2 rounded-md border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500" />
                </div>
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-cyan-400">الخاتمة (Conclusion)</label>
                    <textarea value={script.conclusion} onChange={(e) => handleFieldChange('conclusion', e.target.value)} rows={4} className="w-full bg-gray-700/50 p-2 rounded-md border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500" />
                </div>
            </div>

            <div className="border-t border-gray-700 pt-4">
                 {ttsError && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg text-center mb-4 text-sm">{ttsError}</div>}
                <div className="flex items-center gap-4 mb-4">
                    <label htmlFor="voice-select" className="text-sm font-medium text-cyan-400 whitespace-nowrap">اختر صوت التعليق (ElevenLabs):</label>
                    <select
                        id="voice-select"
                        value={selectedVoiceId || ''}
                        onChange={(e) => setSelectedVoiceId(e.target.value)}
                        className="w-full max-w-xs bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition disabled:opacity-50"
                        disabled={!isApiKeyValidated || voices.length === 0 || playbackState.status !== 'idle'}
                    >
                        {isApiKeyValidated && voices.length > 0 ? (
                             voices.map(voice => (
                                <option key={voice.voice_id} value={voice.voice_id}>
                                    {voice.name}
                                </option>
                            ))
                        ) : (
                            <option>{isApiKeyValidated ? 'جارٍ تحميل الأصوات...' : 'مفتاح API مطلوب'}</option>
                        )}
                    </select>
                </div>
                <h3 className="text-lg font-semibold text-white">المشاهد</h3>
            </div>
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                {script.scenes.map((scene, index) => {
                     const isCurrentScene = playbackState.sceneNumber === scene.sceneNumber;
                     const isLoadingAudio = isCurrentScene && playbackState.status === 'loading';
                     const isPlayingAudio = isCurrentScene && playbackState.status === 'playing';

                    return (
                        <div key={index} className="bg-gray-700/50 p-4 rounded-lg border-l-4 border-cyan-500">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-bold text-white">المشهد #{scene.sceneNumber}</h4>
                                <button
                                    onClick={() => handlePlayStop(scene)}
                                    className="p-2 rounded-full bg-gray-600 hover:bg-cyan-500 text-white transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-9 h-9"
                                    disabled={!isApiKeyValidated || !selectedVoiceId || (playbackState.status !== 'idle' && !isCurrentScene)}
                                    aria-label={isPlayingAudio ? 'إيقاف' : 'تشغيل'}
                                    title={isPlayingAudio ? 'إيقاف' : 'تشغيل السرد'}
                                >
                                    {isLoadingAudio ? <LoadingSpinner /> : (isPlayingAudio ? <StopIcon className="w-5 h-5" /> : <SpeakerWaveIcon className="w-5 h-5" />)}
                                </button>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-medium text-gray-400">التعليق الصوتي</label>
                                    <textarea value={scene.narration} onChange={(e) => handleSceneChange(index, 'narration', e.target.value)} rows={3} className="w-full bg-gray-900/50 p-2 rounded-md border border-gray-600 text-sm" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-400">الاقتراحات المرئية</label>
                                    <textarea value={scene.visualSuggestion} onChange={(e) => handleSceneChange(index, 'visualSuggestion', e.target.value)} rows={2} className="w-full bg-gray-900/50 p-2 rounded-md border border-gray-600 text-sm" />
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default ScriptDisplay;