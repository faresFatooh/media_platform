import React, { useState } from 'react';
import { ContentTemplate, GenerationResult, Platform } from '../types';
import { generateContent } from '../services/geminiService';
import { Spinner } from './Spinner';
import GenerationResultDisplay from './GenerationResultDisplay';
import { ChevronDownIcon, ChevronUpIcon, FactCheckIcon, CalendarDaysIcon } from './Icons';

interface ContentCardProps {
  template: ContentTemplate;
}

const ContentCard: React.FC<ContentCardProps> = ({ template }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [formState, setFormState] = useState<Record<string, string>>(() => 
    template.fields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {})
  );
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    });
  };

  const useGoogleSearch = template.platform === Platform.FactCheck || template.platform === Platform.General;

  const handleGenerate = async () => {
    const prompt = template.prompt(formState);
    setIsLoading(true);
    setResult(null);
    const generationResult = await generateContent(prompt, useGoogleSearch);
    setResult(generationResult);
    setIsLoading(false);
  };

  const isFormValid = template.fields.length === 0 || template.fields.every(field => formState[field.name]?.trim() !== '');

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden transition-all duration-300">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-right p-4 flex justify-between items-center bg-gray-800 hover:bg-gray-700"
      >
        <div className="text-right">
          <h3 className="text-lg font-bold text-white">{template.title}</h3>
          <p className="text-sm text-gray-400">{template.description}</p>
        </div>
        {isExpanded 
            ? <ChevronUpIcon className="h-6 w-6 text-gray-400" /> 
            : <ChevronDownIcon className="h-6 w-6 text-gray-400" />}
      </button>

      {isExpanded && (
        <div className="p-4 border-t border-gray-700" dir="rtl">
          <div className="space-y-4">
            {template.fields.map(field => (
              <div key={field.name}>
                <label htmlFor={field.name} className="block text-sm font-medium text-gray-300 mb-1 text-right">
                  {field.label}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    id={field.name}
                    name={field.name}
                    value={formState[field.name]}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md text-gray-200 focus:ring-2 focus:ring-green-500"
                    rows={3}
                  />
                ) : (
                  <input
                    type="text"
                    id={field.name}
                    name={field.name}
                    value={formState[field.name]}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md text-gray-200 focus:ring-2 focus:ring-green-500"
                  />
                )}
              </div>
            ))}
            <div className="flex justify-between items-center pt-2">
                {useGoogleSearch && (
                    <div className="text-sm text-blue-400 flex items-center">
                        {template.platform === Platform.FactCheck && <FactCheckIcon className="h-4 w-4 ml-1"/>}
                        {template.platform === Platform.General && <CalendarDaysIcon className="h-4 w-4 ml-1"/>}
                        <span>سيتم استخدام بحث جوجل تلقائيًا</span>
                    </div>
                )}
                <div className="flex-grow"></div>
                <button
                    onClick={handleGenerate}
                    disabled={!isFormValid || isLoading}
                    className="flex items-center justify-center px-5 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                    {isLoading ? <Spinner /> : 'ولّد المحتوى'}
                </button>
            </div>
          </div>
          {result && <GenerationResultDisplay result={result} />}
        </div>
      )}
    </div>
  );
};

export default ContentCard;