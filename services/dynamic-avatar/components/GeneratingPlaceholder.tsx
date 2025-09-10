import React from 'react';
import Spinner from './Spinner';

interface GeneratingPlaceholderProps {
  message: string;
}

const GeneratingPlaceholder: React.FC<GeneratingPlaceholderProps> = ({ message }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center text-gray-400 p-4 bg-gray-900">
      <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-gray-600 animate-pulse">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" x2="9.01" y1="9" y2="9" />
        <line x1="15" x2="15.01" y1="9" y2="9" />
      </svg>
      <p className="mt-2 text-lg font-medium">Creating your animation...</p>
      <p className="mt-4 text-sm text-gray-500 min-h-[20px] transition-all duration-300">{message}</p>
      <div className="mt-6">
        <Spinner />
      </div>
    </div>
  );
};

export default GeneratingPlaceholder;
