import React, { useState, useEffect } from 'react';
import Card from './Card';

interface EditStepProps {
  initialScript: string;
  onProducePodcast: (finalScript: string) => void;
  isTranscriptEnabled: boolean;
  onTranscriptToggle: (enabled: boolean) => void;
}

const EditStep: React.FC<EditStepProps> = ({
  initialScript,
  onProducePodcast,
  isTranscriptEnabled,
  onTranscriptToggle
}) => {
  const [editedScript, setEditedScript] = useState(initialScript);

  useEffect(() => {
    setEditedScript(initialScript);
  }, [initialScript]);

  const handleProduceClick = () => {
    onProducePodcast(editedScript);
  };

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-brand-light mb-2">مراجعة وتعديل النص</h3>
        <p className="text-sm text-gray-400 mb-4">
          قم بإجراء أي تعديلات مطلوبة على النص أدناه. عندما تكون راضيًا عنه، انتقل إلى إنشاء الصوت.
        </p>
        <textarea
          value={editedScript}
          onChange={(e) => setEditedScript(e.target.value)}
          className="w-full h-96 p-4 bg-base-100 border border-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition text-gray-300"
        />
        
        <div className="mt-6 flex items-center justify-between bg-base-200 p-4 rounded-lg">
          <label htmlFor="transcript-toggle" className="flex flex-col cursor-pointer">
            <span className="font-medium text-gray-200">إنشاء نسخة نصية</span>
            <span className="text-xs text-gray-400">أضف نسخة نصية مكتوبة مع البودكاست الخاص بك.</span>
          </label>
          <div className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              id="transcript-toggle" 
              className="sr-only peer"
              checked={isTranscriptEnabled}
              onChange={(e) => onTranscriptToggle(e.target.checked)}
            />
            <div className="w-11 h-6 bg-base-300 rounded-full peer peer-focus:ring-2 peer-focus:ring-brand-primary peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary after:right-[2px] peer-checked:after:-translate-x-full"></div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <button
            onClick={handleProduceClick}
            className="w-full sm:w-auto px-8 py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-dark transition-transform transform hover:scale-105"
          >
            إنشاء البودكاست
          </button>
        </div>
      </div>
    </Card>
  );
};

export default EditStep;