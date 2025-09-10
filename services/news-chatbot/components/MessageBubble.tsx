
import React from 'react';
import type { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

const SourceLinkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
);

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isBot = message.sender === 'bot';

  const containerClasses = isBot ? 'justify-start' : 'justify-end';
  const bubbleClasses = isBot
    ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-r-2xl rounded-bl-2xl'
    : 'bg-blue-600 text-white rounded-l-2xl rounded-br-2xl';

  const validSources = message.sources?.filter(s => s.web && s.web.uri && s.web.title) || [];
  
  const renderTextWithLineBreaks = (text: string) => {
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };


  return (
    <div className={`flex items-end ${containerClasses}`}>
      <div className={`px-4 py-3 max-w-xl ${bubbleClasses}`}>
        <p className="text-sm whitespace-pre-wrap">{renderTextWithLineBreaks(message.text)}</p>
        {isBot && validSources.length > 0 && (
          <div className="mt-4 border-t border-gray-300 dark:border-gray-600 pt-3">
            <h4 className="text-xs font-bold mb-2 text-gray-600 dark:text-gray-400">المصادر:</h4>
            <ul className="space-y-2">
              {validSources.map((source, index) => (
                <li key={index}>
                  <a
                    href={source.web!.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-xs text-blue-500 hover:text-blue-400 hover:underline"
                  >
                    <SourceLinkIcon />
                    <span>{source.web!.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
