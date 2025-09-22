
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Image as ImageIcon, Film, Mic, FileText, Check, Send, Sparkles, Languages, Save } from 'lucide-react';

const platforms = [
  'Facebook', 'Instagram', 'TikTok', 'Telegram', 'WhatsApp', 'YouTube', 'X', 'LinkedIn'
];

const NewsEditor: React.FC = () => {
  const { id } = useParams();
  const [mainTitle, setMainTitle] = useState('أسعار النفط ترتفع وسط توقعات بزيادة الطلب العالمي');
  const [body, setBody] = useState('ارتفعت أسعار النفط اليوم مدعومة بتوقعات متزايدة لنمو الطلب على الخام خلال الصيف، على الرغم من أن المكاسب كانت محدودة بفعل ارتفاع الدولار...');
  const [altTitles, setAltTitles] = useState([
    'النفط يواصل الصعود مع رهانات على طلب صيفي قوي',
    'مكاسب نفطية رغم قوة الدولار',
    'الخام يرتفع: هل يستمر التفاؤل في الأسواق؟',
    'توقعات الطلب تدفع أسعار النفط للأعلى',
    'صيف ساخن في أسواق الطاقة العالمية',
  ]);

  return (
    <div className="grid grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      {/* Main Editor Column */}
      <div className="col-span-2 flex flex-col gap-6">
        <div className="bg-surface rounded-lg p-6 flex-grow flex flex-col">
            <h3 className="text-xl font-bold mb-4">المحرر الرئيسي</h3>
            <label className="text-sm font-medium text-text-secondary mb-2 block">العنوان الرئيسي</label>
            <input 
                type="text"
                value={mainTitle}
                onChange={(e) => setMainTitle(e.target.value)}
                className="w-full bg-gray-900 border border-border rounded-md py-2 px-4 mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
            />
             <label className="text-sm font-medium text-text-secondary mb-2 block">نص الخبر</label>
            <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full h-full bg-gray-900 border border-border rounded-md py-2 px-4 mb-4 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
        </div>
        <div className="bg-surface rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center"><Sparkles className="ml-2 text-yellow-400"/>عناوين بديلة (مقترحة من AI)</h3>
            <div className="space-y-3">
                {altTitles.map((title, index) => (
                    <input key={index} type="text" value={title} className="w-full bg-gray-900 border border-border rounded-md py-2 px-4" readOnly />
                ))}
            </div>
        </div>
      </div>

      {/* Media & Publishing Column */}
      <div className="col-span-1 flex flex-col gap-6">
        <div className="bg-surface rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">توليد الوسائط</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 font-semibold py-3 px-4 rounded-md transition-colors"><ImageIcon className="ml-3"/> توليد صورة الخبر</button>
            <button className="w-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 font-semibold py-3 px-4 rounded-md transition-colors"><FileText className="ml-3"/> توليد إنفوجرافيك</button>
            <button className="w-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 font-semibold py-3 px-4 rounded-md transition-colors"><Film className="ml-3"/> توليد فيديو قصير</button>
            <button className="w-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 font-semibold py-3 px-4 rounded-md transition-colors"><Mic className="ml-3"/> توليد ملف صوتي (TTS)</button>
             <button className="w-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 font-semibold py-3 px-4 rounded-md transition-colors"><Languages className="ml-3"/> ترجمة وإنشاء SRT</button>
          </div>
        </div>
        <div className="bg-surface rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">معاينة النشر</h3>
            <div className="w-full h-40 bg-gray-900 rounded-md flex items-center justify-center text-text-secondary mb-4">
                [ منطقة المعاينة للمنصة المختارة ]
            </div>
            <select className="w-full bg-gray-900 border border-border rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary">
                {platforms.map(p => <option key={p}>{p}</option>)}
            </select>
        </div>
         <div className="bg-surface rounded-lg p-6 mt-auto">
            <div className="flex flex-col gap-3">
                <button className="w-full flex items-center justify-center bg-gray-600 hover:bg-gray-500 font-bold py-3 px-4 rounded-md transition-colors"><Save className="ml-3"/> حفظ كمسودة</button>
                <button className="w-full flex items-center justify-center bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-md transition-colors"><Check className="ml-3"/> اعتماد للمراجعة</button>
                <button className="w-full flex items-center justify-center bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-md transition-colors"><Send className="ml-3"/> نشر الآن</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default NewsEditor;
