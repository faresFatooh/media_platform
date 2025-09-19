import React, { useState } from 'react';
import { TextPair } from '../types';
import ExamplePairView from './ExamplePairView';
import { saveStyleExample } from '../services/apiService'; // Using our new service

interface TrainingSectionProps {
  examples: TextPair[];
  onAddExample: (pair: TextPair) => void;
  onDeleteExample: (id: string) => void;
}
// ... PlusIcon component ...

const TrainingSection: React.FC<TrainingSectionProps> = ({ examples, onAddExample, onDeleteExample }) => {
  const [rawText, setRawText] = useState('');
  const [editedText, setEditedText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim() || !editedText.trim()) return;

    try {
      const savedPair = await saveStyleExample(rawText, editedText);
      onAddExample(savedPair);
      setRawText('');
      setEditedText('');
    } catch (err: any) {
      console.error("خطأ في الحفظ:", err);
      alert(`خطأ في الحفظ: ${err.message || err}`);
    }
  };

  // ... The rest of your JSX code remains exactly the same
  return (
    <div className="bg-white p-6 rounded-xl shadow-md space-y-6 sticky top-24">
      {/* ... Your form and list JSX ... */}
    </div>
  );
};

export default TrainingSection;