
import React from 'react';

interface VideoResultProps {
  videoUrl: string;
  subtitles: string;
  imageFileName: string;
}

const VideoResult: React.FC<VideoResultProps> = ({ videoUrl, subtitles, imageFileName }) => {
  const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const baseFileName = imageFileName.split('.').slice(0, -1).join('.') || 'avatar_video';

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <video
        key={videoUrl}
        controls
        className="max-w-full max-h-[70%] rounded-lg"
        crossOrigin="anonymous"
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="mt-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
        <a 
            href={videoUrl} 
            download={`${baseFileName}.mp4`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 flex items-center space-x-2"
        >
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            <span>Download Video</span>
        </a>
        <button
          onClick={() => downloadFile(subtitles, `${baseFileName}.srt`, 'text/plain')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 flex items-center space-x-2"
        >
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2Z"/><path d="M9 8h6"/><path d="M9 12h6"/><path d="M9 16h2"/></svg>
            <span>Download SRT</span>
        </button>
      </div>
    </div>
  );
};

export default VideoResult;
