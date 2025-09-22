
import React from 'react';
import { Clock, CheckCircle, BarChart, Send, Newspaper } from 'lucide-react';

const kpiData = [
  { title: "متوسط وقت المعالجة", value: "28 ثانية", icon: Clock, color: "text-blue-400" },
  { title: "دقة التحرير الآلي", value: "92%", icon: CheckCircle, color: "text-green-400" },
  { title: "المنشورات اليومية", value: "112", icon: Send, color: "text-purple-400" },
  { title: "الأخبار قيد المراجعة", value: "8", icon: Newspaper, color: "text-yellow-400" }
];

const StatCard: React.FC<{ title: string; value: string; icon: React.ElementType; color: string; }> = ({ title, value, icon: Icon, color }) => (
    <div className="bg-surface rounded-lg p-6 flex items-center">
        <div className={`mr-4 p-3 rounded-full bg-gray-900 ${color}`}>
            <Icon className="w-8 h-8"/>
        </div>
        <div>
            <p className="text-text-secondary text-lg">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const Dashboard: React.FC = () => {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiData.map(kpi => <StatCard key={kpi.title} {...kpi} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <BarChart className="ml-2" />
            نشاط النشر (آخر 7 أيام)
          </h3>
          <div className="h-80 flex items-center justify-center">
            <p className="text-text-secondary">[ مكون الرسم البياني للنشاط ]</p>
          </div>
        </div>
        <div className="bg-surface rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">ملخص الطابور</h3>
          <ul className="space-y-4">
             <li className="flex justify-between items-center text-lg"><span>وارد جديد</span><span className="font-bold bg-blue-500 text-white px-3 py-1 rounded-full">15</span></li>
             <li className="flex justify-between items-center text-lg"><span>قيد المعالجة</span><span className="font-bold bg-purple-500 text-white px-3 py-1 rounded-full">5</span></li>
             <li className="flex justify-between items-center text-lg"><span>للمراجعة</span><span className="font-bold bg-yellow-500 text-black px-3 py-1 rounded-full">8</span></li>
             <li className="flex justify-between items-center text-lg"><span>جاهز للنشر</span><span className="font-bold bg-green-500 text-white px-3 py-1 rounded-full">22</span></li>
             <li className="flex justify-between items-center text-lg"><span>منشور اليوم</span><span className="font-bold bg-gray-600 text-white px-3 py-1 rounded-full">112</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
