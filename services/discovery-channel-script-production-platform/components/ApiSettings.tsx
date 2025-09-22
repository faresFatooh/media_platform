
import React, { useState, useEffect } from 'react';
import { ApiConfigs, ApiStatuses, ConnectionStatus, NotificationMessage, ApiName } from '../types';
import { getApiConfigs, saveApiConfigs, testApiConnection } from '../services/apiConfigService';

interface ApiSettingsProps {
    addNotification: (message: string, type: NotificationMessage['type']) => void;
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
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadConfigs = async () => {
            const savedConfigs = await getApiConfigs();
            setConfigs(savedConfigs);
            // Optionally, test connections on load
            if(savedConfigs.claudeApiKey) testConnection('claude', savedConfigs.claudeApiKey, false);
            if(savedConfigs.chatGptApiKey) testConnection('chatGpt', savedConfigs.chatGptApiKey, false);
        };
        loadConfigs();
    }, []);

    const testConnection = async (apiName: ApiName, apiKey: string, showNotification: boolean) => {
        setStatuses(prev => ({ ...prev, [apiName]: 'pending' }));
        const isConnected = await testApiConnection(apiKey);
        setStatuses(prev => ({ ...prev, [apiName]: isConnected ? 'connected' : 'disconnected' }));
        if(showNotification){
            if(isConnected){
                addNotification(`تم الاتصال بـ ${apiName} API بنجاح`, 'success');
            } else {
                addNotification(`فشل الاتصال بـ ${apiName} API. يرجى التحقق من المفتاح.`, 'error');
            }
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        addNotification('جاري حفظ الإعدادات...', 'info');
        const success = await saveApiConfigs(configs);
        if (success) {
            addNotification('تم حفظ الإعدادات بنجاح. جاري اختبار الاتصالات...', 'success');
            // Test connections after saving
            await testConnection('claude', configs.claudeApiKey, true);
            await testConnection('chatGpt', configs.chatGptApiKey, true);
        } else {
            addNotification('فشل حفظ الإعدادات.', 'error');
        }
        setIsLoading(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, apiName: ApiName) => {
        setConfigs(prev => ({ ...prev, [`${apiName}ApiKey`]: e.target.value }));
        // Set status to disconnected when key is changed
        setStatuses(prev => ({ ...prev, [apiName]: 'disconnected' }));
    };

    return (
        <div className="bg-card-bg-light dark:bg-card-bg-dark p-6 rounded-lg shadow-md border border-border-light dark:border-border-dark">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-text-primary-light dark:text-text-primary-dark">
                <span>🔧</span>
                إعدادات واجهات برمجة التطبيقات (API)
            </h2>
            <div className="space-y-6">
                {/* Gemini API Info Card - Retained from original logic */}
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
                
                {/* Claude API Card */}
                <div className="bg-bg-secondary-light dark:bg-bg-secondary-dark p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">Claude API</h3>
                        <StatusIndicator status={statuses.claude} />
                    </div>
                    <input 
                        type="password"
                        placeholder="أدخل مفتاح Claude API"
                        value={configs.claudeApiKey}
                        onChange={(e) => handleInputChange(e, 'claude')}
                        className="w-full p-2 border rounded-md bg-card-bg-light dark:bg-card-bg-dark border-border-light dark:border-border-dark focus:ring-primary focus:border-primary text-left"
                        dir="ltr"
                    />
                </div>

                {/* ChatGPT API Card */}
                <div className="bg-bg-secondary-light dark:bg-bg-secondary-dark p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">ChatGPT API</h3>
                        <StatusIndicator status={statuses.chatGpt} />
                    </div>
                    <input 
                        type="password"
                        placeholder="أدخل مفتاح ChatGPT API"
                        value={configs.chatGptApiKey}
                        onChange={(e) => handleInputChange(e, 'chatGpt')}
                        className="w-full p-2 border rounded-md bg-card-bg-light dark:bg-card-bg-dark border-border-light dark:border-border-dark focus:ring-primary focus:border-primary text-left"
                        dir="ltr"
                    />
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <button 
                    onClick={handleSave} 
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:-translate-y-0.5 transform transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? <Spinner /> : '💾'}
                    <span>حفظ واختبار الاتصالات</span>
                </button>
            </div>
        </div>
    );
};

export default ApiSettings;
