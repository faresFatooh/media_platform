import React, { useState } from 'react';
import { ClipboardIcon, CheckIcon } from './Icons';

interface CopyButtonProps {
  textToCopy: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ textToCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center space-x-2 rtl:space-x-reverse px-3 py-1.5 rounded-md transition-all duration-300 text-sm ${
        copied 
        ? 'bg-green-600 text-white' 
        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
      aria-label={copied ? "Copied!" : "Copy to clipboard"}
      disabled={!textToCopy}
    >
      {copied ? (
        <>
          <CheckIcon className="h-4 w-4" />
          <span>تم النسخ!</span>
        </>
      ) : (
        <>
          <ClipboardIcon className="h-4 w-4" />
          <span>نسخ</span>
        </>
      )}
    </button>
  );
};
