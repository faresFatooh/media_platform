import React, { useState } from 'react';
import type { AppSettings, AudioPrefs } from '../types';
import { SettingsIcon } from './icons/SettingsIcon';

interface SettingsModalProps {
  currentSettings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ currentSettings, onSave, onClose }) => {
  const [rssFeeds, setRssFeeds] = useState<string[]>(currentSettings.rssFeeds);
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [reutersApiKey, setReutersApiKey] = useState(currentSettings.reutersApiKey);
  const [audioPrefs, setAudioPrefs] = useState<AudioPrefs>(currentSettings.audioPrefs);

  const handleAddFeed = () => {
    if (newFeedUrl && !rssFeeds.includes(newFeedUrl)) {
      try {
        new URL(newFeedUrl); // Basic URL validation
        setRssFeeds([...rssFeeds, newFeedUrl]);
        setNewFeedUrl('');
      } catch (e) {
        alert('Please enter a valid URL.');
      }
    }
  };

  const handleRemoveFeed = (urlToRemove: string) => {
    setRssFeeds(rssFeeds.filter(url => url !== urlToRemove));
  };
  
  const handleSave = () => {
    onSave({ rssFeeds, reutersApiKey, audioPrefs });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="settings-modal-title">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b">
          <h2 id="settings-modal-title" className="text-xl font-bold text-slate-800 flex items-center">
            <SettingsIcon />
            <span className="mr-3">الإعدادات</span>
          </h2>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-8">
            {/* Reuters API Key Section */}
            <div>
              <h3 className="font-bold text-lg text-slate-700 mb-2">تكامل Reuters API (اختياري)</h3>
              <p className="text-sm text-slate-500 mb-2">إذا توفر لديك اشتراك، سيتم استخدام API الخاص بوكالة رويترز لجلب الأخبار بدلاً من RSS.</p>
              <label htmlFor="reuters-api" className="block text-sm font-medium text-slate-600 mb-1">مفتاح Reuters API</label>
              <input
                type="text"
                id="reuters-api"
                value={reutersApiKey}
                onChange={(e) => setReutersApiKey(e.target.value)}
                placeholder="أدخل مفتاح API الخاص بك هنا"
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* RSS Feeds Section */}
            <div>
              <h3 className="font-bold text-lg text-slate-700 mb-2">مصادر الأخبار (RSS Feeds)</h3>
              <p className="text-sm text-slate-500 mb-3">أضف روابط RSS لوكالات الأنباء التي تريد متابعتها (مثل AP, AFP, إلخ).</p>
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="url"
                  value={newFeedUrl}
                  onChange={(e) => setNewFeedUrl(e.target.value)}
                  placeholder="https://example.com/feed.xml"
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500"
                />
                <button onClick={handleAddFeed} className="py-2 px-4 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 whitespace-nowrap">
                  إضافة
                </button>
              </div>

              <div className="space-y-2">
                {rssFeeds.length > 0 ? (
                  rssFeeds.map(feed => (
                    <div key={feed} className="flex items-center justify-between bg-slate-100 p-2 rounded-md">
                      <span className="text-sm text-slate-800 truncate" dir="ltr">{feed}</span>
                      <button onClick={() => handleRemoveFeed(feed)} className="p-1 text-slate-400 hover:text-red-600 transition-colors">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 text-center py-2">لم يتم إضافة أي مصادر بعد.</p>
                )}
              </div>
            </div>
             {/* Podcast Audio Settings Section */}
            <div>
              <h3 className="font-bold text-lg text-slate-700 mb-2">إعدادات صوت البودكاست</h3>
              <p className="text-sm text-slate-500 mb-4">
                اختر الصوت الافتراضي والإعدادات الأخرى لتوليد البودكاست الصوتي عبر ElevenLabs.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="md:col-span-2">
                  <label htmlFor="podcast-voice" className="block text-sm font-medium text-slate-600 mb-1">الصوت الافتراضي</label>
                  <select
                    id="podcast-voice"
                    value={audioPrefs.voice}
                    onChange={(e) => setAudioPrefs(prev => ({ ...prev, voice: e.target.value }))}
                    className="w-full p-2 border border-slate-300 rounded-md bg-white"
                  >
                    <option value="Adam">Adam (ذكر, عميق)</option>
                    <option value="Bella">Bella (أنثى, ناعم)</option>
                    <option value="Charlie">Charlie (ذكر, محايد)</option>
                    <option value="Domi">Domi (أنثى, حيوي)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="stability" className="block text-sm font-medium text-slate-600 mb-1">
                    استقرار الصوت (Stability): <span className="font-mono text-sky-600">{audioPrefs.stability.toFixed(2)}</span>
                  </label>
                  <input
                    type="range"
                    id="stability"
                    min="0"
                    max="1"
                    step="0.01"
                    value={audioPrefs.stability}
                    onChange={(e) => setAudioPrefs(prev => ({ ...prev, stability: parseFloat(e.target.value) }))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                  />
                  <p className="text-xs text-slate-400 mt-1">يزيد من انتظام الصوت على حساب التعبير.</p>
                </div>
                <div>
                  <label htmlFor="similarity" className="block text-sm font-medium text-slate-600 mb-1">
                    تعزيز التشابه (Similarity): <span className="font-mono text-sky-600">{audioPrefs.similarity_boost.toFixed(2)}</span>
                  </label>
                  <input
                    type="range"
                    id="similarity"
                    min="0"
                    max="1"
                    step="0.01"
                    value={audioPrefs.similarity_boost}
                    onChange={(e) => setAudioPrefs(prev => ({ ...prev, similarity_boost: parseFloat(e.target.value) }))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                  />
                  <p className="text-xs text-slate-400 mt-1">يزيد من وضوح أسلوب الصوت المحدد.</p>
                </div>
              </div>
            </div>
             {/* Social Accounts Section */}
            <div>
              <h3 className="font-bold text-lg text-slate-700 mb-2">ربط الحسابات الاجتماعية</h3>
              <p className="text-sm text-slate-500 mb-4">اربط حساباتك ليتم النشر مباشرة من خلال Hootsuite.</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-slate-100 p-3 rounded-md opacity-70">
                  <span className="font-medium text-slate-800">Facebook</span>
                  <button disabled className="text-sm font-semibold text-white bg-slate-400 cursor-not-allowed px-4 py-1.5 rounded-md">تم الربط (مثال)</button>
                </div>
                <div className="flex items-center justify-between bg-slate-100 p-3 rounded-md opacity-70">
                  <span className="font-medium text-slate-800">X (Twitter)</span>
                  <button disabled className="text-sm font-semibold text-white bg-sky-600 cursor-not-allowed px-4 py-1.5 rounded-md">ربط الحساب (مثال)</button>
                </div>
                 <div className="flex items-center justify-between bg-slate-100 p-3 rounded-md opacity-70">
                  <span className="font-medium text-slate-800">Instagram</span>
                  <button disabled className="text-sm font-semibold text-white bg-sky-600 cursor-not-allowed px-4 py-1.5 rounded-md">ربط الحساب (مثال)</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-slate-50 border-t rounded-b-2xl flex justify-end items-center space-x-2 space-x-reverse">
          <button type="button" onClick={onClose} className="py-2 px-4 text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors">
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="py-2 px-5 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 transition-colors"
          >
            حفظ الإعدادات
          </button>
        </div>
      </div>
    </div>
  );
};