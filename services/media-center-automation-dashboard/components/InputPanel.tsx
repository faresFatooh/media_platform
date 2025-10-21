import React, { useState } from 'react';
import axios from 'axios'; // استيراد axios لإرسال الطلبات
import { INPUT_WORKFLOWS } from '../constants';
import { Workflow } from '../types';

interface InputPanelProps {
  isLoading: boolean;
  isAutomationOn: boolean;
  onToggleAutomation: () => void;
}

const InputPanel: React.FC<InputPanelProps> = ({ isLoading, isAutomationOn, onToggleAutomation }) => {
  const [manualText, setManualText] = useState('');

  // دالة لإرسال الطلب لـ n8n
  const handleWorkflowRequest = async (workflow: Workflow) => {
    if (isLoading || !manualText.trim()) return;

    try {
      const response = await axios.post(process.env.N8N_WEBHOOK_URL!, {
        text: workflow.payload?.text || manualText, // استخدام النص اليدوي أو النص من payload
        policy: workflow.name, // استخدام اسم الـ workflow كـ policy
      }, {
        headers: {
          'X-API-Key': process.env.N8N_API_KEY, // إضافة المفتاح
        },
      });
      console.log('Success:', response.data);
    } catch (error) {
      console.error('Error sending to n8n:', error);
    }
  };

  const handleManualSubmit = () => {
    if (manualText.trim()) {
      handleWorkflowRequest({
        id: 'manual-text',
        name: 'إدخال نص يدوي',
        description: '',
        icon: 'fa-solid fa-file-pen',
        type: 'input',
        payload: { text: manualText },
      });
      setManualText('');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-full flex flex-col">
      <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3 flex-shrink-0">
        <i className="fas fa-sign-in-alt mr-2"></i>
        المدخلات الرئيسية
      </h2>
      
      <div className="space-y-4 overflow-y-auto pr-2 flex-grow">
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-gray-700 mb-2">إدخال خبر يدوي</h3>
          <textarea
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            rows={4}
            placeholder="الصق النص هنا..."
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            disabled={isLoading}
          ></textarea>
          <button
            onClick={handleManualSubmit}
            className="mt-2 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 disabled:bg-gray-400"
            disabled={isLoading || !manualText.trim()}
          >
            {isLoading ? 'جاري المعالجة...' : 'ابدأ المعالجة'}
          </button>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-gray-700 mb-2">الأتمتة المستمرة</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">تفعيل السحب التلقائي للأخبار كل ساعة</span>
            <button
              onClick={onToggleAutomation}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isAutomationOn ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isAutomationOn ? 'translate-x-6' : 'translate-x-1'}`}/>
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">عند التفعيل، سيقوم النظام بسحب الأخبار من المصادر العربية تلقائياً.</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {INPUT_WORKFLOWS.filter(w => w.id !== 'manual-text').map((workflow) => (
            <button
              key={workflow.id}
              onClick={() => handleWorkflowRequest(workflow)}
              disabled={isLoading}
              className="flex flex-col items-center justify-start text-center p-3 bg-white border rounded-lg hover:bg-gray-100 hover:shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed h-28"
            >
              <i className={`${workflow.icon} text-2xl text-gray-600 mb-2`}></i>
              <span className="text-xs font-bold text-gray-800 leading-tight">{workflow.name}</span>
              <span className="text-xs text-gray-500 mt-1">{workflow.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InputPanel;