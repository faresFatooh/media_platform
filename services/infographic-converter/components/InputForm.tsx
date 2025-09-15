
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
}

export const InputForm: React.FC<InputFormProps> = ({ mainTitle, setMainTitle, rawText, setRawText, numberOfSlides, setNumberOfSlides, onGenerate, isLoading }) => {
    
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
                
                <div>
                    <label htmlFor="rawText" className="block text-lg font-semibold text-gray-700 mb-2">
                        النص الكامل
                    </label>
                    <textarea
                        id="rawText"
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        placeholder="ألصق مقالتك أو تقريرك الكامل هنا... سيقوم الذكاء الاصطناعي بتحليله وتقسيمه إلى شرائح."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg h-60 resize-y focus:ring-2 focus:ring-[#007BFF] focus:border-transparent transition"
                        disabled={isLoading}
                    />
                </div>

                <div>
                    <label htmlFor="numberOfSlides" className="block text-lg font-semibold text-gray-700 mb-2">
                        عدد الشرائح المطلوب (1-10)
                    </label>
                    <input
                        type="number"
                        id="numberOfSlides"
                        value={numberOfSlides}
                        onChange={(e) => {
                            const val = e.target.value;
                            // Allow empty input for user typing, but clamp value
                            if (val === '') {
                                setNumberOfSlides(1); // Or handle as you see fit
                            } else {
                                setNumberOfSlides(Math.max(1, Math.min(10, parseInt(val, 10))));
                            }
                        }}
                        min="1"
                        max="10"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007BFF] focus:border-transparent transition"
                        disabled={isLoading}
                    />
                </div>
                
                <div>
                    <button
                        onClick={onGenerate}
                        disabled={isLoading}
                        className="w-full bg-[#007BFF] text-white font-bold py-4 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center text-xl"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ms-1 me-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="http://www.w3.org/2000/svg">
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
