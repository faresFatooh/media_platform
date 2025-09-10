import React from 'react';
import { ClockIcon } from './icons/ClockIcon';
import { NewspaperIcon } from './icons/NewspaperIcon';

interface UserStatsProps {
  timeLeft: number;
  newsCount: number;
}

export const UserStats: React.FC<UserStatsProps> = ({ timeLeft, newsCount }) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isTimeRunningOut = timeLeft <= 60; // Less than 1 minute

  return (
    <div className="max-w-4xl mx-auto mb-6">
      <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-200 flex flex-col sm:flex-row justify-around items-center gap-4">
        <div className="flex items-center space-x-3 space-x-reverse">
          <ClockIcon className={`h-8 w-8 ${isTimeRunningOut ? 'text-red-500 animate-pulse' : 'text-sky-600'}`} />
          <div>
            <p className="text-sm text-slate-500">الوقت المتبقي</p>
            <p className={`text-2xl font-bold font-mono ${isTimeRunningOut ? 'text-red-600' : 'text-slate-800'}`}>
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </p>
          </div>
        </div>

        <div className="w-full sm:w-px h-px sm:h-12 bg-slate-200"></div>

        <div className="flex items-center space-x-3 space-x-reverse">
          <NewspaperIcon className="h-8 w-8 text-sky-600" />
          <div>
            <p className="text-sm text-slate-500">الأخبار المنجزة اليوم</p>
            <p className="text-2xl font-bold text-slate-800">{newsCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
