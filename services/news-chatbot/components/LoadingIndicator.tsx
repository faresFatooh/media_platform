
import React from 'react';

const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start">
        <div className="px-4 py-3 bg-gray-200 dark:bg-gray-700 rounded-r-2xl rounded-bl-2xl flex items-center space-x-2" dir="ltr">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
    </div>
  );
};

export default LoadingIndicator;
