import React from 'react';

const messages = [
  'جاري استخلاص المحتوى الرئيسي...',
  'يتم التحقق من الحقائق ومقارنتها...',
  'تتم إزالة التحيزات اللفظية...',
  'تتم إعادة الصياغة بأسلوب احترافي...',
  'يتم الآن توليد صورة للمقال...',
  'اللمسات الأخيرة على التقرير...',
];

export const Loader: React.FC = () => {
  const [message, setMessage] = React.useState(messages[0]);

  React.useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setMessage(messages[index]);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-8 text-center p-8 bg-sky-50/50 border border-sky-100 rounded-2xl">
      <div className="flex justify-center items-center mb-4">
        <svg className="animate-spin h-8 w-8 text-sky-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      <p className="text-lg font-semibold text-sky-700">جاري المعالجة بذكاء...</p>
      <p className="text-slate-500 mt-2 transition-opacity duration-500">{message}</p>
    </div>
  );
};