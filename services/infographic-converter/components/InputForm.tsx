
import React from 'react';

interface InputFormProps {
    mainTitle: string;
    setMainTitle: (title: string) => void;
    rawText: string;
    setRawText: (text: string) => void;
    numberOfSlides: number;
    setNumberOfSlides: (num: number) => void;
    onGenerate: () => void;
    isLoading: boolean;
    inputMode: 'fullText' | 'manual';
    setInputMode: (mode: 'fullText' | 'manual') => void;
    textChunks: string[];
    setTextChunks: (chunks: string[]) => void;
}

export const InputForm: React.FC<InputFormProps> = ({ 
    mainTitle, setMainTitle, 
    rawText, setRawText, 
    numberOfSlides, setNumberOfSlides, 
    onGenerate, isLoading,
    inputMode, setInputMode,
    textChunks, setTextChunks
}) => {
    
    const handleChunkChange = (index: number, value: string) => {
        const newChunks = [...textChunks];
        newChunks[index] = value;
        setTextChunks(newChunks);
    };

    const addChunk = () => {
        setTextChunks([...textChunks, '']);
    };

    const removeChunk = (index: number) => {
        if (textChunks.length > 1) {
            const newChunks = textChunks.filter((_, i) => i !== index);
            setTextChunks(newChunks);
        }
    };
    
    return (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <div className="space-y-6">
                <div>
                    <label htmlFor="mainTitle" className="block text-lg font-semibold text-gray-700 mb-2">
                        العنوان الرئيسي للموضوع
                    </label>
                    <input
                        type="text"
                        id="mainTitle"
                        value={mainTitle}
                        onChange={(e) => setMainTitle(e.target.value)}
                        placeholder="مثال: مستقبل الطاقة المتجددة في الشرق الأوسط"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007BFF] focus:border-transparent transition"
                        disabled={isLoading}
                    />
                </div>
                
                <div className="flex items-center bg-gray-100 rounded-lg p-1.5">
                    <button 
                        onClick={() => setInputMode('fullText')}
                        className={`w-1/2 py-2.5 text-center font-semibold rounded-md transition-all duration-300 ${inputMode === 'fullText' ? 'bg-white text-[#007BFF] shadow' : 'text-gray-600 hover:bg-gray-200'}`}
                        aria-pressed={inputMode === 'fullText'}
                    >
                        النص الكامل (تلقائي)
                    </button>
                    <button 
                        onClick={() => setInputMode('manual')}
                        className={`w-1/2 py-2.5 text-center font-semibold rounded-md transition-all duration-300 ${inputMode === 'manual' ? 'bg-white text-[#007BFF] shadow' : 'text-gray-600 hover:bg-gray-200'}`}
                        aria-pressed={inputMode === 'manual'}
                    >
                        إدخال يدوي للشرائح
                    </button>
                </div>
                
                {inputMode === 'fullText' ? (
                    <div className="space-y-6 border-t border-gray-200 pt-6">
                        <div>
                            <label htmlFor="rawText" className="block text-lg font-semibold text-gray-700 mb-2">
                                النص الكامل للموضوع
                            </label>
                            <textarea
                                id="rawText"
                                value={rawText}
                                onChange={(e) => setRawText(e.target.value)}
                                placeholder="الصق المقال أو التقرير الكامل هنا..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg h-64 resize-y focus:ring-2 focus:ring-[#007BFF] focus:border-transparent transition"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="numberOfSlides" className="block text-lg font-semibold text-gray-700 mb-2">
                                عدد الشرائح المطلوب
                            </label>
                            <input
                                type="number"
                                id="numberOfSlides"
                                value={numberOfSlides}
                                onChange={(e) => {
                                    const value = e.target.value === '' ? 1 : parseInt(e.target.value, 10);
                                    setNumberOfSlides(Math.max(1, Math.min(15, value)));
                                }}
                                min="1"
                                max="15"
                                className="w-full md:w-1/3 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007BFF] focus:border-transparent transition"
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 border-t border-gray-200 pt-6">
                         <label className="block text-lg font-semibold text-gray-700 mb-2">
                            محتوى الشرائح
                        </label>
                        {textChunks.map((chunk, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <textarea
                                    value={chunk}
                                    onChange={(e) => handleChunkChange(index, e.target.value)}
                                    placeholder={`أدخل محتوى الشريحة #${index + 1}`}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg h-24 resize-y focus:ring-2 focus:ring-[#007BFF] focus:border-transparent transition"
                                    disabled={isLoading}
                                    aria-label={`محتوى الشريحة ${index + 1}`}
                                />
                                <button
                                    onClick={() => removeChunk(index)}
                                    disabled={isLoading || textChunks.length <= 1}
                                    className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition flex-shrink-0"
                                    aria-label={`إزالة الشريحة ${index + 1}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                        ))}
                         <button
                            onClick={addChunk}
                            disabled={isLoading}
                            className="w-full border-2 border-dashed border-gray-300 text-gray-600 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#007BFF] transition-all duration-200 ease-in-out disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            إضافة شريحة جديدة
                        </button>
                    </div>
                )}
                
                <div>
                    <button
                        onClick={onGenerate}
                        disabled={isLoading}
                        className="w-full bg-[#007BFF] text-white font-bold py-4 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center text-xl"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ms-1 me-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                جاري المعالجة...
                            </>
                        ) : (
                            'تحويل إلى انفوجرافيك'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
