import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, Message } from './types';
import { generateAvatarVideo, generateSubtitles } from './services/geminiService';
import ChatMessage from './components/ChatMessage';
import FileUpload from './components/FileUpload';
import VideoResult from './components/VideoResult';
import Spinner from './components/Spinner';
import GeneratingPlaceholder from './components/GeneratingPlaceholder';

const LOADING_MESSAGES = [
  "Warming up the animation engine...",
  "Querying neural network for facial expressions...",
  "Processing initial frames...",
  "Syncing lip movements to audio...",
  "Applying lighting and shadows...",
  "Polishing the final render...",
  "Almost there, adding the final touches...",
];

const backgroundOptions = [
    { name: 'Original', style: 'bg-gray-600 flex items-center justify-center' },
    { name: 'Neutral Dark Grey', style: 'bg-gray-700' },
    { name: 'Virtual Studio', style: 'bg-gradient-to-br from-blue-800 to-indigo-900' },
    { name: 'Gradient Blue', style: 'bg-gradient-to-r from-sky-500 to-indigo-500' },
    { name: 'Blurred Office', style: 'bg-cover bg-center bg-[url(https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&q=50)]' },
];

const voicePitchOptions = ['Low', 'Medium', 'High'];


export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.INITIAL);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [uploadedImage, setUploadedImage] = useState<{ file: File; base64: string; mimeType: string } | null>(null);
  const [uploadedAudio, setUploadedAudio] = useState<{ file: File; base64: string; mimeType: string; duration: number } | null>(null);
  const [backgroundMusic, setBackgroundMusic] = useState<{ file: File; base64: string; mimeType: string } | null>(null);
  const [animationText, setAnimationText] = useState('');
  const [selectedBackground, setSelectedBackground] = useState<string>(backgroundOptions[0].name);
  const [voicePitch, setVoicePitch] = useState<string>('Medium');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [generatedSubtitles, setGeneratedSubtitles] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);

  const conversationEndRef = useRef<HTMLDivElement>(null);

  const addAvatarResponse = (text: string) => {
    const thinkingId = Date.now();
    setConversation(prev => [...prev, { id: thinkingId, sender: 'avatar', text: '', isThinking: true }]);

    setTimeout(() => {
        setConversation(prev => prev.map(msg => msg.id === thinkingId ? { ...msg, text, isThinking: false } : msg));
    }, 1200);
  }

  useEffect(() => {
    if (appState === AppState.INITIAL) {
      addAvatarResponse("Hello! I'm your personal avatar. To bring me to life, I need a clear, front-facing picture. Please upload one for me.");
      setAppState(AppState.AWAITING_IMAGE);
    }
  }, [appState]);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError("Please upload a valid image file.");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      setUploadedImage({ file, base64: base64String, mimeType: file.type });
      setConversation(prev => [
        ...prev,
        { id: Date.now(), sender: 'user', text: `Uploaded an image: ${file.name}`, imagePreview: URL.createObjectURL(file) },
      ]);
      addAvatarResponse("Great! Now, provide the dialogue. You can upload an audio file to set the video's length, and you must provide a script for me to speak.");
      setAppState(AppState.AWAITING_CONTENT);
    };
    reader.readAsDataURL(file);
  };
  
  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const audioUrl = URL.createObjectURL(file);
      const audioElement = document.createElement('audio');
      audioElement.preload = 'metadata';

      const cleanup = () => {
        audioElement.removeEventListener('loadedmetadata', onLoadedMetadata);
        audioElement.removeEventListener('error', onError);
        URL.revokeObjectURL(audioUrl);
      };

      const onLoadedMetadata = () => {
        resolve(audioElement.duration);
        cleanup();
      };

      const onError = () => {
        reject(`Error loading audio metadata for file: ${file.name}`);
        cleanup();
      };

      audioElement.addEventListener('loadedmetadata', onLoadedMetadata);
      audioElement.addEventListener('error', onError);

      audioElement.src = audioUrl;
    });
  };

  const handleAudioUpload = async (file: File) => {
    if (!file.type.startsWith('audio/')) {
        addAvatarResponse("Whoops, that doesn't look like an audio file. Please upload a valid audio format.");
        return;
    }
    setError(null);
    try {
        const duration = await getAudioDuration(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            setUploadedAudio({ file, base64: base64String, mimeType: file.type, duration });
            setConversation(prev => [
                ...prev,
                { id: Date.now(), sender: 'user', text: `Uploaded audio: ${file.name} (${Math.ceil(duration)}s)` },
            ]);
            addAvatarResponse(`Audio received! I'll generate a video that is ${Math.ceil(duration)} seconds long. Now, please provide the script for me to speak.`);
        };
        reader.readAsDataURL(file);
    } catch (err) {
        console.error(err);
        addAvatarResponse("Sorry, I had trouble reading that audio file's duration. Please try a different one.");
    }
  };

  const handleBackgroundMusicUpload = (file: File) => {
    if (!file.type.startsWith('audio/')) {
        addAvatarResponse("Whoops, that background music file doesn't seem to be a valid audio format.");
        return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setBackgroundMusic({ file, base64: base64String, mimeType: file.type });
        setConversation(prev => [
            ...prev,
            { id: Date.now(), sender: 'user', text: `Added background music: ${file.name}` },
        ]);
        addAvatarResponse("Background music received. I'll make sure to include it in the final video.");
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!uploadedImage || !animationText.trim()) {
        addAvatarResponse("Please make sure you have uploaded an image and provided a dialogue script before generating.");
        return;
    }
    setConversation(prev => [
      ...prev,
      { id: Date.now(), sender: 'user', text: `Script: "${animationText}"` }
    ]);
    handleGenerate();
  };
  
  const handleGenerate = useCallback(async () => {
    if (!uploadedImage || !animationText.trim()) return;
    
    setError(null);
    let messageInterval: ReturnType<typeof setInterval>;

    const thinkingId = Date.now();
    setConversation(prev => [...prev, { id: thinkingId, sender: 'avatar', text: '', isThinking: true }]);
    
    await new Promise(resolve => setTimeout(resolve, 1200));

    setConversation(prev => prev.map(msg => msg.id === thinkingId ? { ...msg, text: "Excellent! I have everything I need. I'll create a full-length video using your script for the voice. Starting the animation process now. This may take a few minutes.", isThinking: false } : msg));
    setAppState(AppState.GENERATING);

    try {
      messageInterval = setInterval(() => {
        setLoadingMessage(prev => {
          const currentIndex = LOADING_MESSAGES.indexOf(prev);
          const nextIndex = (currentIndex + 1) % LOADING_MESSAGES.length;
          return LOADING_MESSAGES[nextIndex];
        });
      }, 3000);

      const onProgress = (message: string) => setLoadingMessage(message);

      const videoPromise = generateAvatarVideo(uploadedImage, animationText, selectedBackground, uploadedAudio, voicePitch, backgroundMusic, onProgress);
      // Only generate subtitles if text is provided
      const subtitlesPromise = animationText.trim() ? generateSubtitles(animationText) : Promise.resolve(null);

      const [videoUrl, subtitles] = await Promise.all([videoPromise, subtitlesPromise]);

      setGeneratedVideoUrl(videoUrl);
      setGeneratedSubtitles(subtitles);
      setAppState(AppState.COMPLETE);

    } catch (err) {
      console.error(err);
      let friendlyMessage = "An unknown error occurred during generation.";
      if (err instanceof Error) {
          if (err.message.toLowerCase().includes('blocked') || err.message.toLowerCase().includes('safety')) {
              friendlyMessage = "The video could not be created. This often happens if the uploaded image, audio, or text doesn't meet the AI's safety guidelines. Please try again with a different, clear, front-facing image and a neutral script.";
          } else {
              friendlyMessage = err.message;
          }
      }
      setError(friendlyMessage);
      setAppState(AppState.ERROR);
    } finally {
        if (messageInterval) clearInterval(messageInterval);
    }
  }, [uploadedImage, animationText, selectedBackground, uploadedAudio, voicePitch, backgroundMusic]);


  const handleReset = () => {
    setAppState(AppState.INITIAL);
    setConversation([]);
    setUploadedImage(null);
    setUploadedAudio(null);
    setBackgroundMusic(null);
    setAnimationText('');
    setSelectedBackground(backgroundOptions[0].name);
    setVoicePitch('Medium');
    setGeneratedVideoUrl(null);
    setGeneratedSubtitles(null);
    setError(null);
    setLoadingMessage(LOADING_MESSAGES[0]);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-6xl mx-auto bg-gray-800 rounded-2xl shadow-2xl flex flex-col md:flex-row h-[90vh]">
        
        {/* Left Pane: Controls & Chat */}
        <div className="w-full md:w-1/2 p-6 flex flex-col border-r border-gray-700">
          <header className="mb-4">
            <h1 className="text-3xl font-bold text-white">Dynamic Avatar Generator</h1>
            <p className="text-gray-400">Create & animate your personal avatar</p>
          </header>

          <div className="flex-grow overflow-y-auto pr-2 space-y-4">
            {conversation.map(msg => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {appState === AppState.GENERATING && (
              <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
                <Spinner />
                <p className="text-gray-300 animate-pulse">{loadingMessage}</p>
              </div>
            )}
             {appState === AppState.ERROR && (
                <div className="p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">
                    <p className="font-bold">Generation Failed</p>
                    <p>{error}</p>
                </div>
            )}
            <div ref={conversationEndRef} />
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700">
            {appState === AppState.AWAITING_IMAGE && <FileUpload onFileSelect={handleImageUpload} accept="image/*" label="Upload Image" />}

            {appState === AppState.AWAITING_CONTENT && (
              <form onSubmit={handleGenerateSubmit} className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-white mb-2">Select a Background</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {backgroundOptions.map(opt => (
                          <button
                              type="button"
                              key={opt.name}
                              onClick={() => setSelectedBackground(opt.name)}
                              className={`p-1.5 rounded-lg text-xs text-center transition-all duration-200 border-2 ${selectedBackground === opt.name ? 'border-indigo-500' : 'border-transparent hover:border-gray-500'}`}
                          >
                              <div className={`w-full h-10 rounded-md mb-1.5 ${opt.style}`}>
                                {opt.name === 'Original' && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
                                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
                                    </svg>
                                )}
                              </div>
                              {opt.name}
                          </button>
                      ))}
                  </div>
                </div>

                <div>
                    <h3 className="text-base font-semibold text-white mb-2">Voice Pitch</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {voicePitchOptions.map(pitch => (
                            <button
                                type="button"
                                key={pitch}
                                onClick={() => setVoicePitch(pitch)}
                                className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 ${voicePitch === pitch ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                            >
                                {pitch}
                            </button>
                        ))}
                    </div>
                </div>


                <div>
                    <label htmlFor="dialogue-text" className="block text-sm font-medium text-gray-300 mb-1">Dialogue Script (Required)</label>
                    <textarea
                        id="dialogue-text"
                        value={animationText}
                        onChange={(e) => setAnimationText(e.target.value)}
                        placeholder="Type dialogue here..."
                        rows={3}
                        className="w-full bg-gray-700 text-white placeholder-gray-400 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Audio for Duration (Optional)</label>
                        <FileUpload onFileSelect={handleAudioUpload} accept="audio/*" label={uploadedAudio ? `Audio: ${uploadedAudio.file.name}` : "Upload Audio"} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Background Music (Optional)</label>
                        <FileUpload onFileSelect={handleBackgroundMusicUpload} accept="audio/*" label={backgroundMusic ? `Music: ${backgroundMusic.file.name}` : "Upload Music"} />
                    </div>
                </div>
                
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-5 rounded-lg transition-colors duration-200">
                    Generate Animation
                </button>
              </form>
            )}

            {(appState === AppState.COMPLETE || appState === AppState.ERROR) && (
                 <button onClick={handleReset} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-5 rounded-lg transition-colors duration-200">
                    Start Over
                </button>
            )}
          </div>
        </div>

        {/* Right Pane: Avatar Preview / Video */}
        <div className="w-full md:w-1/2 p-6 flex flex-col items-center justify-center bg-gray-800/50 rounded-r-2xl">
          <div className="w-full h-full bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
            {appState === AppState.GENERATING ? (
              <GeneratingPlaceholder message={loadingMessage} />
            ) : generatedVideoUrl ? (
              <VideoResult 
                videoUrl={generatedVideoUrl} 
                subtitles={generatedSubtitles || ""} 
                imageFileName={uploadedImage?.file.name || 'avatar'}
              />
            ) : uploadedImage ? (
              <img src={URL.createObjectURL(uploadedImage.file)} alt="Avatar Preview" className="w-full h-full object-cover"/>
            ) : (
              <AvatarPlaceholder />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const AvatarPlaceholder = () => (
    <div className="text-center text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
            <circle cx="12" cy="13" r="3"/>
        </svg>
        <p>Your avatar will appear here</p>
    </div>
)
