import React, { useState } from 'react';
import { generateContent } from '../services/geminiService';
import { CONTENT_TEMPLATES } from '../constants';
import { Platform, type GenerationResult, type ContentTemplate } from '../types';
import { Spinner } from './Spinner';
import GenerationResultDisplay from './GenerationResultDisplay';
import { 
    SparklesIcon, XIcon, FacebookIcon, InstagramIcon, YoutubeIcon, LinkedinIcon, 
    TelegramIcon, NewspaperIcon, ChartBarIcon, TikTokIcon, FactCheckIcon, CalendarDaysIcon 
} from './Icons';
import { createFacebookPost } from '../services/geminiService'; // <-- تأكد انو عندك هاد

interface BatchResult {
  templateTitle: string;
  platform: Platform;
  result: GenerationResult;
}

const platformIconMap: Record<Platform, React.FC<React.SVGProps<SVGSVGElement>>> = {
  [Platform.X]: XIcon,
  [Platform.Facebook]: FacebookIcon,
  [Platform.Instagram]: InstagramIcon,
  [Platform.YouTube]: YoutubeIcon,
  [Platform.LinkedIn]: LinkedinIcon,
  [Platform.Telegram]: TelegramIcon,
  [Platform.News]: NewspaperIcon,
  [Platform.Analysis]: ChartBarIcon,
  [Platform.Creative]: SparklesIcon,
  [Platform.TikTok]: TikTokIcon,
  [Platform.FactCheck]: FactCheckIcon,
  [Platform.General]: CalendarDaysIcon,
};

const BATCHABLE_TEMPLATE_IDS = new Set([2, 4, 5, 6, 7, 8, 9, 10, 11]);
const batchableTemplates = CONTENT_TEMPLATES.filter(t => BATCHABLE_TEMPLATE_IDS.has(t.id));

const mapTopicToTemplateInputs = (topic: string, template: ContentTemplate): Record<string, string> => {
  if (template.fields.length === 1) {
    return { [template.fields[0].name]: topic };
  }
  switch (template.id) {
    case 4: return { event: topic, angle: 'الأبعاد السياسية والاجتماعية' };
    case 5: return { topic: topic, tone: 'تعليمي' };
    case 6: return { topic: topic, audience: 'الجمهور العام' };
    case 7: return { topic: topic, style: 'معلوماتي' };
    case 8: return { topic: topic, duration: '30 ثانية' };
    case 9: return { videoTitle: topic, keywords: topic.split(' ').slice(0, 5).join(', ') };
    case 10: return { topic: topic, goal: 'إثارة نقاش' };
    case 11: return { title: topic, points: 'لخص النقاط الرئيسية حول الموضوع' };
    default:
      if (template.fields.length > 0) {
        return { [template.fields[0].name]: topic };
      }
      return {};
  }
};

const BatchGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [results, setResults] = useState<BatchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateAll = async () => {
    if (!topic.trim()) return;

    setIsLoading(true);
    setResults([]);

    const promises = batchableTemplates.map(async (template) => {
      const inputs = mapTopicToTemplateInputs(topic, template);
      const prompt = template.prompt(inputs);
      const useGoogleSearch = [Platform.News, Platform.Analysis].includes(template.platform);
      
      const generationResult = await generateContent(prompt, useGoogleSearch);

      const newResult: BatchResult = {
        templateTitle: template.title,
        platform: template.platform,
        result: generationResult,
      };

      setResults(prev => [...prev, newResult]);
    });

    try {
      await Promise.all(promises);
    } catch (error) {
      console.error("An error occurred during batch generation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async (platform: Platform, content: string) => {
    try {
      if (!content) {
        alert("⚠️ لا يوجد محتوى للنشر.");
        return;
      }

      if (platform === Platform.Facebook) {
        await createFacebookPost({ message: content });
        alert("✅ تم النشر على فيسبوك!");
      } else if (platform === Platform.X) {
        alert("🚧 النشر على تويتر قيد التطوير.");
      } else if (platform === Platform.Instagram) {
        alert("🚧 النشر على إنستغرام قيد التطوير.");
      } else {
        alert(`🚧 النشر على ${Platform[platform]} غير مفعل بعد.`);
      }
    } catch (err) {
      console.error(err);
      alert(`❌ فشل النشر على ${Platform[platform]}`);
    }
  };

  const sortedResults = [...results].sort((a, b) => {
    const orderA = batchableTemplates.findIndex(t => t.title === a.templateTitle);
    const orderB = batchableTemplates.findIndex(t => t.title === b.templateTitle);
    return orderA - orderB;
  });

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-12 border border-gray-700" dir="rtl">
      <h2 className="text-2xl font-bold mb-4 text-white flex items-center">
        <SparklesIcon className="h-6 w-6 ml-2 text-green-400" />
        <span>مولّد المحتوى الشامل</span>
      </h2>
      <p className="text-gray-400 mb-4">
        أدخل موضوعًا واحدًا لتوليد محتوى لجميع المنصات الرئيسية دفعة واحدة.
      </p>
      
      <div className="space-y-4">
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="مثال: إطلاق مبادرة جديدة لدعم التراث الفلسطيني..."
          className="w-full h-24 p-3 bg-gray-900 border border-gray-600 rounded-md text-gray-200 focus:ring-2 focus:ring-green-500 transition-colors duration-200"
          rows={3}
          disabled={isLoading}
        />
        <div className="flex justify-end">
          <button
            onClick={handleGenerateAll}
            disabled={isLoading || !topic.trim()}
            className="flex items-center justify-center px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200 w-full sm:w-auto"
          >
            {isLoading ? <Spinner /> : `ولّد (${batchableTemplates.length}) قوالب`}
          </button>
        </div>
      </div>

      {isLoading && results.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>جاري توليد المحتوى لجميع القوالب... قد يستغرق هذا بعض الوقت.</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-8 space-y-6">
          <h3 className="text-xl font-bold text-white border-b border-gray-600 pb-2">النتائج المولّدة:</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedResults.map(({ templateTitle, platform, result }) => {
              const Icon = platformIconMap[platform] || SparklesIcon;
              return (
                <div key={templateTitle} className="bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="p-4 border-b border-gray-700 flex items-center space-x-3 rtl:space-x-reverse">
                    <Icon className="h-6 w-6 text-gray-300" />
                    <h4 className="font-bold text-lg text-white">{templateTitle}</h4>
                  </div>
                  <div className="p-4">
                    <GenerationResultDisplay result={result} />
                    <button
                      onClick={() => handlePublish(platform, result.text)}
                      className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                      نشر على {Platform[platform]}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchGenerator;
