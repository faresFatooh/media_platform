import React from 'react';
import { RobotIcon } from './icons/RobotIcon';

const PipelineColumn: React.FC<{ title: string; count: number; children: React.ReactNode }> = ({ title, count, children }) => (
    <div className="flex-1 min-w-[300px] bg-slate-100 rounded-xl p-4">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-700">{title}</h3>
            <span className="text-sm font-bold bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full">{count}</span>
        </div>
        <div className="space-y-3">{children}</div>
    </div>
);

const ArticleCard: React.FC<{ title: string; source: string; time: string; tags: string[] }> = ({ title, source, time, tags }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 cursor-pointer hover:shadow-md hover:border-sky-300 transition-all">
        <p className="font-semibold text-slate-800 text-sm mb-2">{title}</p>
        <div className="flex justify-between items-center text-xs text-slate-500">
            <span>{source}</span>
            <span>{time}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map(tag => (
                <span key={tag} className="text-xs bg-sky-100 text-sky-700 font-medium px-2 py-0.5 rounded-full">{tag}</span>
            ))}
        </div>
    </div>
);

export const ContentPipeline: React.FC = () => {
    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">مسار النشر والمراجعة</h1>
                    <p className="text-slate-500 mt-1">إدارة المقالات من المسودة الأولية حتى النشر النهائي.</p>
                </div>
                <button className="bg-sky-600 text-white font-bold py-2 px-5 rounded-lg shadow-md hover:bg-sky-700 transition-all">
                    بدء مقال جديد
                </button>
            </div>
            
            <div className="flex overflow-x-auto space-x-4 space-x-reverse pb-4">
                <PipelineColumn title="مسودات الذكاء الاصطناعي" count={2}>
                    <ArticleCard 
                        title="تحليل أولي للبيانات الصادرة عن البنك المركزي بخصوص التضخم"
                        source="RSS: Reuters"
                        time="قبل 5 دقائق"
                        tags={['اقتصاد', 'عاجل']}
                    />
                     <ArticleCard 
                        title="ملخص لنتائج مباريات الدوري المحلي لكرة القدم"
                        source="API: Local Sports"
                        time="قبل 25 دقيقة"
                        tags={['رياضة']}
                    />
                </PipelineColumn>

                <PipelineColumn title="بانتظار المراجعة" count={1}>
                     <ArticleCard 
                        title="جامعة النجاح الوطنية تفوز بجائزة التميز الأكاديمي"
                        source="مُحرر: أحمد"
                        time="قبل ساعتين"
                        tags={['جامعة', 'أخبار محلية']}
                    />
                </PipelineColumn>

                 <PipelineColumn title="نُشر مؤخراً" count={3}>
                     <ArticleCard 
                        title="افتتاح قسم جديد في كلية الهندسة وتكنولوجيا المعلومات"
                        source="نُشر على Facebook, X"
                        time="اليوم، 11:30 ص"
                        tags={['جامعة', 'تكنولوجيا']}
                    />
                      <ArticleCard 
                        title="تقرير خاص: تأثير التغير المناخي على الزراعة في شمال الضفة"
                        source="نُشر على الموقع"
                        time="الأمس"
                        tags={['بيئة', 'تحقيق']}
                    />
                       <ArticleCard 
                        title="متابعة لآخر التطورات في أسواق المال العالمية"
                        source="نُشر على LinkedIn"
                        time="الأمس"
                        tags={['اقتصاد', 'دولي']}
                    />
                </PipelineColumn>
            </div>
        </div>
    );
};
