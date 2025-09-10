// Implemented AudioControls component for text-to-speech functionality.
import React, { useState, useEffect, useRef } from 'react';
import { SpeakerIcon } from './icons/SpeakerIcon';
import { generateAudioFromElevenLabs } from '../services/elevenLabsService';
import type { AudioPrefs } from '../types';

export const AudioControls: React.FC<{
    text: string;
    title?: string;
    description?: string;
}> = ({
    text,
    title = "الاستماع للخبر",
    description = "استمع إلى المقال صوتيًا بجودة عالية."
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    // When the text changes, reset the audio so a new one can be generated.
    useEffect(() => {
        setAudioUrl(null);
        setError(null);
    }, [text]);

    const handleGenerateAndPlay = async () => {
        if (audioUrl && audioRef.current) {
            audioRef.current.play();
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            // Using default preferences as this is a general-purpose component.
            const defaultPrefs: AudioPrefs = {
                voice: 'Adam',
                stability: 0.75,
                similarity_boost: 0.75,
            };
            const url = await generateAudioFromElevenLabs(text, defaultPrefs);
            setAudioUrl(url);
        } catch (err) {
            setError('فشل توليد الصوت. الرجاء المحاولة مرة أخرى.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        // Auto-play when the URL is set.
        if (audioUrl && audioRef.current) {
            audioRef.current.play();
        }
    }, [audioUrl]);

    if (!text) {
        return null;
    }

    return (
        <div className="p-6 bg-slate-50 border-t border-b border-slate-200 space-y-4">
            <div className="flex items-center">
                <div className="bg-sky-100 text-sky-600 p-2 rounded-full ml-3">
                    <SpeakerIcon />
                </div>
                <div>
                    <h4 className="font-bold text-slate-700">{title}</h4>
                    <p className="text-sm text-slate-500">{description}</p>
                </div>
            </div>
            
            {!audioUrl && (
                <button 
                    onClick={handleGenerateAndPlay}
                    disabled={isLoading}
                    className="w-full bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-sky-700 disabled:bg-slate-400 flex items-center justify-center gap-2"
                >
                    {isLoading && <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>}
                    <span>{isLoading ? '...جاري توليد الصوت' : 'توليد واستماع بجودة عالية'}</span>
                </button>
            )}

            {audioUrl && <audio ref={audioRef} controls src={audioUrl} className="w-full rounded-lg" />}
            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        </div>
    );
};