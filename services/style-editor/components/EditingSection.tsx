import React, { useState } from 'react';
import { callPredictAPI } from '../apiService';

// ... Spinner component remains the same ...

const EditingSection: React.FC<{ onNewPairGenerated: () => void }> = ({ onNewPairGenerated }) => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<{ raw: string; edited: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
        // Call our new API that talks to Gemini
        const editedText = await callPredictAPI(inputText);
        
        if(editedText.startsWith('حدث خطأ')) {
          setError(editedText);
        } else {
          setResult({ raw: inputText, edited: editedText });
          // We can add the Task logging logic here later
        }
    } catch (e) {
        setError(e instanceof Error ? e.message : "An unknown error occurred.");
    }
    
    setIsLoading(false);
  };

  // ... The rest of the component (JSX) remains exactly the same
  return (
    <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
        {/* ... All your existing JSX code ... */}
    </div>
  );
};

export default EditingSection;