import React, { useState, useRef, useCallback, useEffect } from 'react';
import { synchronizeSubtitles, refineSubtitles } from './services/geminiService';
import { timeToSeconds, parseSrt, convertEntriesToSrt, srtTimeToMilliseconds, millisecondsToSrtTime } from './utils/srtUtils';
import { VideoPlayer } from './components/VideoPlayer';
import { Loader } from './components/Loader';
import { ResultsViewer } from './components/ResultsViewer';
import { FilmIcon, TextIcon, UploadIcon, AlertTriangleIcon, DownloadIcon, SparklesIcon, LinkIcon } from './components/Icons';
import { SyncResult, SrtEntry } from './types';


const handleDownloadSrt = (content: string, baseName: string, suffix: string) => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/srt' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanBaseName = baseName.replace(/\.[^/.]+$/, "");
    a.download = `${cleanBaseName}.${suffix}.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};


// EDITOR COMPONENT
interface SubtitleEditorProps {
    entries: SrtEntry[];
    videoRef: React.RefObject<HTMLVideoElement>;
    currentTime: number;
    isRefined: boolean;
    isLoading: boolean;
    timeShift: number;
    onUpdate: (index: number, newText: string) => void;
    onRefine: () => void;
    onSave: () => void;
    onCancel: () => void;
    onTimeShiftChange: (shift: number) => void;
    onRemoveGaps: () => void;
}

const SubtitleEditor: React.FC<SubtitleEditorProps> = ({ entries, videoRef, currentTime, isRefined, isLoading, timeShift, onUpdate, onRefine, onSave, onCancel, onTimeShiftChange, onRemoveGaps }) => {
    
    const handleEntryClick = (startTime: string) => {
        const videoElement = videoRef.current;
        if (videoElement) {
            const onSeeked = () => {
                videoElement.play().catch(error => {
                    console.error("Error attempting to play video after seek:", error);
                });
            };

            // Use { once: true } to automatically remove the listener after it fires.
            videoElement.addEventListener('seeked', onSeeked, { once: true });
            videoElement.currentTime = timeToSeconds(startTime);
        }
    };

    return (
        <div className="flex flex-col space-y-4 pt-4 mt-4 border-t border-gray-700 animate-fade-in">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-purple-400">Subtitle Editor</h3>
                <div className="flex space-x-3">
                     <button onClick={onCancel} className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                        Cancel
                    </button>
                    {isRefined ? (
                        <button onClick={onSave} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 flex items-center space-x-2">
                            <DownloadIcon />
                            <span>Save and Export</span>
                        </button>
                    ) : (
                        <button onClick={onRefine} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 flex items-center space-x-2">
                           <SparklesIcon />
                           <span>{isLoading ? 'Refining...' : 'Refine with AI'}</span>
                        </button>
                    )}
                </div>
            </div>
            
            <div className="flex flex-col gap-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 sm:space-x-4">
                    <label htmlFor="time-shift" className="font-semibold text-gray-300 whitespace-nowrap">Global Time Shift (sec):</label>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => onTimeShiftChange(parseFloat((timeShift - 0.1).toFixed(2)))} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded-md transition-colors">-0.1s</button>
                        <input
                            type="number"
                            id="time-shift"
                            value={timeShift.toFixed(2)}
                            onChange={(e) => onTimeShiftChange(parseFloat(e.target.value) || 0)}
                            step="0.1"
                            className="w-24 bg-gray-900 border border-gray-600 rounded-md p-1 text-center text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                        <button onClick={() => onTimeShiftChange(parseFloat((timeShift + 0.1).toFixed(2)))} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded-md transition-colors">+0.1s</button>
                    </div>
                </div>
                <button 
                    onClick={onRemoveGaps}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 text-sm"
                >
                    <LinkIcon />
                    <span>Remove Gaps Between Subtitles</span>
                </button>
            </div>


            <div className="bg-gray-900/50 p-3 rounded-lg h-[26rem] overflow-y-auto space-y-3 border border-gray-700">
                {entries.map((entry, index) => {
                    const startTimeSec = timeToSeconds(entry.startTime);
                    const endTimeSec = timeToSeconds(entry.endTime);
                    const isActive = currentTime >= startTimeSec && currentTime < endTimeSec;
                    const entryClasses = `grid grid-cols-[max-content_1fr] gap-4 items-start p-2 rounded-md hover:bg-gray-700/50 transition-colors duration-150 ${isActive ? 'bg-purple-800/60 ring-2 ring-purple-500' : ''}`;

                    return (
                        <div key={`${entry.id}-${index}`} className={entryClasses}>
                            <div 
                                className="font-mono text-sm text-gray-400 cursor-pointer pt-1" 
                                onClick={() => handleEntryClick(entry.startTime)}
                                title="Click to seek video"
                            >
                                <div className="whitespace-nowrap">{entry.startTime}</div>
                                <div className="whitespace-nowrap">&darr;</div>
                                <div className="whitespace-nowrap">{entry.endTime}</div>
                            </div>
                            <textarea 
                                value={entry.text}
                                onChange={(e) => onUpdate(index, e.target.value)}
                                className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-base"
                                rows={2}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


// MAIN APP COMPONENT
export default function App() {
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [textFile, setTextFile] = useState<File | null>(null);
    const [pastedText, setPastedText] = useState<string>('');
    const [videoSrc, setVideoSrc] = useState<string | null>(null);
    
    const [results, setResults] = useState<SyncResult | null>(null);
    const [activeTrackContent, setActiveTrackContent] = useState<string | null>(null);
    const [activeSubtitleEntries, setActiveSubtitleEntries] = useState<SrtEntry[] | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [processingStep, setProcessingStep] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    
    // Editing State
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editedSrtData, setEditedSrtData] = useState<SrtEntry[] | null>(null);
    const [originalSrtData, setOriginalSrtData] = useState<SrtEntry[] | null>(null);
    const [activeEditingTrackKey, setActiveEditingTrackKey] = useState<string | null>(null);
    const [isRefined, setIsRefined] = useState<boolean>(false);
    const [videoTime, setVideoTime] = useState(0);
    const [timeShift, setTimeShift] = useState(0);


    const videoRef = useRef<HTMLVideoElement>(null);

    const resetState = () => {
        setResults(null);
        setActiveTrackContent(null);
        setActiveSubtitleEntries(null);
        setIsEditing(false);
        setEditedSrtData(null);
        setOriginalSrtData(null);
        setActiveEditingTrackKey(null);
        setIsRefined(false);
        setTimeShift(0);
    };

    useEffect(() => {
        return () => {
            if (videoSrc) URL.revokeObjectURL(videoSrc);
        };
    }, []);

    useEffect(() => {
        if (isEditing && editedSrtData) {
            setActiveSubtitleEntries(editedSrtData);
        } else if (!isEditing && activeTrackContent) {
            setActiveSubtitleEntries(parseSrt(activeTrackContent));
        } else {
            setActiveSubtitleEntries(null);
        }
    }, [isEditing, editedSrtData, activeTrackContent]);

    useEffect(() => {
        if (!isEditing || !originalSrtData) return;

        if (Math.abs(timeShift) < 0.001) {
            if (editedSrtData !== originalSrtData) {
                 setEditedSrtData(originalSrtData);
            }
            return;
        }

        const shiftMs = timeShift * 1000;
        const shiftedData = originalSrtData.map(entry => ({
            ...entry,
            startTime: millisecondsToSrtTime(srtTimeToMilliseconds(entry.startTime) + shiftMs),
            endTime: millisecondsToSrtTime(srtTimeToMilliseconds(entry.endTime) + shiftMs),
        }));
        setEditedSrtData(shiftedData);

    }, [timeShift, originalSrtData, isEditing]);

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setVideoFile(file);
            setVideoSrc(oldSrc => {
                if (oldSrc) URL.revokeObjectURL(oldSrc);
                return URL.createObjectURL(file);
            });
            resetState();
            setError(null);
        }
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setTextFile(file);
            setPastedText('');
            resetState();
            setError(null);
        }
    };

    const handlePastedTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPastedText(e.target.value);
        if (textFile) setTextFile(null);
        resetState();
        setError(null);
    };

    const handleSync = useCallback(async () => {
        if (!videoFile) return;

        setIsLoading(true);
        setError(null);
        resetState();

        try {
            const textContent = pastedText || (textFile ? await textFile.text() : null);

            setProcessingStep(textContent ? 'AI is analyzing and aligning subtitles...' : 'AI is transcribing and translating...');
            const result: SyncResult = await synchronizeSubtitles(videoFile, textContent);
            
            setProcessingStep('Finalizing results...');
            setResults(result);

            if (result.synchronized) {
                setActiveTrackContent(result.synchronized);
            } else if (result.original) {
                setActiveTrackContent(result.original);
            }

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred during synchronization.');
        } finally {
            setIsLoading(false);
            setProcessingStep('');
        }
    }, [videoFile, textFile, pastedText]);

    const handleEditRequest = (trackKey: string, srtContent: string) => {
        const parsedData = parseSrt(srtContent);
        setActiveEditingTrackKey(trackKey);
        setOriginalSrtData(parsedData);
        setEditedSrtData(parsedData);
        setTimeShift(0);
        setIsRefined(false);
        setIsEditing(true);
    };

    const handleUpdateSrtEntry = (index: number, newText: string) => {
        if (!originalSrtData) return;
        const newData = [...originalSrtData];
        newData[index] = { ...newData[index], text: newText };
        setOriginalSrtData(newData);
        setIsRefined(false); // Any change requires re-refining
    };
    
    const handleRefineWithAI = async () => {
        if (!videoFile || !originalSrtData) return;

        setIsLoading(true);
        setError(null);
        setProcessingStep("AI is re-synchronizing your edits...");

        try {
            const correctedText = originalSrtData.map(entry => entry.text).join('\n');
            const refinedEntries = await refineSubtitles(videoFile, correctedText);
            setOriginalSrtData(refinedEntries);
            setEditedSrtData(refinedEntries);
            setTimeShift(0);
            setIsRefined(true);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred during refinement.');
        } finally {
            setIsLoading(false);
            setProcessingStep("");
        }
    };

    const handleRemoveGaps = () => {
        if (!originalSrtData) return;

        const newData = JSON.parse(JSON.stringify(originalSrtData));
        if (newData.length < 2) return;

        for (let i = 1; i < newData.length; i++) {
            const prevEntry = newData[i-1];
            const currentEntry = newData[i];

            const prevEndTimeMs = srtTimeToMilliseconds(prevEntry.endTime);
            const currentStartTimeMs = srtTimeToMilliseconds(currentEntry.startTime);
            const currentEndTimeMs = srtTimeToMilliseconds(currentEntry.endTime);
            
            const durationMs = currentEndTimeMs - currentStartTimeMs;
            if (durationMs < 0) continue; 

            const newStartTimeMs = prevEndTimeMs;
            const newEndTimeMs = newStartTimeMs + durationMs;

            currentEntry.startTime = millisecondsToSrtTime(newStartTimeMs);
            currentEntry.endTime = millisecondsToSrtTime(newEndTimeMs);
        }
        
        setOriginalSrtData(newData);
        setIsRefined(false);
    };

    const handleFinalizeAndExport = () => {
        if (!editedSrtData || !videoFile || !activeEditingTrackKey) return;
        const newSrtContent = convertEntriesToSrt(editedSrtData);
        handleDownloadSrt(newSrtContent, videoFile.name, `${activeEditingTrackKey}.refined`);

        // Exit editing mode and update results
        setIsEditing(false);
        setEditedSrtData(null);
        setActiveTrackContent(newSrtContent);
        
        // Optionally update the main results state so the change persists
        if (results && activeEditingTrackKey) {
            const group = activeEditingTrackKey as keyof SyncResult;
            if (results[group] !== undefined) {
                 const newResults = {...results};
                 newResults[group] = newSrtContent;
                 setResults(newResults);
            }
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedSrtData(null);
        setActiveEditingTrackKey(null);
    };
    
    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                        AI Video Subtitle Synchronizer
                    </h1>
                    <p className="mt-2 text-lg text-gray-400">
                        Generate, edit, and export frame-accurate subtitles for any video.
                    </p>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="flex flex-col space-y-6 bg-gray-800 p-6 rounded-2xl shadow-lg">
                        {!isEditing && (
                            <>
                                <FileUploadBox
                                    title="1. Upload Video"
                                    icon={<FilmIcon />}
                                    file={videoFile}
                                    onChange={handleVideoChange}
                                    accept="video/mp4,video/webm,video/ogg"
                                />

                                <div className="space-y-4">
                                    <FileUploadBox
                                        title="2. Upload Translation Text (Optional)"
                                        icon={<TextIcon />}
                                        file={textFile}
                                        onChange={handleTextChange}
                                        accept=".txt"
                                    />
                                    
                                    <div className="relative flex items-center">
                                        <div className="flex-grow border-t border-gray-600"></div>
                                        <span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span>
                                        <div className="flex-grow border-t border-gray-600"></div>
                                    </div>
                                    
                                     <div className="bg-gray-700/50 p-4 rounded-lg border-2 border-dashed border-gray-600 hover:border-purple-500 transition-colors duration-300">
                                        <label htmlFor="pasted-text" className="font-semibold text-gray-200 mb-2 block cursor-text">
                                            Paste Translation Text
                                        </label>
                                        <textarea
                                            id="pasted-text"
                                            value={pastedText}
                                            onChange={handlePastedTextChange}
                                            placeholder="Paste your full transcript or subtitles here..."
                                            className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                            rows={4}
                                        />
                                    </div>
                                </div>
                                
                                <div className="pt-2">
                                    <button
                                        onClick={handleSync}
                                        disabled={!videoFile || isLoading}
                                        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center text-lg shadow-md"
                                    >
                                        {isLoading ? 'Synchronizing...' : 'Sync Subtitles'}
                                    </button>
                                </div>
                            </>
                        )}
                        
                        {isLoading && !isEditing && <Loader message={processingStep} />}

                        {error && (
                            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg flex items-center space-x-3">
                                <AlertTriangleIcon />
                                <span><strong>Error:</strong> {error}</span>
                            </div>
                        )}
                        
                        {!isEditing && results && !isLoading && (
                            <ResultsViewer
                                results={results}
                                videoFileName={videoFile?.name || 'video'}
                                onSelectPreview={setActiveTrackContent}
                                onEdit={handleEditRequest}
                                activeTrackContent={activeTrackContent}
                            />
                        )}

                        {isEditing && editedSrtData && activeEditingTrackKey && videoFile && (
                            <SubtitleEditor 
                                entries={editedSrtData}
                                videoRef={videoRef}
                                currentTime={videoTime}
                                isRefined={isRefined}
                                isLoading={isLoading}
                                timeShift={timeShift}
                                onUpdate={handleUpdateSrtEntry}
                                onRefine={handleRefineWithAI}
                                onSave={handleFinalizeAndExport}
                                onCancel={handleCancelEdit}
                                onTimeShiftChange={setTimeShift}
                                onRemoveGaps={handleRemoveGaps}
                            />
                        )}
                    </div>

                    <div className="bg-gray-800 p-2 sm:p-4 rounded-2xl shadow-lg flex items-center justify-center min-h-[300px] lg:min-h-0">
                       {videoSrc ? (
                            <VideoPlayer 
                                src={videoSrc} 
                                subtitleEntries={activeSubtitleEntries}
                                ref={videoRef}
                                onTimeUpdate={setVideoTime} 
                            />
                        ) : (
                            <div className="text-center text-gray-500">
                                <FilmIcon className="w-24 h-24 mx-auto mb-4"/>
                                <p>Your video preview will appear here.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

interface FileUploadBoxProps {
    title: string;
    icon: React.ReactNode;
    file: File | null;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    accept: string;
}

const FileUploadBox: React.FC<FileUploadBoxProps> = ({ title, icon, file, onChange, accept }) => (
    <div className="bg-gray-700/50 p-4 rounded-lg border-2 border-dashed border-gray-600 hover:border-purple-500 transition-colors duration-300">
        <label className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 cursor-pointer">
            <span className="text-purple-400">{icon}</span>
            <div className="flex-grow">
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-gray-400">
                    {file ? file.name : `Click to select a file (${accept})`}
                </p>
            </div>
            <div className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2">
               <UploadIcon />
               <span>{file ? 'Change' : 'Select'}</span>
            </div>
            <input type="file" className="hidden" onChange={onChange} accept={accept} />
        </label>
    </div>
);