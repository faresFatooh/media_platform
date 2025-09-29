import React, { useState, useEffect } from 'react';
import { LightBulbIcon, DocumentTextIcon, TemplateIcon, KeyIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon, XCircleIcon } from './icons';
import { validateElevenLabsApiKey } from '../services/elevenLabsService';
import LoadingSpinner from './LoadingSpinner';

interface ControlsProps {
    topic: string;
    setTopic: (topic: string) => void;
    duration: number;
    setDuration: (duration: number) => void;
    onGenerateIdeas: () => void;
    onGenerateTemplates: () => void;
    onGenerateScript: () => void;
    isLoadingIdeas: boolean;
    isLoadingTemplates: boolean;
    isLoadingScript: boolean;
    elevenLabsApiKey: string;
    onApiKeyChange: (key: string) => void;
    isApiKeyValidated: boolean;
    onValidateApiKey: (isValid: boolean) => void;
}

const Controls: React.FC<ControlsProps> = ({
    topic,
    setTopic,
    duration,
    setDuration,
    onGenerateIdeas,
    onGenerateTemplates,
    onGenerateScript,
    isLoadingIdeas,
    isLoadingTemplates,
    isLoadingScript,
    elevenLabsApiKey,
    onApiKeyChange,
    isApiKeyValidated,
    onValidateApiKey,
}) => {
    const [showApiKey, setShowApiKey] = useState(false);
    const [validationStatus, setValidationStatus] = useState<'idle' | 'loading' | 'valid' | 'invalid'>('idle');
    const [validationMessage, setValidationMessage] = useState('');

    useEffect(() => {
        if (isApiKeyValidated) {
            setValidationStatus('valid');
            setValidationMessage('تم التحقق من المفتاح بنجاح.');
        } else if (elevenLabsApiKey) {
            setValidationStatus('idle');
            setValidationMessage('الرجاء الضغط على "تحقق" لتفعيل ميزة الصوت.');
        } else {
            setValidationStatus('idle');
            setValidationMessage('');
        }
    }, [isApiKeyValidated, elevenLabsApiKey]);

    const handleVerifyKey = async () => {
        setValidationStatus('loading');
        setValidationMessage('');
        const result = await validateElevenLabsApiKey(elevenLabsApiKey);
        onValidateApiKey(result.success);
        setValidationStatus(result.success ? 'valid' : 'invalid');
        setValidationMessage(result.message);
    };

    const getStatusColor = () => {
        switch (validationStatus) {
            case 'valid': return 'text-green-400';
            case 'invalid': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-xl shadow-2xl space-y-6 sticky top-20">
            <h2 className="text-xl font-semibold text-white border-b-2 border-cyan-500 pb-2">لوحة التحكم</h2>
            
            <div className="space-y-2">
                <label htmlFor="topic" className="block text-sm font-medium text-gray-300">1. أدخل موضوع الفيلم</label>
                <input
                    type="text"
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="مثال: تاريخ القهوة"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="duration" className="block text-sm font-medium text-gray-300">2. حدد مدة الفيديو (بالدقائق)</label>
                <div className="flex items-center gap-4">
                    <input
                        type="range"
                        id="duration"
                        min="2"
                        max="20"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                    <span className="bg-cyan-500 text-gray-900 text-sm font-semibold rounded-md px-3 py-1 w-16 text-center">{duration} د</span>
                </div>
            </div>

             <div className="border-t border-gray-700 pt-6 space-y-3">
                <label htmlFor="elevenlabs-key" className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <KeyIcon className="w-5 h-5 text-yellow-400" />
                    <span>مفتاح ElevenLabs API (للتعليق الصوتي)</span>
                </label>
                <div className="flex gap-2">
                    <div className="relative w-full">
                         <input
                            id="elevenlabs-key"
                            type={showApiKey ? 'text' : 'password'}
                            value={elevenLabsApiKey}
                            onChange={(e) => onApiKeyChange(e.target.value)}
                            placeholder="أدخل مفتاح API الخاص بك هنا"
                            className="w-full bg-gray-700 border border-gray-600 rounded-md pl-3 pr-10 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
                        />
                         <button onClick={() => setShowApiKey(!showApiKey)} className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-white">
                            {showApiKey ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                    </div>
                    <button onClick={handleVerifyKey} disabled={!elevenLabsApiKey || validationStatus === 'loading'} className="bg-yellow-500 text-gray-900 font-bold px-4 py-2 rounded-md hover:bg-yellow-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0">
                        {validationStatus === 'loading' ? <LoadingSpinner /> : 'تحقق'}
                    </button>
                </div>
                {validationMessage && (
                     <div className={`flex items-center gap-2 text-xs ${getStatusColor()}`}>
                        {validationStatus === 'valid' && <CheckCircleIcon className="w-4 h-4" />}
                        {validationStatus === 'invalid' && <XCircleIcon className="w-4 h-4" />}
                        <span>{validationMessage}</span>
                    </div>
                )}
            </div>

            <div className="border-t border-gray-700 pt-6 space-y-4">
                <button
                    onClick={onGenerateScript}
                    disabled={isLoadingScript || !topic}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                >
                    {isLoadingScript ? <LoadingSpinner /> : <DocumentTextIcon className="w-5 h-5" />}
                    <span>توليد نص الفيلم</span>
                </button>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={onGenerateIdeas}
                        disabled={isLoadingIdeas}
                        className="w-full flex items-center justify-center gap-2 bg-gray-700 text-gray-200 font-semibold py-2 px-3 rounded-lg hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        {isLoadingIdeas ? <LoadingSpinner /> : <LightBulbIcon className="w-5 h-5 text-yellow-300" />}
                        <span>أفكار رائجة</span>
                    </button>
                    <button
                        onClick={onGenerateTemplates}
                        disabled={isLoadingTemplates}
                        className="w-full flex items-center justify-center gap-2 bg-gray-700 text-gray-200 font-semibold py-2 px-3 rounded-lg hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        {isLoadingTemplates ? <LoadingSpinner /> : <TemplateIcon className="w-5 h-5 text-purple-300" />}
                        <span>اقتراح قوالب</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Controls;