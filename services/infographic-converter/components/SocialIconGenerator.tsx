
import React, { useState, useRef, useCallback } from 'react';
import { IconPicker } from './IconPicker';
import { Icon } from './Icon';

declare const html2canvas: any;

export const SocialIconGenerator: React.FC = () => {
    const [text, setText] = useState('اسم الحساب');
    const [icon, setIcon] = useState('global'); // default icon
    const [bgColor, setBgColor] = useState('#007BFF');
    const [textColor, setTextColor] = useState('#FFFFFF');
    const [fontSize, setFontSize] = useState(48);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const previewRef = useRef<HTMLDivElement>(null);

    const handleDownload = useCallback(async () => {
        if (!previewRef.current) return;
        setIsDownloading(true);
        try {
            const canvas = await html2canvas(previewRef.current, {
                scale: 1080 / previewRef.current.offsetWidth, // Target 1080px width
                useCORS: true,
                backgroundColor: null,
            });
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = 'social-icon.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Failed to download image", error);
            alert('حدث خطأ أثناء تنزيل الصورة.');
        } finally {
            setIsDownloading(false);
        }
    }, []);

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-8">
            {isPickerOpen && (
                <IconPicker 
                    isOpen={isPickerOpen} 
                    onClose={() => setIsPickerOpen(false)} 
                    onSelectIcon={(selectedIcon) => {
                        setIcon(selectedIcon);
                        setIsPickerOpen(false);
                    }} 
                    currentIcon={icon}
                />
            )}
            {/* Controls */}
            <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-800 border-b pb-3">تخصيص الأيقونة</h3>
                <div>
                    <label htmlFor="iconText" className="block text-lg font-semibold text-gray-700 mb-2">النص</label>
                    <input
                        type="text"
                        id="iconText"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-2">الأيقونة</label>
                    <button
                        onClick={() => setIsPickerOpen(true)}
                        className="w-full flex items-center justify-center gap-4 p-4 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                    >
                        <div className="w-10 h-10 text-blue-600"><Icon name={icon} /></div>
                        <span className="font-semibold">تغيير الأيقونة</span>
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="bgColor" className="block text-lg font-semibold text-gray-700 mb-2">لون الخلفية</label>
                        <input
                            type="color"
                            id="bgColor"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="w-full h-12 p-1 bg-white border border-gray-300 rounded-lg cursor-pointer"
                        />
                    </div>
                    <div>
                        <label htmlFor="textColor" className="block text-lg font-semibold text-gray-700 mb-2">لون النص</label>
                        <input
                            type="color"
                            id="textColor"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="w-full h-12 p-1 bg-white border border-gray-300 rounded-lg cursor-pointer"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="fontSize" className="block text-lg font-semibold text-gray-700 mb-2">
                        حجم الخط: <span className="font-bold text-blue-600">{fontSize}px</span>
                    </label>
                    <input
                        type="range"
                        id="fontSize"
                        min="24"
                        max="96"
                        value={fontSize}
                        onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
                 <div>
                    <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="w-full bg-green-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-300 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center text-xl"
                    >
                        {isDownloading ? 'جاري التنزيل...' : 'تنزيل الأيقونة (PNG)'}
                    </button>
                </div>
            </div>

            {/* Preview */}
            <div className="flex flex-col items-center justify-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">معاينة</h3>
                <div 
                    ref={previewRef}
                    className="w-full aspect-square rounded-lg flex flex-col items-center justify-center p-8 overflow-hidden shadow-inner"
                    style={{ backgroundColor: bgColor, fontFamily: 'Cairo, sans-serif' }}
                >
                    <div className="w-1/2 h-1/2 mb-4" style={{ color: textColor }}>
                        <Icon name={icon} />
                    </div>
                    <p 
                        className="text-center font-bold break-words"
                        style={{ color: textColor, fontSize: `${fontSize}px`, lineHeight: 1.2 }}
                    >
                        {text}
                    </p>
                </div>
            </div>
        </div>
    );
};
