import React from 'react';

const ThinkingIndicator: React.FC = () => {
  return (
    <div className="bg-gray-700 p-4 rounded-2xl rounded-tl-none inline-flex items-center justify-center space-x-1.5">
        <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-pulse"></div>
    </div>
  );
};

export default ThinkingIndicator;
