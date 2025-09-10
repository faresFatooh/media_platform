import React, { useEffect } from 'react';
import { SyncResult } from '../types';
import { DownloadIcon, ClipboardIcon, EditIcon } from './Icons';

interface ResultsViewerProps {
    results: SyncResult;
    videoFileName: string;
    onSelectPreview: (srtContent: string) => void;
    onEdit: (trackKey: string, srtContent: string) => void;
    activeTrackContent: string | null;
}

export const ResultsViewer: React.FC<ResultsViewerProps> = ({ results, videoFileName, onSelectPreview, onEdit, activeTrackContent }) => {

    useEffect(() => {
        // Automatically select the default preview when results load
        const srtContent = results.synchronized ?? results.original ?? null;
        if (srtContent) {
            onSelectPreview(srtContent);
        }
    }, [results, onSelectPreview]);


    const handleDownload = (content: string | null, name: string) => {
        if (!content) return;
        const blob = new Blob([content], { type: 'text/srt' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const baseName = videoFileName.replace(/\.[^/.]+$/, "");
        a.download = `${baseName}.${name}.srt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleCopy = (content: string | null, button: EventTarget) => {
        if (!content) return;
        const plainText = content
            .replace(/^\d+\n[\d:,->\s]+\n/gm, '')
            .replace(/\n\n/g, '\n')
            .trim();
        navigator.clipboard.writeText(plainText);
        
        const el = button as HTMLButtonElement;
        const originalText = el.innerHTML;
        el.textContent = 'Copied!';
        setTimeout(() => {
           el.innerHTML = originalText;
        }, 1500);
    };

    const renderSrtViewer = (
        srtContent: string,
        namePrefix: string
    ) => {
        const isActive = srtContent === activeTrackContent;
        return (
            <div className="bg-gray-900/50 p-4 rounded-lg">
                <div 
                    className={`bg-gray-900 p-3 rounded-md h-48 overflow-y-auto font-mono text-sm mb-3 cursor-pointer transition-all duration-300 border ${isActive ? 'ring-2 ring-purple-500 border-purple-600' : 'border-gray-700 hover:border-gray-500'}`}
                    onClick={() => onSelectPreview(srtContent)}
                    title="Click to preview this version"
                >
                    <pre>{srtContent}</pre>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <ActionButton 
                        onClick={() => onEdit(namePrefix, srtContent)}
                        icon={<EditIcon />}
                        label="Edit"
                        className="bg-yellow-600 hover:bg-yellow-700"
                    />
                    <ActionButton 
                        onClick={() => handleDownload(
                            srtContent,
                            namePrefix
                        )}
                        icon={<DownloadIcon />}
                        label="Download .SRT"
                        className="bg-green-600 hover:bg-green-700"
                    />
                    <ActionButton 
                        onClick={(e) => handleCopy(
                            srtContent,
                            e.currentTarget
                        )}
                        icon={<ClipboardIcon />}
                        label="Copy Transcript"
                        className="bg-blue-600 hover:bg-blue-700"
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col space-y-4 pt-4 border-t border-gray-700 animate-fade-in">
            <h3 className="text-xl font-semibold text-green-400 text-center">Synchronization Complete!</h3>
            
            {results.synchronized && renderSrtViewer(
                results.synchronized,
                'synchronized'
            )}

            {results.original && (
                <div>
                    <h4 className="font-semibold text-lg my-2 text-gray-300">Original Language</h4>
                    {renderSrtViewer(
                        results.original,
                        'original'
                    )}
                </div>
            )}

            {results.arabic && (
                 <div>
                    <h4 className="font-semibold text-lg my-2 text-gray-300">Arabic Translation</h4>
                    {renderSrtViewer(
                        results.arabic,
                        'ar'
                    )}
                </div>
            )}
        </div>
    );
};

const ActionButton: React.FC<{
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    icon: React.ReactNode;
    label: string;
    className?: string;
}> = ({ onClick, icon, label, className = '' }) => (
     <button
        onClick={onClick}
        className={`w-full text-white font-bold py-2 px-3 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center space-x-2 text-sm shadow-md ${className}`}
    >
        {icon}
        <span>{label}</span>
    </button>
);