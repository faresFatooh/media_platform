
import React from 'react';
import { LightBulbIcon, XMarkIcon } from './icons';

interface IdeaModalProps {
    ideas: string[];
    onClose: () => void;
    onSelectIdea: (idea: string) => void;
}

const IdeaModal: React.FC<IdeaModalProps> = ({ ideas, onClose, onSelectIdea }) => {
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all animate-fade-in-up">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <LightBulbIcon className="w-6 h-6 text-yellow-300" />
                        أفكار فيديوهات رائجة
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700">
                        <XMarkIcon className="w-6 h-6 text-gray-400" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <ul className="space-y-3">
                        {ideas.map((idea, index) => (
                            <li 
                                key={index} 
                                onClick={() => onSelectIdea(idea)}
                                className="bg-gray-700/50 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 hover:border-cyan-500 border border-transparent transition-all duration-200"
                            >
                                <p className="font-medium">{idea}</p>
                            </li>
                        ))}
                    </ul>
                </div>
                 <div className="p-4 border-t border-gray-700 text-center">
                    <p className="text-sm text-gray-400">اختر فكرة لتبدأ بها أو أغلق النافذة.</p>
                </div>
            </div>
        </div>
    );
};

export default IdeaModal;
