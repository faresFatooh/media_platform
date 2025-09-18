import React, { useState, useEffect } from 'react';
import { ApiKeys } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (keys: ApiKeys) => void;
  initialKeys: ApiKeys;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, initialKeys }) => {
  const [keys, setKeys] = useState<ApiKeys>(initialKeys);

  useEffect(() => {
    setKeys(initialKeys);
  }, [initialKeys, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    onSave(keys);
    onClose();
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKeys(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div 
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="settings-modal-title" className="text-2xl font-bold text-gray-800 mb-4">الإعدادات</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="claude-key" className="block text-sm font-medium text-gray-700 mb-1">
              Claude API Key
            </label>
            <input
              type="password"
              id="claude-key"
              name="claude"
              value={keys.claude}
              onChange={handleInputChange}
              placeholder="أدخل مفتاح API الخاص بـ Claude"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="chatgpt-key" className="block text-sm font-medium text-gray-700 mb-1">
              ChatGPT API Key
            </label>
            <input
              type="password"
              id="chatgpt-key"
              name="chatgpt"
              value={keys.chatgpt}
              onChange={handleInputChange}
              placeholder="أدخل مفتاح API الخاص بـ ChatGPT"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-2 space-x-reverse">
          <button
            onClick={onClose}
            className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            حفظ
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
