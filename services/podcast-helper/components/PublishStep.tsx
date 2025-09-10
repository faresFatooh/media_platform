import React, { useState, useEffect, useRef } from 'react';
import { PodcastMetadata } from '../types';
import Card from './Card';
import { PlayIcon } from './icons/PlayIcon';
import { StopIcon } from './icons/StopIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { DownloadIcon } from './icons/DownloadIcon';


interface PublishStepProps {
  metadata: PodcastMetadata | null;
  scriptForAudio: string;
  transcript: string | null;
  onStartOver: () => void;
}

const MetadataItem: React.FC<{ label: string; value: string | string[] }> = ({ label, value }) => {
    const [copied, setCopied] = useState(false);
    const textToCopy = Array.isArray(value) ? value.join(', ') : value;

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-semibold text-brand-light">{label}</label>
                <button onClick={handleCopy} className="text-gray-400 hover:text-white transition">
                    {copied ? <span className="text-xs text-brand-secondary">تم النسخ!</span> : <ClipboardIcon />}
                </button>
            </div>
            {Array.isArray(value) ? (
                <div className="flex flex-wrap gap-2">
                    {value.map((tag, index) => (
                        <span key={index} className="text-xs font-medium bg-base-300 text-gray-300 px-2.5 py-1 rounded-full">
                            {tag}
                        </span>
                    ))}
                </div>
            ) : (
                <p className="text-gray-300 bg-base-100 p-2 rounded text-sm">{value}</p>
            )}
        </div>
    );
};

const PublishStep: React.FC<PublishStepProps> = ({ metadata, scriptForAudio, transcript, onStartOver }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | undefined>();
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSpeechSynthesisSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    if (!isSpeechSynthesisSupported) {
      setSpeechError("واجهة برمجة تطبيقات تحويل النص إلى كلام غير مدعومة في هذا المتصفح. للحصول على أفضل النتائج، يرجى استخدام متصفح حديث مثل Chrome أو Edge.");
      return;
    }

    const synth = window.speechSynthesis;
    let voiceLoadTimeout: number;

    const loadVoices = () => {
      clearTimeout(voiceLoadTimeout);
      const allVoices = synth.getVoices();
      if (allVoices.length === 0) return; 

      const arabicVoices = allVoices.filter(voice => voice.lang.startsWith('ar'));
      
      if (arabicVoices.length > 0) {
        setVoices(arabicVoices);
        if (!selectedVoiceURI) {
            setSelectedVoiceURI(arabicVoices[0].voiceURI);
        }
        setSpeechError(null); 
      } else {
        setSpeechError("لم يتم العثور على أصوات عربية. يرجى التأكد من تثبيت حزم اللغة العربية في نظام التشغيل لديك.");
      }
    };

    loadVoices();
    synth.onvoiceschanged = loadVoices;

    voiceLoadTimeout = window.setTimeout(() => {
        if (synth.getVoices().length === 0) {
            setSpeechError("فشل تحميل الأصوات. يرجى تحديث الصفحة أو محاولة استخدام متصفح آخر.");
        }
    }, 1500);

    return () => {
      synth.onvoiceschanged = null;
      clearTimeout(voiceLoadTimeout);
      if (synth.speaking) {
        synth.cancel();
      }
    };
  }, [isSpeechSynthesisSupported, selectedVoiceURI]);


  useEffect(() => {
    if (!isSpeechSynthesisSupported) return;

    const synth = window.speechSynthesis;
    if (synth.speaking) {
        synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(scriptForAudio);
    utterance.lang = 'ar';
    utterance.rate = rate;
    utterance.pitch = pitch;

    if (selectedVoiceURI) {
        const voice = voices.find(v => v.voiceURI === selectedVoiceURI);
        if (voice) {
            utterance.voice = voice;
        }
    }

    utterance.onend = () => {
        setIsPlaying(false);
    };

    utterance.onerror = (event) => {
        console.error('SpeechSynthesis Error:', event);
        let errorMessage = "حدث خطأ غير متوقع أثناء تشغيل الصوت. يرجى المحاولة مرة أخرى.";
        switch (event.error) {
            case 'synthesis-failed':
                errorMessage = "فشل توليد الصوت. قد يكون النص طويلاً جدًا أو أن هناك مشكلة في الصوت المحدد. حاول اختيار صوت آخر.";
                break;
            // Fix: Replaced incorrect SpeechSynthesisErrorCode 'audio-capture' with 'audio-hardware'.
            case 'audio-hardware':
                errorMessage = "لا يمكن الوصول إلى جهاز الصوت. يرجى التحقق من توصيل مكبرات الصوت أو السماعات.";
                break;
            case 'network':
                errorMessage = "حدث خطأ في الشبكة. بعض الأصوات تتطلب اتصالاً بالإنترنت للعمل.";
                break;
            case 'language-unavailable':
                errorMessage = "اللغة المحددة غير متاحة للصوت المختار. يرجى اختيار صوت عربي آخر.";
                break;
            case 'voice-unavailable':
                errorMessage = "الصوت المحدد غير متاح حاليًا. يرجى اختيار صوت آخر من القائمة.";
                break;
        }
        setSpeechError(errorMessage);
        setIsPlaying(false);
    };

    utteranceRef.current = utterance;

  }, [scriptForAudio, rate, pitch, selectedVoiceURI, voices, isSpeechSynthesisSupported]);

  const handlePlayToggle = () => {
    setSpeechError(null); 
    const synth = window.speechSynthesis;
    if (isPlaying) {
      synth.cancel();
      setIsPlaying(false);
    } else {
      if (utteranceRef.current) {
        synth.speak(utteranceRef.current);
        setIsPlaying(true);
      } else {
        setSpeechError("لا يمكن تشغيل الصوت. لم يتم تهيئة أداة الكلام.");
      }
    }
  };
  
  const handleDownload = () => {
    const escapedScript = scriptForAudio.replace(/<\/script>/g, '<\\/script>');
    
    const htmlContent = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${metadata?.title || 'حلقة بودكاست'}</title>
    <style>
        body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; background-color: #1F2937; color: #D1D5DB; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
        .container { max-width: 800px; width: 100%; background-color: #374151; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        h1 { color: #C7D2FE; text-align: center; }
        #controls { text-align: center; margin-bottom: 20px; }
        button { background-color: #6366F1; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 16px; margin: 0 5px; transition: background-color 0.2s; }
        button:hover { background-color: #4F46E5; }
        button:disabled { background-color: #4B5563; cursor: not-allowed; }
        #script { white-space: pre-wrap; background-color: #1F2937; padding: 15px; border-radius: 8px; max-height: 50vh; overflow-y: auto; text-align: right; }
    </style>
</head>
<body>
    <div class="container">
        <h1>${metadata?.title || 'حلقة بودكاست'}</h1>
        <div id="controls">
            <button id="playBtn">تشغيل</button>
            <button id="stopBtn" disabled>إيقاف</button>
        </div>
        <pre id="script">${escapedScript}</pre>
    </div>

    <script>
        const scriptText = document.getElementById('script').textContent;
        const playBtn = document.getElementById('playBtn');
        const stopBtn = document.getElementById('stopBtn');
        const synth = window.speechSynthesis;
        let utterance = new SpeechSynthesisUtterance(scriptText);

        const voiceSettings = {
            voiceURI: "${selectedVoiceURI || ''}",
            rate: ${rate},
            pitch: ${pitch},
            lang: 'ar'
        };

        const configureVoice = () => {
            const voices = synth.getVoices();
            let selectedVoice = null;
            
            if (voiceSettings.voiceURI) {
                selectedVoice = voices.find(v => v.voiceURI === voiceSettings.voiceURI);
            }
            
            if (!selectedVoice) {
                selectedVoice = voices.find(v => v.lang.startsWith('ar'));
            }

            if(selectedVoice) {
                utterance.voice = selectedVoice;
            }
            utterance.lang = voiceSettings.lang;
            utterance.rate = voiceSettings.rate;
            utterance.pitch = voiceSettings.pitch;
        };

        synth.onvoiceschanged = configureVoice;
        if (synth.getVoices().length > 0) {
            configureVoice();
        }

        utterance.onstart = () => {
            playBtn.disabled = true;
            stopBtn.disabled = false;
        };

        utterance.onend = () => {
            playBtn.disabled = false;
            stopBtn.disabled = true;
            synth.cancel(); // Clean up just in case
        };
        
        playBtn.addEventListener('click', () => {
            if (!synth.speaking) {
                synth.speak(utterance);
            }
        });

        stopBtn.addEventListener('click', () => {
            if (synth.speaking) {
                synth.cancel();
            }
        });
    <\/script>
</body>
</html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeTitle = metadata?.title.replace(/[^a-z0-9-_\u0600-\u06FF]/gi, '_') || 'podcast';
    a.download = `${safeTitle}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const areControlsDisabled = !isSpeechSynthesisSupported || voices.length === 0;

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-2xl font-bold text-center text-brand-light mb-4">البودكاست الخاص بك جاهز!</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left side - Audio Player and Download */}
            <div>
                <h4 className="text-lg font-semibold mb-3">تشغيل وتنزيل الحلقة</h4>
                <div className="bg-base-200 p-4 rounded-lg">
                    {speechError && (
                        <div className="bg-red-900 border border-red-700 text-red-200 px-3 py-2 rounded-lg relative mb-3 text-sm text-right" role="alert">
                            <strong className="font-bold">خطأ: </strong>
                            <span>{speechError}</span>
                        </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-2">
                        <button
                            onClick={handlePlayToggle}
                            disabled={areControlsDisabled}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-brand-secondary text-white font-bold rounded-lg hover:bg-brand-dark transition-colors disabled:bg-base-300 disabled:cursor-not-allowed"
                        >
                            {isPlaying ? <StopIcon /> : <PlayIcon />}
                            {isPlaying ? 'إيقاف التشغيل' : 'تشغيل الصوت'}
                        </button>
                         <button
                            onClick={handleDownload}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-base-300 text-content font-bold rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            <DownloadIcon />
                            تنزيل
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-3 text-center">
                        يتم إنشاء الصوت باستخدام إمكانيات المتصفح. <span className="font-semibold">التنزيل كملف HTML تفاعلي.</span>
                    </p>
                </div>
                
                <div className="mt-4">
                    <h5 className="text-md font-semibold mb-2">إعدادات الصوت</h5>
                    <div className="space-y-4 bg-base-200 p-4 rounded-lg">
                        <div>
                            <label htmlFor="voice-select" className="block text-sm font-medium text-gray-300 mb-1">اختر الصوت</label>
                            <select
                                id="voice-select"
                                value={selectedVoiceURI || ''}
                                onChange={(e) => setSelectedVoiceURI(e.target.value)}
                                disabled={areControlsDisabled}
                                className="w-full p-2 bg-base-100 border border-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition disabled:bg-base-300 disabled:cursor-not-allowed"
                            >
                                {voices.length === 0 ? (
                                    <option>
                                        {isSpeechSynthesisSupported ? 'لا توجد أصوات عربية' : 'غير مدعوم'}
                                    </option>
                                ) : (
                                    voices.map(voice => (
                                        <option key={voice.voiceURI} value={voice.voiceURI}>
                                            {voice.name} ({voice.lang})
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="rate-slider" className="block text-sm font-medium text-gray-300 mb-1">
                                سرعة القراءة: <span className="font-bold text-brand-light">{rate.toFixed(1)}x</span>
                            </label>
                            <input
                                id="rate-slider" type="range" min="0.5" max="2" step="0.1" value={rate}
                                onChange={(e) => setRate(parseFloat(e.target.value))}
                                disabled={areControlsDisabled}
                                className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                         <div>
                            <label htmlFor="pitch-slider" className="block text-sm font-medium text-gray-300 mb-1">
                                حدة الصوت: <span className="font-bold text-brand-light">{pitch.toFixed(1)}</span>
                            </label>
                            <input
                                id="pitch-slider" type="range" min="0" max="2" step="0.1" value={pitch}
                                onChange={(e) => setPitch(parseFloat(e.target.value))}
                                disabled={areControlsDisabled}
                                className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>


                {transcript && (
                  <div className="mt-6">
                      <h4 className="text-lg font-semibold mb-3">النسخة النصية</h4>
                      <div className="bg-base-100 p-4 rounded-lg border border-base-300 max-h-48 overflow-y-auto">
                          <p className="text-sm text-gray-300 whitespace-pre-wrap">{transcript}</p>
                      </div>
                  </div>
                )}
            </div>

            {/* Right side - Metadata */}
            <div>
                <h4 className="text-lg font-semibold mb-3">بيانات النشر الوصفية</h4>
                <div className="bg-base-200 p-4 rounded-lg">
                    {metadata ? (
                        <>
                            <MetadataItem label="العنوان" value={metadata.title} />
                            <MetadataItem label="الوصف" value={metadata.description} />
                            <MetadataItem label="الوسوم" value={metadata.tags} />
                        </>
                    ) : (
                        <p>لا توجد بيانات وصفية متاحة.</p>
                    )}
                </div>
            </div>
        </div>

        <div className="mt-10 text-center">
            <button
                onClick={onStartOver}
                className="w-full sm:w-auto px-8 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-transform transform hover:scale-105"
            >
                إنشاء بودكاست آخر
            </button>
        </div>
      </div>
    </Card>
  );
};

export default PublishStep;