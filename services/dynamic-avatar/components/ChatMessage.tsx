import React from 'react';
import type { Message } from '../types';
import ThinkingIndicator from './ThinkingIndicator';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAvatar = message.sender === 'avatar';

  return (
    <div className={`flex items-start gap-3 ${isAvatar ? '' : 'justify-end'}`}>
      {isAvatar && (
        <div className="w-10 h-10 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center font-bold text-white">
          A
        </div>
      )}
      <div className={`max-w-xs md:max-w-md`}>
        {message.isThinking ? (
            <ThinkingIndicator />
        ) : message.text && (
            <div className={`p-4 rounded-2xl ${isAvatar ? 'bg-gray-700 rounded-tl-none' : 'bg-blue-600 text-white rounded-tr-none'}`}>
                 <p className="text-sm">{message.text}</p>
                 {message.imagePreview && (
                    <img src={message.imagePreview} alt="upload preview" className="mt-2 rounded-lg max-h-40" />
                 )}
            </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
