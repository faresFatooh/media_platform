import React from 'react';
import { BellIcon } from './icons/BellIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { NewspaperIcon } from './icons/NewspaperIcon';

const StatCard: React.FC<{ title: string; value: string; change: string; changeType: 'up' | 'down'; icon: React.ReactNode; }> = ({ title, value, change, changeType, icon }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
        <div className="flex items-center space-x-4 space-x-reverse">
            <div className="bg-sky-100 text-sky-600 p-3 rounded-full">
                {icon}
            </div>
            <div>
                <p className="text-slate-500 text-sm font-medium">{title}</p>
                <p className="text-3xl font-bold text-slate-800">{value}</p>
            </div>
        </div>
        <p className={`mt-2 text-sm flex items-center ${changeType === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {changeType === 'up' ? '▲' : '▼'}
            <span className="mr-1">{change}</span>
            <span className="text-slate-400 font-normal mr-1">عن الأسبوع الماضي</span>
        </p>
    </div>
);

const ChartPlaceholder: React.FC<{ title: string }> = ({ title }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
        <h3 className="text-lg font-bold text-slate-700 mb-4">{title}</h3>
        <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
            <p className="text-slate-400 text-sm">-- بيانات الرسم البياني هنا --</p>
        </div>
    </div>
);

export const Dashboard: React.FC = () => {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-slate-800">لوحة التحكم الرئيسية</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="إجمالي المشاهدات (أسبوع)" value="1.2 مليون" change="12.5%" changeType="up" icon={<ChartBarIcon />} />
                <StatCard title="مقالات منشورة (أسبوع)" value="84" change="5.2%" changeType="up" icon={<NewspaperIcon className="h-6 w-6"/>} />
                <StatCard title="تنبيهات عاجلة (اليوم)" value="3" change="1" changeType="down" icon={<BellIcon />} />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartPlaceholder title="تفاعل الجمهور خلال 30 يومًا" />
                <ChartPlaceholder title="أداء المحتوى حسب الفئة" />
            </div>

            {/* Top Articles & Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-700 mb-4">المقالات الأكثر قراءة</h3>
                    <ul className="space-y-3">
                        <li className="text-sm text-slate-600 hover:text-sky-600 cursor-pointer">1. "جامعة النجاح تطلق مبادرة بحثية جديدة في مجال الذكاء الاصطناعي" - <span className="font-semibold">25.4 ألف قراءة</span></li>
                        <li className="text-sm text-slate-600 hover:text-sky-600 cursor-pointer">2. "تحليل لأثر السياسات الاقتصادية الأخيرة على السوق المحلي" - <span className="font-semibold">18.9 ألف قراءة</span></li>
                        <li className="text-sm text-slate-600 hover:text-sky-600 cursor-pointer">3. "تغطية خاصة لفعاليات المؤتمر الثقافي السنوي" - <span className="font-semibold">12.1 ألف قراءة</span></li>
                    </ul>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                     <h3 className="text-lg font-bold text-slate-700 mb-4">آخر التنبيهات والأحداث</h3>
                     <ul className="space-y-3">
                        <li className="text-sm"><span className="font-bold text-red-600">[عاجل]</span> بيان صحفي مرتقب من وزارة التعليم العالي خلال ساعة.</li>
                        <li className="text-sm"><span className="font-bold text-yellow-600">[متابعة]</span> ارتفاع ملحوظ في مؤشرات الأسهم المحلية عند الإغلاق.</li>
                        <li className="text-sm"><span className="font-bold text-blue-600">[تنويه]</span> سيتم إجراء صيانة للموقع الرسمي يوم غد من 2-4 فجراً.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
