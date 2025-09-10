import React, { useState, useCallback } from 'react';
import type { Message, GroundingChunk } from './types';
import { INITIAL_BOT_MESSAGE, NOT_FOUND_MESSAGE } from './constants';
import { getNewsUpdate } from './services/geminiService';
import ChatWindow from './components/ChatWindow';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([INITIAL_BOT_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text,
      sender: 'user',
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const result = await getNewsUpdate(text);
      
      let botResponseText = result.text;
      let botSources: GroundingChunk[] = result.sources || [];

      if (!botResponseText || botResponseText.includes(NOT_FOUND_MESSAGE.slice(0, 20))) { 
          botResponseText = NOT_FOUND_MESSAGE;
          botSources = [];
      }

      const botMessage: Message = {
        id: Date.now() + 1,
        text: botResponseText,
        sender: 'bot',
        sources: botSources,
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error fetching news update:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: 'عذرًا، حدث خطأ ما أثناء محاولة جلب الأخبار. يرجى المحاولة مرة أخرى.',
        sender: 'bot',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 font-sans">
      <header className="bg-white dark:bg-gray-800 shadow-md w-full py-4 px-6 z-10">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full flex items-center justify-center font-bold text-xl">
            NN
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">مساعدك الذكي من النجاح الاخباري</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">nn.ps - شبكة النجاح الإخبارية</p>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
        />
      </main>
    </div>
  );
};

export default App;