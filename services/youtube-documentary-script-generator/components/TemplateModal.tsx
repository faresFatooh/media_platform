
import React from 'react';
import type { VideoTemplate } from '../types';
import { TemplateIcon, XMarkIcon } from './icons';

interface TemplateModalProps {
    templates: VideoTemplate[];
    onClose: () => void;
    onSelectTemplate: (template: VideoTemplate) => void;
}

const TemplateModal: React.FC<TemplateModalProps> = ({ templates, onClose, onSelectTemplate }) => {
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all animate-fade-in-up">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <TemplateIcon className="w-6 h-6 text-purple-400" />
                        قوالب فيديوهات احترافية
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700">
                        <XMarkIcon className="w-6 h-6 text-gray-400" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <ul className="space-y-3">
                        {templates.map((template, index) => (
                            <li
                                key={index}
                                onClick={() => onSelectTemplate(template)}
                                className="bg-gray-700/50 p-4 rounded-lg cursor-pointer hover:bg-purple-500/20 hover:border-purple-500 border border-transparent transition-all duration-200"
                            >
                                <h3 className="font-semibold text-white">{template.title}</h3>
                                <p className="text-sm text-gray-400 mt-1">{template.description}</p>
                            </li>
                        ))}
                    </ul>
                </div>
                 <div className="p-4 border-t border-gray-700 text-center">
                    <p className="text-sm text-gray-400">اختر قالباً لتبدأ في كتابة الموضوع.</p>
                </div>
            </div>
        </div>
    );
};

export default TemplateModal;
