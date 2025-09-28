import React, { useState } from 'react';
import type { GenerationResult } from '../types';
import { CopyButton } from './CopyButton';
import { LinkIcon } from './Icons';

interface GenerationResultDisplayProps {
  result: GenerationResult;
}

const GenerationResultDisplay: React.FC<GenerationResultDisplayProps> = ({ result }) => {
  const { text, sources } = result;
  const [showAllSources, setShowAllSources] = useState(false);

  // Robustly find the separator and split the content
  const separatorRegex = /\s*---\s*English Translation:/i;
  const match = text.match(separatorRegex);

  let arabicText = text;
  let englishFullText: string | null = null;
  let englishContent: string | null = null;
  const aiNotice = "This text was generated with the assistance of AI.";

  if (match && typeof match.index === 'number') {
    arabicText = text.substring(0, match.index).trim();
    const restOfText = text.substring(match.index + match[0].length).trim();
    
    // The Gemini prompt requires the translation to start with the notice.
    if(restOfText.startsWith(aiNotice)){
        englishFullText = restOfText;
        englishContent = restOfText.substring(aiNotice.length).trim();
    } else {
        // Fallback if the notice is missing for some reason
        englishFullText = `${aiNotice}\n\n${restOfText}`;
        englishContent = restOfText;
    }

  } else if (text.trim().startsWith(aiNotice)) {
      // Handle cases where only english translation might be returned (e.g., error messages)
      arabicText = '';
      englishFullText = text.trim();
      englishContent = englishFullText.substring(aiNotice.length).trim();
  }


  const visibleSources = sources ? (showAllSources ? sources : sources.slice(0, 3)) : [];

  return (
    <div className="mt-6 space-y-4">
      {arabicText && (
        <div className="p-4 bg-gray-900 rounded-lg border border-gray-700 text-right" dir="rtl">
          <div className="flex justify-between items-center mb-2">
            <CopyButton textToCopy={arabicText} />
            <h3 className="text-lg font-semibold text-green-400">النتيجة:</h3>
          </div>
          <div className="text-gray-300 leading-relaxed whitespace-pre-wrap font-sans">
            {arabicText}
          </div>
        </div>
      )}

      {englishContent !== null && (
        <div className="p-4 bg-gray-900 rounded-lg border border-gray-700 text-left" dir="ltr">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-green-400">English Translation</h3>
            <CopyButton textToCopy={englishFullText || ''} />
          </div>
          <p className="text-sm text-gray-400 italic mb-3">{aiNotice}</p>
          <div className="text-gray-300 leading-relaxed whitespace-pre-wrap font-sans">
            {englishContent}
          </div>
        </div>
      )}

      {sources && sources.length > 0 && (
        <div className="p-4 bg-gray-900 rounded-lg border border-gray-700 text-right" dir="rtl">
          <h4 className="text-md font-semibold text-gray-400 mb-2">المصادر من بحث جوجل:</h4>
          <ul className="space-y-2">
            {visibleSources.map((source, index) => (
              source.web && (
                <li key={index} className="flex items-start">
                  <LinkIcon className="h-4 w-4 ml-2 text-gray-500 flex-shrink-0 mt-1" />
                  <a
                    href={source.web.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline break-all"
                  >
                    {source.web.title || source.web.uri}
                  </a>
                </li>
              )
            ))}
          </ul>
          {sources.length > 3 && (
            <button
              onClick={() => setShowAllSources(!showAllSources)}
              className="text-green-500 hover:text-green-400 text-sm mt-3 font-semibold"
            >
              {showAllSources ? 'إظهار أقل' : `إظهار الكل (${sources.length})`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default GenerationResultDisplay;
