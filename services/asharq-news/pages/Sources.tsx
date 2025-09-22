
import React, { useState } from 'react';
import { PlusCircle, Rss, Code, ScanSearch, Trash2, Edit, MoreVertical } from 'lucide-react';
import { Source } from '../types';

const mockSources: Source[] = [
  { id: '1', name: 'وكالة رويترز (RSS)', url: 'https://www.reuters.com/pf/sites/_reuters/reuters/arabic/rss/topNews', type: 'RSS', credibility: 95, categories: ['عالمي', 'اقتصاد'], enabled: true, lastFetched: 'منذ 3 دقائق' },
  { id: '2', name: 'وكالة الأنباء الفلسطينية "وفا"', url: 'https://api.wafa.ps/v1/news', type: 'API', credibility: 98, categories: ['فلسطين', 'سياسة'], enabled: true, lastFetched: 'منذ 5 دقائق' },
  { id: '3', name: 'الجزيرة - اقتصاد', url: 'https://www.aljazeera.net/ebusiness/', type: 'Scraper', credibility: 85, categories: ['اقتصاد', 'تكنولوجيا'], enabled: false, lastFetched: 'منذ ساعة' },
  { id: '4', name: 'BBC عربي', url: 'http://feeds.bbci.co.uk/arabic/rss.xml', type: 'RSS', credibility: 90, categories: ['عالمي'], enabled: true, lastFetched: 'منذ 10 دقائق' },
];


const SourceTypeIcon: React.FC<{type: Source['type']}> = ({type}) => {
    if (type === 'RSS') return <Rss className="w-5 h-5 text-orange-400"/>;
    if (type === 'API') return <Code className="w-5 h-5 text-blue-400"/>;
    return <ScanSearch className="w-5 h-5 text-purple-400"/>;
}

const Sources: React.FC = () => {
    const [sources, setSources] = useState<Source[]>(mockSources);

    const toggleEnabled = (id: string) => {
        setSources(sources.map(s => s.id === id ? {...s, enabled: !s.enabled} : s));
    }

  return (
    <div className="bg-surface rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold">إدارة مصادر الأخبار</h3>
            <button className="flex items-center bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-md transition-colors">
                <PlusCircle className="ml-2" />
                إضافة مصدر جديد
            </button>
        </div>
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead className="border-b border-border">
            <tr>
              <th className="p-4">المصدر</th>
              <th className="p-4">النوع</th>
              <th className="p-4">الموثوقية</th>
              <th className="p-4">الفئات</th>
              <th className="p-4">آخر جلب</th>
              <th className="p-4">الحالة</th>
              <th className="p-4">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((source) => (
              <tr key={source.id} className="border-b border-border hover:bg-gray-700/50">
                <td className="p-4 font-semibold">{source.name}</td>
                <td className="p-4"><div className="flex items-center"><SourceTypeIcon type={source.type} /><span className="mr-2">{source.type}</span></div></td>
                <td className="p-4"><div className="w-full bg-gray-600 rounded-full h-2.5"><div className="bg-blue-500 h-2.5 rounded-full" style={{width: `${source.credibility}%`}}></div></div></td>
                <td className="p-4 flex flex-wrap gap-2">{source.categories.map(cat => <span key={cat} className="bg-gray-600 px-2 py-1 text-sm rounded">{cat}</span>)}</td>
                <td className="p-4 text-text-secondary">{source.lastFetched}</td>
                <td className="p-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={source.enabled} onChange={() => toggleEnabled(source.id)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </td>
                <td className="p-4">
                    <div className="flex space-x-reverse space-x-2">
                        <button className="text-text-secondary hover:text-blue-400"><Edit /></button>
                        <button className="text-text-secondary hover:text-red-500"><Trash2 /></button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Sources;
