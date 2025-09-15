import React from 'react';
import { Icon, ICON_LIST } from './Icon';

interface IconPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectIcon: (icon: string) => void;
    currentIcon: string;
}

export const IconPicker: React.FC<IconPickerProps> = ({ isOpen, onClose, onSelectIcon, currentIcon }) => {
    if (!isOpen) return null;

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            const base64Url = loadEvent.target?.result as string;
            if (base64Url) {
                onSelectIcon(base64Url);
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="icon-picker-title"
        >
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 id="icon-picker-title" className="text-xl font-bold text-gray-800">اختر أيقونة</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800" aria-label="Close icon picker">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-4 max-h-64 overflow-y-auto p-2 bg-gray-50 rounded-md border">
                    {ICON_LIST.map(iconName => (
                        <button
                            key={iconName}
                            onClick={() => onSelectIcon(iconName)}
                            className={`p-2 rounded-md transition-all duration-200 aspect-square flex items-center justify-center ${currentIcon === iconName ? 'bg-blue-500 ring-2 ring-blue-600 ring-offset-2' : 'bg-gray-200 hover:bg-gray-300'}`}
                            aria-label={`Select icon ${iconName}`}
                        >
                             <div className="text-gray-800 w-full h-full">
                                <Icon name={iconName} />
                            </div>
                        </button>
                    ))}
                </div>
                <div className="mt-6 border-t pt-4">
                    <label className="w-full text-center bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 cursor-pointer block transition-colors">
                        رفع أيقونة مخصصة
                        <input type="file" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp, image/svg+xml" className="hidden" />
                    </label>
                </div>
            </div>
        </div>
    );
};
