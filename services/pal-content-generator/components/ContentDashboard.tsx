import React, { useState, useMemo } from 'react';
import { CONTENT_TEMPLATES } from '../constants';
import { Platform } from '../types';
import ContentCard from './ContentCard';
import CustomGenerator from './CustomGenerator';
import BatchGenerator from './BatchGenerator';
import { 
  XIcon, FacebookIcon, InstagramIcon, YoutubeIcon, LinkedinIcon, TelegramIcon, 
  NewspaperIcon, ChartBarIcon, SparklesIcon, CalendarDaysIcon, TikTokIcon, FactCheckIcon
} from './Icons';

const platformFilters = [
  { name: 'الكل', platform: null, icon: <SparklesIcon className="h-5 w-5" /> },
  { name: 'X', platform: Platform.X, icon: <XIcon className="h-5 w-5" /> },
  { name: 'فيسبوك', platform: Platform.Facebook, icon: <FacebookIcon className="h-5 w-5" /> },
  { name: 'إنستغرام', platform: Platform.Instagram, icon: <InstagramIcon className="h-5 w-5" /> },
  { name: 'يوتيوب', platform: Platform.YouTube, icon: <YoutubeIcon className="h-5 w-5" /> },
  { name: 'لينكدإن', platform: Platform.LinkedIn, icon: <LinkedinIcon className="h-5 w-5" /> },
  { name: 'تليجرام', platform: Platform.Telegram, icon: <TelegramIcon className="h-5 w-5" /> },
  { name: 'أخبار', platform: Platform.News, icon: <NewspaperIcon className="h-5 w-5" /> },
  { name: 'تحليل', platform: Platform.Analysis, icon: <ChartBarIcon className="h-5 w-5" /> },
  { name: 'إبداعي', platform: Platform.Creative, icon: <SparklesIcon className="h-5 w-5" /> },
  { name: 'تيك توك', platform: Platform.TikTok, icon: <TikTokIcon className="h-5 w-5" /> },
  { name: 'تدقيق', platform: Platform.FactCheck, icon: <FactCheckIcon className="h-5 w-5" /> },
  { name: 'أحداث', platform: Platform.General, icon: <CalendarDaysIcon className="h-5 w-5" /> },
];

const ContentDashboard: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<Platform | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTemplates = useMemo(() => {
    return CONTENT_TEMPLATES.filter(template => {
      const matchesFilter = activeFilter === null || template.platform === activeFilter;
      const matchesSearch = searchTerm === '' || 
                            template.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            template.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchTerm]);

  return (
    <div className="space-y-12">
      <CustomGenerator />
      <BatchGenerator />
      
      <div>
        <h2 className="text-3xl font-bold text-center mb-2 text-white">أو اختر قالبًا فرديًا</h2>
        <p className="text-center text-gray-400 mb-8">اختر من القوالب المصممة خصيصًا لإنشاء محتوى عالي الجودة بسرعة.</p>

        <div className="mb-8 sticky top-0 bg-gray-900/80 backdrop-blur-sm py-4 z-10">
            <div className="flex justify-center mb-4">
                <input
                    type="text"
                    placeholder="ابحث عن قالب..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full max-w-lg p-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-green-500"
                />
            </div>
          <div className="flex flex-wrap justify-center gap-2">
            {platformFilters.map(filter => (
              <button
                key={filter.name}
                onClick={() => setActiveFilter(filter.platform)}
                className={`flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
                  activeFilter === filter.platform
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {filter.icon}
                <span>{filter.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => (
            <ContentCard key={template.id} template={template} />
          ))}
        </div>
        {filteredTemplates.length === 0 && (
            <p className="text-center text-gray-500 col-span-full mt-8">
                لم يتم العثور على قوالب تطابق بحثك.
            </p>
        )}
      </div>
    </div>
  );
};

export default ContentDashboard;