
import React from 'react';
import { TextPair } from '../types';

interface ExamplePairViewProps {
  pair: TextPair;
  onDelete: (id: string) => void;
}

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
  </svg>
);

const ExamplePairView: React.FC<ExamplePairViewProps> = ({ pair, onDelete }) => {
  return (
    <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 relative group">
      <button 
        onClick={() => onDelete(pair.id)} 
        className="absolute top-2 left-2 p-1.5 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-200 transition-opacity"
        aria-label="حذف المثال"
      >
        <TrashIcon />
      </button>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase">الأصلي</p>
        <p className="text-sm text-slate-700">{pair.raw}</p>
      </div>
      <hr className="my-2 border-slate-200" />
      <div>
        <p className="text-xs font-bold text-green-500 uppercase">المحرر</p>
        <p className="text-sm text-green-700 font-medium">{pair.edited}</p>
      </div>
    </div>
  );
};

export default ExamplePairView;
