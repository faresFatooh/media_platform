import React, { useState } from 'react';

export const Management: React.FC = () => {
    const [activeTab, setActiveTab] = useState('projects');
    
    // State for the interactive budget tracker
    const [reportPeriod, setReportPeriod] = useState('quarterly'); // 'monthly', 'quarterly', 'yearly'
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [reportData, setReportData] = useState({
        title: 'تقرير الميزانية - الربع الثالث',
        spent: 15400,
        total: 25000,
        aiTip: 'ملاحظة: تم إنفاق 70% من ميزانية "الإعلانات الممولة" في أول شهر من الربع. يُنصح بإعادة توزيع الميزانية المتبقية أو تقليل الإنفاق للحفاظ على الميزانية الإجمالية.'
    });

    const handleGenerateReport = () => {
        setIsGeneratingReport(true);
        // Simulate an API call to fetch data for the selected period
        setTimeout(() => {
            let newData;
            switch (reportPeriod) {
                case 'monthly':
                    newData = {
                        title: 'تقرير الميزانية - الشهر الحالي',
                        spent: 4800,
                        total: 8000,
                        aiTip: 'الإنفاق الشهري ضمن الحدود. يوجد فائض في ميزانية التسويق يمكن استغلاله.'
                    };
                    break;
                case 'yearly':
                     newData = {
                        title: 'تقرير الميزانية - السنوي',
                        spent: 85000,
                        total: 100000,
                        aiTip: 'الأداء السنوي جيد. تم تحقيق توفير بنسبة 15% من الميزانية الإجمالية.'
                    };
                    break;
                case 'quarterly':
                default:
                     newData = {
                        title: 'تقرير الميزانية - الربع الثالث',
                        spent: 15400,
                        total: 25000,
                        aiTip: 'ملاحظة: تم إنفاق 70% من ميزانية "الإعلانات الممولة" في أول شهر من الربع. يُنصح بإعادة توزيع الميزانية المتبقية.'
                    };
            }
            setReportData(newData);
            setIsGeneratingReport(false);
        }, 1200);
    };


    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">الإدارة والمشاريع</h1>
                <p className="text-slate-500 mt-1">أدوات لتنظيم العمل وتتبع الموارد وإدارة المهام.</p>
            </div>

             <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
                <div className="border-b border-slate-200">
                     <nav className="flex space-x-4 space-x-reverse px-6" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('projects')}
                            className={`py-4 px-1 text-sm font-medium border-b-2 ${
                                activeTab === 'projects' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        >
                           المهام والمشاريع
                        </button>
                        <button
                             onClick={() => setActiveTab('budget')}
                            className={`py-4 px-1 text-sm font-medium border-b-2 ${
                                activeTab === 'budget' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            متتبع الميزانية
                        </button>
                         <button
                             onClick={() => setActiveTab('logs')}
                            className={`py-4 px-1 text-sm font-medium border-b-2 ${
                                activeTab === 'logs' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            سجل ساعات العمل
                        </button>
                    </nav>
                </div>
               
                <div className="p-6">
                    {activeTab === 'projects' && (
                        <div>
                            <h3 className="text-lg font-bold text-slate-700 mb-4">لوحة المهام</h3>
                             <p className="text-sm text-slate-500 mb-4">(مثال توضيحي لواجهة إدارة المهام)</p>
                             <ul className="space-y-3">
                                <li className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                    <div>
                                        <p className="font-semibold text-slate-800">إعداد تقرير التغطية الإعلامية لفعالية التخرج</p>
                                        <span className="text-xs text-slate-500">مسندة إلى: سارة</span>
                                    </div>
                                    <span className="text-xs font-bold text-white bg-green-500 px-3 py-1 rounded-full">مكتمل</span>
                                </li>
                                <li className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                    <div>
                                        <p className="font-semibold text-slate-800">إجراء مقابلة مع رئيس قسم الهندسة</p>
                                        <span className="text-xs text-slate-500">مسندة إلى: محمد</span>
                                    </div>
                                    <span className="text-xs font-bold text-white bg-yellow-500 px-3 py-1 rounded-full">قيد التنفيذ</span>
                                </li>
                                 <li className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                    <div>
                                        <p className="font-semibold text-slate-800">نشر الملخص اليومي للأخبار على الموقع</p>
                                        <span className="text-xs text-slate-500">مسندة إلى: قسم النشر</span>
                                    </div>
                                    <span className="text-xs font-bold text-white bg-red-500 px-3 py-1 rounded-full">متأخر</span>
                                </li>
                             </ul>
                        </div>
                    )}
                    {activeTab === 'budget' && (
                         <div>
                            <h3 className="text-lg font-bold text-slate-700 mb-4">متتبع الميزانية</h3>
                            
                            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg mb-6">
                                <div className="flex-1 w-full">
                                    <label htmlFor="report-period" className="block text-sm font-medium text-slate-600 mb-1">
                                        اختر فترة التقرير
                                    </label>
                                    <select
                                        id="report-period"
                                        value={reportPeriod}
                                        onChange={(e) => setReportPeriod(e.target.value)}
                                        className="w-full p-2 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-sky-500"
                                    >
                                        <option value="monthly">شهري</option>
                                        <option value="quarterly">ربع سنوي</option>
                                        <option value="yearly">سنوي</option>
                                    </select>
                                </div>
                                <button
                                    onClick={handleGenerateReport}
                                    disabled={isGeneratingReport}
                                    className="w-full sm:w-auto self-end py-2 px-6 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isGeneratingReport ? '...جاري التوليد' : 'توليد التقرير'}
                                </button>
                            </div>

                            {isGeneratingReport ? (
                                <div className="text-center p-8 text-slate-500">
                                    جاري تحميل بيانات التقرير...
                                </div>
                            ) : (
                                <div>
                                    <h4 className="font-bold text-slate-800 mb-4">{reportData.title}</h4>
                                    <div className="mb-6">
                                        <span className="font-semibold">
                                            إجمالي الإنفاق: ${reportData.spent.toLocaleString()} / ${reportData.total.toLocaleString()}
                                        </span>
                                        <div className="mt-1 w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                                            <div
                                                className="bg-sky-500 h-4 rounded-full transition-all duration-500"
                                                style={{ width: `${(reportData.spent / reportData.total) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-sky-50 border border-sky-200 rounded-lg">
                                        <h4 className="font-bold text-sky-800">نصيحة AI لتحسين الإنفاق</h4>
                                        <p className="text-sm text-sky-700 mt-1">
                                            {reportData.aiTip}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                     {activeTab === 'logs' && (
                         <div>
                            <h3 className="text-lg font-bold text-slate-700 mb-4">سجل العمل الذكي</h3>
                             <p className="text-sm text-slate-500 mb-4">(مثال توضيحي لسجل ساعات الموظفين مع نظام النقاط)</p>
                             <div className="overflow-x-auto">
                                 <table className="w-full text-sm text-right">
                                    <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                                        <tr>
                                            <th className="px-6 py-3">الموظف</th>
                                            <th className="px-6 py-3">آخر مهمة مسجلة</th>
                                            <th className="px-6 py-3">ساعات اليوم</th>
                                            <th className="px-6 py-3">نقاط الأداء</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="bg-white border-b">
                                            <td className="px-6 py-4 font-semibold">أحمد علي</td>
                                            <td className="px-6 py-4">كتابة مقال تحليلي</td>
                                            <td className="px-6 py-4">8.5</td>
                                            <td className="px-6 py-4 font-bold text-green-600">120</td>
                                        </tr>
                                        <tr className="bg-white border-b">
                                            <td className="px-6 py-4 font-semibold">فاطمة الزهراء</td>
                                            <td className="px-6 py-4">مونتاج فيديو</td>
                                            <td className="px-6 py-4">7.0</td>
                                            <td className="px-6 py-4 font-bold text-green-600">95</td>
                                        </tr>
                                    </tbody>
                                 </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};