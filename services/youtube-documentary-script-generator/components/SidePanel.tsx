
import React, { useState } from 'react';
import type { DocumentaryScript, PromoContent, GeneratedMedia, ShortsScript } from '../types';
import PromoPanel from './PromoPanel';
import MediaGenerator from './MediaGenerator';
import ShortsPanel from './ShortsPanel';
import { MegaphoneIcon, PhotoIcon, DevicePhoneMobileIcon } from './icons';

interface SidePanelProps {
    script: DocumentaryScript;
    promoContent: PromoContent | null;
    shortsScripts: ShortsScript[] | null;
    generatedMedia: GeneratedMedia;
    onGeneratePromo: () => void;
    onGenerateShorts: () => void;
    onGenerateMedia: (prompt: string, type: 'image' | 'video') => void;
    isLoadingPromo: boolean;
    isLoadingShorts: boolean;
    isLoadingMedia: boolean;
    mediaGenerationProgress: string;
}

type ActiveTab = 'promo' | 'shorts' | 'media';

const SidePanel: React.FC<SidePanelProps> = (props) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('promo');

    return (
        <div className="bg-gray-800 rounded-xl shadow-lg flex flex-col">
            <div className="flex border-b border-gray-700">
                <TabButton
                    icon={<MegaphoneIcon className="w-5 h-5"/>}
                    label="المحتوى الترويجي"
                    isActive={activeTab === 'promo'}
                    onClick={() => setActiveTab('promo')}
                />
                 <TabButton
                    icon={<DevicePhoneMobileIcon className="w-5 h-5"/>}
                    label="مقاطع قصيرة"
                    isActive={activeTab === 'shorts'}
                    onClick={() => setActiveTab('shorts')}
                />
                <TabButton
                    icon={<PhotoIcon className="w-5 h-5"/>}
                    label="توليد الوسائط"
                    isActive={activeTab === 'media'}
                    onClick={() => setActiveTab('media')}
                />
            </div>
            <div className="p-6">
                {activeTab === 'promo' && (
                    <PromoPanel
                        promoContent={props.promoContent}
                        onGeneratePromo={props.onGeneratePromo}
                        isLoadingPromo={props.isLoadingPromo}
                    />
                )}
                {activeTab === 'shorts' && (
                    <ShortsPanel
                        shortsScripts={props.shortsScripts}
                        onGenerateShorts={props.onGenerateShorts}
                        isLoadingShorts={props.isLoadingShorts}
                    />
                )}
                {activeTab === 'media' && (
                    <MediaGenerator
                        scenes={props.script.scenes}
                        generatedMedia={props.generatedMedia}
                        onGenerateMedia={props.onGenerateMedia}
                        isLoading={props.isLoadingMedia}
                        progressMessage={props.mediaGenerationProgress}
                    />
                )}
            </div>
        </div>
    );
};

interface TabButtonProps {
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-1 flex items-center justify-center gap-2 p-4 font-semibold transition duration-200 text-sm sm:text-base ${
            isActive
                ? 'bg-gray-700 text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:bg-gray-700/50'
        }`}
    >
        {icon}
        {label}
    </button>
);

export default SidePanel;
