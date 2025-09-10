

import React, { useEffect, useRef } from 'react';
import type { Message } from '../types';
import MessageBubble from './MessageBubble';
import InputBar from './InputBar';
import LoadingIndicator from './LoadingIndicator';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, onSendMessage }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg">
      <div className="flex-1 p-6 overflow-y-auto" dir="rtl">
        <div className="space-y-6">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isLoading && <LoadingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <InputBar onSendMessage={onSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
};

export default ChatWindow;
