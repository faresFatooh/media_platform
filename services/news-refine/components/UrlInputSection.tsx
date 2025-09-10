
import React from 'react';

interface UrlInputSectionProps {
  urls: string[];
  setUrls: React.Dispatch<React.SetStateAction<string[]>>;
}

export const UrlInputSection: React.FC<UrlInputSectionProps> = ({ urls, setUrls }) => {
  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const addUrlInput = () => {
    setUrls([...urls, '']);
  };

  const removeUrlInput = (index: number) => {
    if (urls.length > 2) {
      const newUrls = urls.filter((_, i) => i !== index);
      setUrls(newUrls);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-700">1. أدخل روابط الأخبار</h2>
      <p className="text-slate-500">
        أضف رابطين أو أكثر من مصادر مختلفة لنفس الحدث. سيقوم النظام بدمجها وتحليلها.
      </p>
      {urls.map((url, index) => (
        <div key={index} className="flex items-center space-x-2 space-x-reverse">
          <input
            type="url"
            value={url}
            onChange={(e) => handleUrlChange(index, e.target.value)}
            placeholder="https://example.com/news/story..."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
          />
          <button
            onClick={() => removeUrlInput(index)}
            disabled={urls.length <= 2}
            className="p-2 text-slate-400 hover:text-red-600 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
            aria-label="Remove URL"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      ))}
      <button
        onClick={addUrlInput}
        className="text-sm font-semibold text-sky-600 hover:text-sky-800"
      >
        + إضافة رابط آخر
      </button>
    </div>
  );
};
