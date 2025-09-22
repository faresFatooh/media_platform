import React, { useState, useEffect, useCallback } from 'react';
import { OnThisDayData, OnThisDayEvent, NotificationMessage } from '../types';
import { getOnThisDayEvents } from '../services/geminiService';

interface OnThisDayProps {
    onGenerateScript: (title: string) => void;
    addNotification: (message: string, type: NotificationMessage['type']) => void;
}

const SkeletonLoader: React.FC = () => (
    <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                </div>
            </div>
        ))}
    </div>
);

const EventCard: React.FC<{ title: string; events: OnThisDayEvent[]; onGenerate: (title: string) => void; gradient: string }> = ({ title, events, onGenerate, gradient }) => (
    <div className="bg-card-bg-light dark:bg-card-bg-dark p-5 rounded-lg shadow-md border border-border-light dark:border-border-dark">
        <h3 className={`text-xl font-bold mb-4 pb-2 border-b-2 bg-clip-text text-transparent ${gradient} border-gray-200 dark:border-gray-700`}>{title}</h3>
        {events.length > 0 ? (
            <ul className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {events.map((event, index) => (
                    <li key={index} className="flex flex-col sm:flex-row sm:items-start gap-3 text-sm group">
                        <span className="font-bold text-primary dark:text-secondary whitespace-nowrap">{event.year}:</span>
                        <div className="flex-grow">
                            <p className="text-text-primary-light dark:text-text-primary-dark">{event.description}</p>
                            <button
                                onClick={() => onGenerate(event.description)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-1 flex items-center gap-1 text-xs text-white bg-primary hover:opacity-80 px-2 py-1 rounded-md"
                            >
                                <span>🚀</span>
                                <span>توليد نص</span>
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        ) : (
            <p className="text-text-secondary-light dark:text-text-secondary-dark">لا توجد بيانات متاحة.</p>
        )}
    </div>
);


const OnThisDay: React.FC<OnThisDayProps> = ({ onGenerateScript, addNotification }) => {
    const [date, setDate] = useState(new Date());
    const [data, setData] = useState<OnThisDayData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async (selectedDate: Date) => {
        setIsLoading(true);
        setData(null);
        try {
            const result = await getOnThisDayEvents(selectedDate);
            setData(result);
        } catch (error) {
            addNotification(error instanceof Error ? error.message : 'حدث خطأ غير متوقع', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [addNotification]);

    useEffect(() => {
        fetchData(date);
    }, [fetchData]);

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = new Date(event.target.value);
        // Adjust for timezone offset
        const timezoneOffset = newDate.getTimezoneOffset() * 60000;
        const adjustedDate = new Date(newDate.getTime() + timezoneOffset);
        setDate(adjustedDate);
        fetchData(adjustedDate);
    };

    const today = new Date();
    const todayISO = today.toISOString().split('T')[0];

    return (
        <div className="space-y-6">
            <div className="bg-card-bg-light dark:bg-card-bg-dark p-6 rounded-lg shadow-md border border-border-light dark:border-border-dark">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                     <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-3">
                        <span>📅</span>
                        حدث في مثل هذا اليوم
                    </h2>
                    <div className="flex items-center gap-3">
                         <label htmlFor="event-date" className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">اختر تاريخ:</label>
                         <input
                            id="event-date"
                            type="date"
                            value={date.toISOString().split('T')[0]}
                            max={todayISO}
                            onChange={handleDateChange}
                            className="p-2 border rounded-lg bg-bg-secondary-light dark:bg-bg-secondary-dark border-border-light dark:border-border-dark focus:ring-primary focus:border-primary"
                         />
                    </div>
                </div>
                 {data && !isLoading && <p className="text-lg font-semibold text-center text-text-secondary-light dark:text-text-secondary-dark">{data.date}</p>}
            </div>

            {isLoading ? (
                <SkeletonLoader />
            ) : data ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <EventCard title="أحداث" events={data.events} onGenerate={onGenerateScript} gradient="bg-gradient-to-r from-blue-500 to-indigo-600" />
                    <EventCard title="مواليد" events={data.births} onGenerate={onGenerateScript} gradient="bg-gradient-to-r from-green-400 to-teal-500" />
                    <EventCard title="وفيات" events={data.deaths} onGenerate={onGenerateScript} gradient="bg-gradient-to-r from-yellow-400 to-orange-500" />
                </div>
            ) : (
                 <div className="text-center p-10 bg-card-bg-light dark:bg-card-bg-dark rounded-lg">
                    <p className="text-text-secondary-light dark:text-text-secondary-dark">لم يتم العثور على بيانات للتاريخ المحدد. الرجاء اختيار يوم آخر.</p>
                </div>
            )}
        </div>
    );
};

export default OnThisDay;
