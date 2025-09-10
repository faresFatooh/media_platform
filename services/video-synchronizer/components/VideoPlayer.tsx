import React, { useState, useEffect, forwardRef, useRef } from 'react';
import { SrtEntry } from '../types';
import { timeToSeconds } from '../utils/srtUtils';

interface VideoPlayerProps {
    src: string;
    subtitleEntries: SrtEntry[] | null;
    onTimeUpdate?: (time: number) => void;
}

export const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
    ({ src, subtitleEntries, onTimeUpdate }, ref) => {
        const [currentSubtitle, setCurrentSubtitle] = useState<string | null>(null);
        const internalVideoRef = useRef<HTMLVideoElement | null>(null);

        const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
            const videoElement = e.currentTarget;
            const currentTime = videoElement.currentTime;

            if (onTimeUpdate) {
                onTimeUpdate(currentTime);
            }

            if (!subtitleEntries || subtitleEntries.length === 0) {
                if (currentSubtitle !== null) {
                    setCurrentSubtitle(null);
                }
                return;
            }

            const activeEntry = subtitleEntries.find(entry => {
                const startTime = timeToSeconds(entry.startTime);
                const endTime = timeToSeconds(entry.endTime);
                return currentTime >= startTime && currentTime < endTime;
            });
            
            const newSubtitleText = activeEntry ? activeEntry.text : null;
            
            if (newSubtitleText !== currentSubtitle) {
                setCurrentSubtitle(newSubtitleText);
            }
        };

        useEffect(() => {
            setCurrentSubtitle(null);
        }, [src, subtitleEntries]);

        return (
            <div className="w-full h-full relative group bg-black rounded-lg overflow-hidden">
                <video
                    ref={(el) => {
                        internalVideoRef.current = el;
                        if (ref) {
                            if (typeof ref === 'function') {
                                ref(el);
                            } else {
                                ref.current = el;
                            }
                        }
                    }}
                    src={src}
                    controls
                    className="w-full h-full"
                    onTimeUpdate={handleTimeUpdate}
                >
                    Your browser does not support the video tag.
                </video>
                {currentSubtitle && (
                    <div className="absolute bottom-5 sm:bottom-8 lg:bottom-12 left-1/2 -translate-x-1/2 w-11/12 max-w-4xl text-center pointer-events-none">
                        <span
                            className="text-lg sm:text-xl lg:text-2xl font-semibold text-white bg-black/60 rounded-md px-4 py-2"
                            style={{
                                textShadow: '0 2px 4px rgba(0, 0, 0, 0.75)',
                            } as React.CSSProperties}
                            dangerouslySetInnerHTML={{ __html: currentSubtitle.replace(/\n/g, '<br />') }}
                        />
                    </div>
                )}
            </div>
        );
    }
);