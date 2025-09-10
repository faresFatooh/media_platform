import React, { useState } from 'react';
import type { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.toLowerCase().endsWith('@najah.edu')) {
      setError('الرجاء استخدام البريد الإلكتروني الرسمي الخاص بالجامعة (@najah.edu).');
      return;
    }
    setError('');
    onLogin({ email });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 text-center">
          <h1 className="text-3xl font-bold text-sky-700">NewsRefine</h1>
          <p className="text-slate-500 mt-2 mb-8">تسجيل الدخول لمحرر الأخبار</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="sr-only">البريد الإلكتروني</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="أدخل بريدك الإلكتروني الرسمي"
                required
                className="w-full text-center px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-sky-600 text-white font-bold py-3 px-10 rounded-lg shadow-md hover:bg-sky-700 transition-all duration-300 transform hover:scale-105"
            >
              تسجيل الدخول
            </button>
          </form>
        </div>
        <footer className="text-center py-6 text-slate-500 text-sm">
          <p>تم التطوير لمركز الإعلام بجامعة النجاح بواسطة Gemini</p>
        </footer>
      </div>
    </div>
  );
};
