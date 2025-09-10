import React, { useState } from 'react';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';

const CommentCard: React.FC<{ user: string, platform: 'Facebook' | 'X', comment: string, status: 'approved' | 'rejected' | 'pending' }> = ({ user, platform, comment, status }) => {
    const statusStyles = {
        pending: { border: 'border-yellow-400', bg: 'bg-yellow-50', text: 'بانتظار المراجعة' },
        approved: { border: 'border-green-400', bg: 'bg-green-50', text: 'مقبول' },
        rejected: { border: 'border-red-400', bg: 'bg-red-50', text: 'مرفوض' },
    };

    return (
        <div className={`p-4 rounded-lg border-l-4 ${statusStyles[status].border} ${statusStyles[status].bg}`}>
            <p className="text-sm text-slate-700">"{comment}"</p>
            <div className="flex justify-between items-center mt-3">
                <span className="text-xs font-semibold text-slate-500">{user} عبر {platform}</span>
                {status === 'pending' && (
                    <div className="flex space-x-2 space-x-reverse">
                        <button className="text-xs font-bold text-green-600 bg-green-200 hover:bg-green-300 px-3 py-1 rounded-md">قبول</button>
                        <button className="text-xs font-bold text-red-600 bg-red-200 hover:bg-red-300 px-3 py-1 rounded-md">رفض</button>
                    </div>
                )}
                 {status !== 'pending' && <span className="text-xs font-bold text-slate-600">{statusStyles[status].text}</span>}
            </div>
        </div>
    );
};


export const Community: React.FC = () => {
    const [activeTab, setActiveTab] = useState('moderation');

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">إدارة المجتمع</h1>
                <p className="text-slate-500 mt-1">أدوات لمراقبة تفاعل الجمهور وتعزيز المشاركة المجتمعية.</p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
                <div className="border-b border-slate-200">
                     <nav className="flex space-x-4 space-x-reverse px-6" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('moderation')}
                            className={`flex items-center space-x-2 space-x-reverse py-4 px-1 text-sm font-medium border-b-2 ${
                                activeTab === 'moderation' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <ShieldCheckIcon />
                            <span>مراقبة التعليقات</span>
                        </button>
                        <button
                             onClick={() => setActiveTab('storybox')}
                            className={`flex items-center space-x-2 space-x-reverse py-4 px-1 text-sm font-medium border-b-2 ${
                                activeTab === 'storybox' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <MicrophoneIcon />
                            <span>صندوق القصة (ANU Voices)</span>
                        </button>
                    </nav>
                </div>
               
                {activeTab === 'moderation' && (
                    <div className="p-6">
                         <h3 className="text-lg font-bold text-slate-700 mb-1">تعليقات تحتاج للمراجعة</h3>
                         <p className="text-sm text-slate-500 mb-4">تمت فلترة هذه التعليقات تلقائياً بواسطة الذكاء الاصطناعي.</p>
                        <div className="space-y-4">
                            <CommentCard user="user123" platform="Facebook" comment="هذا الخبر غير دقيق بالمرة." status="pending" />
                             <CommentCard user="x_user" platform="X" comment="لماذا لا تتحدثون عن الموضوع الآخر؟" status="pending" />
                             <CommentCard user="fb_critic" platform="Facebook" comment="مقال رائع ومجهود تشكرون عليه!" status="approved" />
                             <CommentCard user="spam_user" platform="X" comment="زوروا موقعي لربح المال! www.example.com" status="rejected" />
                        </div>
                    </div>
                )}

                {activeTab === 'storybox' && (
                    <div className="p-6 text-center">
                        <h3 className="text-lg font-bold text-slate-700 mb-2">صندوق القصة – أصوات من النجاح</h3>
                        <p className="text-sm text-slate-500 mb-6 max-w-2xl mx-auto">
                            هذه الأداة مخصصة لكابينة التسجيل العازلة للصوت. يمكن للطلاب والزوار تسجيل قصصهم وتجاربهم لمدة 2-5 دقائق. يقوم النظام بعدها بتحويل التسجيل إلى محتوى متعدد الأشكال.
                        </p>
                        <div className="p-8 bg-slate-50 rounded-lg">
                            <button className="w-20 h-20 rounded-full flex items-center justify-center bg-sky-600 hover:bg-sky-700 mx-auto">
                                <MicrophoneIcon className="h-10 w-10 text-white" />
                            </button>
                             <p className="mt-4 font-semibold text-slate-600">اضغط لبدء تسجيل قصة جديدة</p>
                        </div>
                         <div className="mt-6">
                            <h4 className="font-bold text-slate-600 mb-2">مخرجات الذكاء الاصطناعي (بعد التسجيل):</h4>
                            <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-700 mt-4">
                                <span className="bg-slate-200 px-3 py-1.5 rounded-full">تحويل إلى نص مكتوب</span>
                                <span className="bg-slate-200 px-3 py-1.5 rounded-full">ملف صوتي مُحسّن</span>
                                <span className="bg-slate-200 px-3 py-1.5 rounded-full">فيديو قصير مع ترجمة</span>
                                <span className="bg-slate-200 px-3 py-1.5 rounded-full">صفحة ويب مخصصة للقصة</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
