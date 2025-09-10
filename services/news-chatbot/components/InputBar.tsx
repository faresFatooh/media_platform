import React, { useState } from 'react';

interface InputBarProps {
  onSendMessage: (text: string) => void;
  disabled: boolean;
}

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);


const InputBar: React.FC<InputBarProps> = ({ onSendMessage, disabled }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSendMessage(text);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-3" dir="rtl">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="ادخل سؤالك وتعلم من الموقع..."
        disabled={disabled}
        className="flex-1 w-full px-4 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-200"
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-800 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        <SendIcon/>
      </button>
    </form>
  );
};

export default InputBar;