import React, { useState, useEffect } from 'react';
import { ApiConfigs, ApiStatuses, ConnectionStatus, ApiName } from '../types';
import { getApiConfigs, saveApiConfigs, testApiConnection } from '../services/apiConfigService';

interface ApiSettingsProps {
  addNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const Spinner: React.FC = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-400"></div>
);

const StatusIndicator: React.FC<{ status: ConnectionStatus }> = ({ status }) => {
  const config = {
    connected: { text: 'متصل', color: 'bg-green-500', icon: '✔' },
    disconnected: { text: 'غير متصل', color: 'bg-red-500', icon: '✖' },
    pending: { text: 'جاري الاختبار...', color: 'bg-yellow-500', icon: <Spinner /> },
  };
  const current = config[status];
  return (
    <div className="flex items-center gap-2">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${current.color}`}>
        {current.icon}
      </div>
      <span className={`font-semibold text-sm ${status === 'pending' ? 'animate-pulse' : ''}`}>{current.text}</span>
    </div>
  );
};

const ApiSettings: React.FC<ApiSettingsProps> = ({ addNotification }) => {
  const [configs, setConfigs] = useState<ApiConfigs>({ claudeApiKey: '', chatGptApiKey: '' });
  const [statuses, setStatuses] = useState<ApiStatuses>({ claude: 'disconnected', chatGpt: 'disconnected' });
  const [isSaving, setIsSaving] = useState(false);
  const [isLocked, setIsLocked] = useState<{ claude: boolean; chatGpt: boolean }>({ claude: false, chatGpt: false });

  // تحميل المفاتيح من Django عند فتح الصفحة
  useEffect(() => {
    const loadConfigs = async () => {
      try {
        const data = await getApiConfigs();
        setConfigs(data);

        setStatuses({
          claude: data.claudeApiKey ? 'connected' : 'disconnected',
          chatGpt: data.chatgptApiKey ? 'connected' : 'disconnected',
        });

        setIsLocked({
          claude: !!data.claudeApiKey,
          chatGpt: !!data.chatgptApiKey,
        });
      } catch (err) {
        addNotification('فشل تحميل إعدادات API من الخادم', 'error');
      }
    };

    loadConfigs();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const ok = await saveApiConfigs(configs);
      if (ok) {
        // اختبار المفاتيح بعد الحفظ
        setStatuses({ claude: 'pending', chatGpt: 'pending' });

        const claudeValid = await testApiConnection(configs.claudeApiKey);
        const chatValid = await testApiConnection(configs.chatGptApiKey);

        setStatuses({
          claude: claudeValid ? 'connected' : 'disconnected',
          chatGpt: chatValid ? 'connected' : 'disconnected',
        });

        setIsLocked({
          claude: claudeValid,
          chatGpt: chatValid,
        });

        addNotification('تم حفظ المفاتيح بنجاح ✅', 'success');
      } else {
        addNotification('فشل حفظ المفاتيح ❌', 'error');
      }
    } catch (err) {
      addNotification('خطأ أثناء حفظ المفاتيح', 'error');
    }
    setIsSaving(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, apiName: ApiName) => {
    const newConfigs = { ...configs, [`${apiName}ApiKey`]: e.target.value };
    setConfigs(newConfigs);
  };

  const toggleLock = (apiName: ApiName) => {
    if (!configs[`${apiName}ApiKey`]) {
      addNotification('أدخل مفتاحًا أولاً قبل القفل.', 'warning');
      return;
    }
    setIsLocked((prev) => ({ ...prev, [apiName]: !prev[apiName] }));
  };

  return (
    <div className="bg-card-bg-light dark:bg-card-bg-dark p-6 rounded-lg shadow-md border border-border-light dark:border-border-dark">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-text-primary-light dark:text-text-primary-dark">
        <span>🔧</span>
        إعدادات واجهات برمجة التطبيقات (API)
      </h2>
      <div className="space-y-6">
        {/* Gemini (ثابت من البيئة) */}
        <div className="bg-bg-secondary-light dark:bg-bg-secondary-dark p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">Gemini API</h3>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-green-500 font-semibold">متصل</span>
          </div>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            يتم الحصول على مفتاح API من متغيرات البيئة.
          </p>
        </div>

        {/* Claude API */}
        <div className="bg-bg-secondary-light dark:bg-bg-secondary-dark p-4 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">Claude API</h3>
            <StatusIndicator status={statuses.claude} />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="password"
              placeholder="أدخل مفتاح Claude API"
              value={configs.claudeApiKey}
              readOnly={isLocked.claude}
              onChange={(e) => handleInputChange(e, 'claude')}
              className={`w-full p-2 border rounded-md bg-card-bg-light dark:bg-card-bg-dark border-border-light dark:border-border-dark focus:ring-primary focus:border-primary text-left transition-colors ${
                isLocked.claude ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''
              }`}
              dir="ltr"
            />
            <button
              onClick={() => toggleLock('claude')}
              title={isLocked.claude ? 'تعديل المفتاح' : 'قفل المفتاح'}
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              {isLocked.claude ? '✏️' : '🔓'}
            </button>
          </div>
        </div>

        {/* ChatGPT API */}
        <div className="bg-bg-secondary-light dark:bg-bg-secondary-dark p-4 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">ChatGPT API</h3>
            <StatusIndicator status={statuses.chatGpt} />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="password"
              placeholder="أدخل مفتاح ChatGPT API"
              value={configs.chatGptApiKey}
              readOnly={isLocked.chatGpt}
              onChange={(e) => handleInputChange(e, 'chatGpt')}
              className={`w-full p-2 border rounded-md bg-card-bg-light dark:bg-card-bg-dark border-border-light dark:border-border-dark focus:ring-primary focus:border-primary text-left transition-colors ${
                isLocked.chatGpt ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''
              }`}
              dir="ltr"
            />
            <button
              onClick={() => toggleLock('chatGpt')}
              title={isLocked.chatGpt ? 'تعديل المفتاح' : 'قفل المفتاح'}
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              {isLocked.chatGpt ? '✏️' : '🔓'}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:-translate-y-0.5 transform transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving || statuses.claude === 'pending' || statuses.chatGpt === 'pending' ? <Spinner /> : '💾'}
          <span>حفظ واختبار الاتصالات</span>
        </button>
      </div>
    </div>
  );
};

export default ApiSettings;
