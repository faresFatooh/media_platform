import React, { useState, useRef } from 'react';
import { MicrophoneIcon } from './icons/MicrophoneIcon';

export const TranscriptionTool: React.FC = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [status, setStatus] = useState('جاهز للبدء');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const handleStartRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            
            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                setIsProcessing(true);
                setStatus('جاري معالجة الصوت وتفريغه نصياً...');
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                // Here you would send the audioBlob to a speech-to-text API
                console.log("Audio Blob created:", audioBlob);

                // Simulate API call
                setTimeout(() => {
                    const simulatedText = "هذا النص هو نتيجة محاكاة لعملية التفريغ الصوتي. في التطبيق الفعلي، سيتم إرسال المقطع الصوتي إلى خدمة تحويل الكلام إلى نص للحصول على نتيجة دقيقة. يمكن بعد ذلك استخدام هذا النص لتوليد ملخصات، أو تحويله إلى سكريبت للمذيعين، أو أرشفته للرجوع إليه لاحقاً.";
                    setTranscript(simulatedText);
                    setIsProcessing(false);
                    setStatus('اكتمل التفريغ النصي بنجاح.');
                }, 3000);

                audioChunksRef.current = [];
                 // Stop all tracks to release the microphone
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setTranscript('');
            setStatus('يتم التسجيل الآن... اضغط لإيقاف التسجيل.');
        } catch (err) {
            console.error("Error accessing microphone:", err);
            setStatus('خطأ: لم يتمكن من الوصول إلى الميكروفون.');
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleButtonClick = () => {
        if (isRecording) {
            handleStopRecording();
        } else {
            handleStartRecording();
        }
    };

    return (
         <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">أداة التفريغ النصي والسكريبت</h1>
                <p className="text-slate-500 mt-1">حوّل المقابلات الصوتية إلى نصوص مكتوبة، أو جهّز سكريبت للمذيعين.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recording Section */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-700 mb-4">التسجيل المباشر</h3>
                    <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-lg">
                        <button 
                            onClick={handleButtonClick}
                            disabled={isProcessing}
                            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                                isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-sky-600 hover:bg-sky-700'
                            } disabled:bg-slate-400 disabled:cursor-not-allowed`}
                        >
                            <MicrophoneIcon className="h-10 w-10 text-white" />
                        </button>
                        <p className="mt-4 font-semibold text-slate-600">{status}</p>
                        {isProcessing && (
                            <div className="mt-2 w-full bg-slate-200 rounded-full h-2.5">
                                <div className="bg-sky-500 h-2.5 rounded-full animate-pulse"></div>
                            </div>
                        )}
                    </div>
                    <div className="mt-6">
                        <h4 className="font-bold text-slate-600 mb-2">تعليمات:</h4>
                        <ul className="list-disc pr-5 text-sm text-slate-500 space-y-1">
                            <li>اضغط على زر الميكروفون لبدء التسجيل.</li>
                            <li>تحدث بوضوح لضمان أفضل نتيجة.</li>
                            <li>اضغط على الزر مرة أخرى لإيقاف التسجيل.</li>
                            <li>سيتم عرض النص المفرّغ في الجهة المقابلة.</li>
                        </ul>
                    </div>
                </div>

                {/* Transcript Section */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-700 mb-4">النص المفرّغ</h3>
                    <div className="w-full h-80 bg-slate-50 rounded-lg p-4 text-slate-700 text-sm overflow-y-auto border">
                        {transcript || <span className="text-slate-400">سيظهر النص هنا بعد انتهاء التسجيل...</span>}
                    </div>
                    <div className="mt-4 flex space-x-2 space-x-reverse">
                        <button disabled={!transcript} className="flex-1 bg-sky-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-slate-300">
                            تلخيص النقاط الرئيسية
                        </button>
                         <button disabled={!transcript} className="flex-1 bg-slate-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-slate-300">
                            تحويل إلى سكريبت
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
