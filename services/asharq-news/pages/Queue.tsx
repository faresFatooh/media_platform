
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NewsItem, NewsItemStatus, Source } from '../types';
import { Rss, Clock, Edit, Check, Send, Sparkles, AlertTriangle } from 'lucide-react';

const mockSourcesList: Source[] = [
  { id: '1', name: 'رويترز', type: 'RSS' } as Source,
  { id: '2', name: 'وفا', type: 'API' } as Source,
  { id: '3', name: 'الجزيرة', type: 'Scraper' } as Source,
];

const mockNews: NewsItem[] = [
  { id: 'n1', sourceRef: '1', status: NewsItemStatus.DRAFT, normalizedContent: { title: 'المركزي الأوروبي يبقي على أسعار الفائدة دون تغيير' }, source: mockSourcesList[0], timestamps: { createdAt: '2024-05-21T10:00:00Z' } } as NewsItem,
  { id: 'n2', sourceRef: '2', status: NewsItemStatus.PROCESSING, normalizedContent: { title: 'مباحثات فلسطينية-أردنية لتعزيز التعاون الاقتصادي' }, source: mockSourcesList[1], timestamps: { createdAt: '2024-05-21T09:55:00Z' } } as NewsItem,
  { id: 'n3', sourceRef: '1', status: NewsItemStatus.REVIEW, normalizedContent: { title: 'أسعار النفط ترتفع وسط توقعات بزيادة الطلب' }, source: mockSourcesList[0], timestamps: { createdAt: '2024-05-21T09:50:00Z' } } as NewsItem,
  { id: 'n4', sourceRef: '3', status: NewsItemStatus.APPROVED, normalizedContent: { title: 'إطلاق قمر صناعي جديد لدراسة تغير المناخ' }, source: mockSourcesList[2], timestamps: { createdAt: '2024-05-21T09:45:00Z' } } as NewsItem,
  { id: 'n5', sourceRef: '2', status: NewsItemStatus.PUBLISHED, normalizedContent: { title: 'افتتاح معرض تكنولوجي جديد في رام الله' }, source: mockSourcesList[1], timestamps: { createdAt: '2024-05-21T09:40:00Z' } } as NewsItem,
  { id: 'n6', sourceRef: '1', status: NewsItemStatus.DRAFT, normalizedContent: { title: 'تقرير يحذر من مخاطر الذكاء الاصطناعي على الوظائف' }, source: mockSourcesList[0], timestamps: { createdAt: '2024-05-21T10:05:00Z' } } as NewsItem,
  { id: 'n7', sourceRef: '2', status: NewsItemStatus.REVIEW, normalizedContent: { title: 'الطقس: أجواء حارة وجافة تسيطر على المنطقة' }, source: mockSourcesList[1], timestamps: { createdAt: '2024-05-21T09:52:00Z' } } as NewsItem,
];

const statusConfig = {
    [NewsItemStatus.DRAFT]: { title: 'وارد جديد', icon: <Rss className="w-5 h-5" />, color: 'border-gray-500' },
    [NewsItemStatus.PROCESSING]: { title: 'قيد المعالجة', icon: <Sparkles className="w-5 h-5" />, color: 'border-purple-500' },
    [NewsItemStatus.REVIEW]: { title: 'للمراجعة', icon: <AlertTriangle className="w-5 h-5" />, color: 'border-yellow-500' },
    [NewsItemStatus.APPROVED]: { title: 'جاهز للنشر', icon: <Check className="w-5 h-5" />, color: 'border-green-500' },
    [NewsItemStatus.PUBLISHED]: { title: 'منشور', icon: <Send className="w-5 h-5" />, color: 'border-blue-500' },
};

const NewsCard: React.FC<{ item: NewsItem }> = ({ item }) => {
    const navigate = useNavigate();
    const timeAgo = Math.round((new Date().getTime() - new Date(item.timestamps.createdAt).getTime()) / 60000);
    
    return (
        <div 
          className="bg-gray-700 rounded-lg p-4 mb-4 cursor-pointer transition-all hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1"
          onClick={() => navigate(`/editor/${item.id}`)}
        >
            <h4 className="font-bold text-lg text-white">{item.normalizedContent.title}</h4>
            <div className="flex justify-between items-center mt-3 text-sm text-text-secondary">
                <span className="flex items-center"><Rss className="w-4 h-4 ml-2" /> {item.source.name}</span>
                <span className="flex items-center"><Clock className="w-4 h-4 ml-2" /> منذ {timeAgo} دقيقة</span>
            </div>
        </div>
    );
};

const QueueColumn: React.FC<{ status: NewsItemStatus, items: NewsItem[] }> = ({ status, items }) => {
    const config = statusConfig[status];
    return (
        <div className="bg-surface rounded-lg w-full flex-shrink-0">
            <div className={`flex items-center p-4 border-b-4 ${config.color}`}>
                {config.icon}
                <h3 className="text-xl font-bold mr-3">{config.title}</h3>
                <span className="mr-auto bg-gray-600 text-white rounded-full px-3 py-1 text-sm font-semibold">{items.length}</span>
            </div>
            <div className="p-4 h-full overflow-y-auto">
                {items.map(item => <NewsCard key={item.id} item={item} />)}
            </div>
        </div>
    );
};

const Queue: React.FC = () => {
    const columns: { status: NewsItemStatus; items: NewsItem[] }[] = Object.values(NewsItemStatus).map(status => ({
        status,
        items: mockNews.filter(item => item.status === status),
    }));

  return (
    <div className="flex space-x-reverse space-x-6 h-[calc(100vh-8rem)]">
        {columns.map(col => (
            <div key={col.status} className="w-1/5 h-full">
                <QueueColumn status={col.status} items={col.items} />
            </div>
        ))}
    </div>
  );
};

export default Queue;
