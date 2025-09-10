import React, { useState, useCallback } from 'react';
import { Step, PodcastMetadata } from './types';
import Header from './components/Header';
import StepIndicator from './components/StepIndicator';
import InputStep from './components/InputStep';
import EditStep from './components/EditStep';
import PublishStep from './components/PublishStep';
import Loader from './components/Loader';
import { generateScript, generateMetadataAndTranscript } from './services/geminiService';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>('input');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [script, setScript] = useState<string>('');
  const [finalScript, setFinalScript] = useState<string>('');
  const [isTranscriptEnabled, setIsTranscriptEnabled] = useState<boolean>(true);
  
  const [podcastMetadata, setPodcastMetadata] = useState<PodcastMetadata | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);

  const handleReset = () => {
    setCurrentStep('input');
    setIsLoading(false);
    setLoadingMessage('');
    setError(null);
    setScript('');
    setFinalScript('');
    setPodcastMetadata(null);
    setTranscript(null);
  };

  const handleScriptGeneration = useCallback(async (content: string) => {
    setIsLoading(true);
    setLoadingMessage('الذكاء الاصطناعي يقوم بصياغة نص البودكاست الخاص بك...');
    setError(null);
    try {
      const generatedScript = await generateScript(content);
      setScript(generatedScript);
      setCurrentStep('edit');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير معروف أثناء إنشاء النص.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handlePodcastProduction = useCallback(async (scriptToProduce: string) => {
    setIsLoading(true);
    setLoadingMessage('جاري إنشاء بيانات البودكاست الوصفية والنسخة النصية...');
    setError(null);
    try {
      const { metadata, transcript } = await generateMetadataAndTranscript(scriptToProduce, isTranscriptEnabled);
      setPodcastMetadata(metadata);
      if (transcript) {
        setTranscript(transcript);
      }
      setFinalScript(scriptToProduce);
      setCurrentStep('publish');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير معروف أثناء إنتاج البودكاست.');
    } finally {
      setIsLoading(false);
    }
  }, [isTranscriptEnabled]);


  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'input':
        return <InputStep onGenerateScript={handleScriptGeneration} />;
      case 'edit':
        return (
          <EditStep
            initialScript={script}
            onProducePodcast={handlePodcastProduction}
            isTranscriptEnabled={isTranscriptEnabled}
            onTranscriptToggle={setIsTranscriptEnabled}
          />
        );
      case 'publish':
        return (
          <PublishStep
            metadata={podcastMetadata}
            scriptForAudio={finalScript}
            transcript={transcript}
            onStartOver={handleReset}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-base-100 flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-4xl mx-auto">
        <Header />
        <main className="mt-8">
          {isLoading ? (
            <Loader message={loadingMessage} />
          ) : (
            <>
              <StepIndicator currentStep={currentStep} />
              {error && (
                <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative my-4 text-right" role="alert">
                  <strong className="font-bold">خطأ: </strong>
                  <span className="block sm:inline">{error}</span>
                </div>
              )}
              <div className="mt-6">{renderCurrentStep()}</div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;