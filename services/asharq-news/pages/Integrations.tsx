
import React, { useState } from 'react';
import { Bot, Image, Film, Mic, Database, Share2, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import { IntegrationKey } from '../types';

const mockIntegrations: IntegrationKey[] = [
  { id: '1', provider: 'Gemini API (LLM)', isConfigured: true, description: 'المسؤول عن إعادة التحرير وتوليد النصوص.', category: 'LLM' },
  { id: '2', provider: 'Imagen API', isConfigured: true, description: 'لتوليد الصور الإخبارية والإنفوجرافيك.', category: 'Media' },
  { id: '3', provider: 'Veo API', isConfigured: false, description: 'لتوليد مقاطع الفيديو القصيرة.', category: 'Media' },
  { id: '4', provider: 'Whisper (STT)', isConfigured: true, description: 'لتحويل الصوت إلى نص (SRT).', category: 'Media' },
  { id: '5', provider: 'Cloudflare R2 (S3)', isConfigured: true, description: 'لتخزين جميع ملفات الوسائط.', category: 'Storage' },
  { id: '6', provider: 'Facebook API', isConfigured: true, description: 'للنشر على فيسبوك (Posts, Reels, Stories).', category: 'Publishing' },
  { id: '7', provider: 'X (Twitter) API', isConfigured: false, description: 'للنشر على منصة إكس.', category: 'Publishing' },
  { id: '8', provider: 'Telegram Bot', isConfigured: true, description: 'للنشر على قناة تيليجرام.', category: 'Publishing' },
];

const categoryIcons = {
    LLM: <Bot className="w-8 h-8 text-purple-400" />,
    Media: <Image className="w-8 h-8 text-blue-400" />,
    Storage: <Database className="w-8 h-8 text-green-400" />,
    Publishing: <Share2 className="w-8 h-8 text-yellow-400" />,
};

const IntegrationCard: React.FC<{ integration: IntegrationKey }> = ({ integration }) => {
    const [apiKey, setApiKey] = useState(integration.isConfigured ? '••••••••••••••••••••' : '');
    const [showKey, setShowKey] = useState(false);
    
    return (
        <div className="bg-surface rounded-lg p-6 border border-border transition-all hover:border-primary">
            <div className="flex items-start justify-between">
                <div className="flex items-center">
                    <div className="p-3 bg-gray-900 rounded-lg mr-4">
                        {categoryIcons[integration.category]}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">{integration.provider}</h3>
                        <p className="text-text-secondary">{integration.description}</p>
                    </div>
                </div>
                <div className={`flex items-center px-3 py-1 rounded-full text-sm font-semibold ${integration.isConfigured ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {integration.isConfigured ? <CheckCircle className="w-4 h-4 ml-1" /> : <XCircle className="w-4 h-4 ml-1" />}
                    {integration.isConfigured ? 'متصل' : 'غير متصل'}
                </div>
            </div>
            <div className="mt-6">
                <label className="text-sm font-medium text-text-secondary mb-2 block">مفتاح الربط (API Key)</label>
                <div className="relative">
                    <input 
                        type={showKey ? 'text' : 'password'}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="أدخل مفتاح الربط هنا..."
                        className="w-full bg-gray-900 border border-border rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button onClick={() => setShowKey(!showKey)} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white">
                        {showKey ? <EyeOff /> : <Eye />}
                    </button>
                </div>
            </div>
            <div className="mt-4 flex justify-end">
                <button className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-md transition-colors">
                    حفظ
                </button>
            </div>
        </div>
    );
};


const Integrations: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {mockIntegrations.map(int => <IntegrationCard key={int.id} integration={int} />)}
    </div>
  );
};

export default Integrations;
