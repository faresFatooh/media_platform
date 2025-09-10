import React, { useState } from 'react';
import type { Article } from '../types';
import { EnvelopeIcon } from './icons/EnvelopeIcon';

interface EmailModalProps {
  article: Article;
  onClose: () => void;
}

export const EmailModal: React.FC<EmailModalProps> = ({ article, onClose }) => {
  const [publisherEmail, setPublisherEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    
    // Simulate API call to a backend
    console.log(`Simulating sending email to ${publisherEmail} with title: ${article.title}`);
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
      setTimeout(() => {
        onClose();
      }, 2000); // Close modal after 2 seconds
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="email-modal-title">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b">
          <h2 id="email-modal-title" className="text-xl font-bold text-slate-800 flex items-center">
            <EnvelopeIcon />
            <span className="mr-3">إرسال الخبر للناشر</span>
          </h2>
        </div>
        <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
            {isSent ? (
                <div className="text-center p-4 bg-green-100 text-green-700 rounded-lg">
                    <p className="font-semibold">تم الإرسال بنجاح!</p>
                    <p className="text-sm">سيتم إغلاق هذه النافذة بعد قليل.</p>
                </div>
            ) : (
                <>
                    <div>
                        <label htmlFor="user-email" className="block text-sm font-medium text-slate-600 mb-1">من</label>
                        <input
                        type="email"
                        id="user-email"
                        disabled
                        value="subscriber@example.com"
                        className="w-full p-2 border border-slate-300 rounded-md bg-slate-100 cursor-not-allowed"
                        />
                         <p className="text-xs text-slate-400 mt-1">سيتم ربط هذا بحساب المستخدم المسجل.</p>
                    </div>
                    <div>
                        <label htmlFor="publisher-email" className="block text-sm font-medium text-slate-600 mb-1">إلى (إيميل الناشر)</label>
                        <input
                        type="email"
                        id="publisher-email"
                        required
                        value={publisherEmail}
                        onChange={(e) => setPublisherEmail(e.target.value)}
                        placeholder="publisher@your-domain.com"
                        className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500"
                        />
                    </div>
                    <div>
                         <p className="text-sm text-slate-600">سيتم إرسال الخبر بعنوان:</p>
                         <p className="font-semibold text-slate-800 p-2 bg-slate-100 rounded-md truncate">"{article.title}"</p>
                    </div>
                </>
             )}
            </div>
            {!isSent && (
                <div className="px-6 py-4 bg-slate-50 border-t rounded-b-2xl flex justify-end items-center space-x-2 space-x-reverse">
                    <button type="button" onClick={onClose} className="py-2 px-4 text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors">
                        إلغاء
                    </button>
                    <button
                        type="submit"
                        disabled={isSending || !publisherEmail}
                        className="py-2 px-5 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSending ? '...جاري الإرسال' : 'إرسال'}
                    </button>
                </div>
            )}
        </form>
      </div>
    </div>
  );
};