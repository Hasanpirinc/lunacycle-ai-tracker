import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface AdContent {
    title: string;
    description: string;
    cta: string;
}

const adsData = [
    { 
        id: 'ad1', 
        imageUrl: "https://storage.googleapis.com/aida-images/ceb0024f-a7e0-49b0-9a3b-9a8d38b29b3c.png"
    },
    { 
        id: 'ad2',
        imageUrl: "https://storage.googleapis.com/aida-images/5201b504-f252-4573-9970-076a5957384a.png"
    },
    { 
        id: 'ad3',
        imageUrl: "https://storage.googleapis.com/aida-images/92255e16-2d64-46b7-8252-0820fed50942.png"
    },
];

export const BannerAd: React.FC = () => {
    const { t } = useTranslation();
    const [currentAdIndex, setCurrentAdIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentAdIndex(prevIndex => (prevIndex + 1) % adsData.length);
        }, 10000); // Change ad every 10 seconds
        return () => clearInterval(timer);
    }, []);

    const currentAd = adsData[currentAdIndex];
    const adContent = t(currentAd.id, { returnObjects: true }) as unknown as AdContent;

    if (!adContent || typeof adContent !== 'object') {
        // Fallback or render nothing if the translation isn't an object
        return null;
    }

    return (
        <div className="flex items-center justify-between gap-4 rounded-xl bg-[#FDF7F8] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <div className="flex-grow flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <p className="text-[#A9898E] text-xs font-normal leading-normal">{t('adLabel')}</p>
                    <p className="text-[#4B3B3F] text-lg font-bold leading-tight">{adContent.title}</p>
                    <p className="text-[#7D6B70] text-sm font-normal leading-normal">{adContent.description}</p>
                </div>
                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-pink-500 text-white text-sm font-medium leading-normal w-fit shadow-sm hover:bg-pink-600 transition-colors">
                    <span className="truncate">{adContent.cta}</span>
                </button>
            </div>
            <div className="flex-shrink-0 w-32 h-32 md:w-36 md:h-36">
                <div className="w-full h-full bg-center bg-no-repeat bg-cover rounded-lg" style={{backgroundImage: `url("${currentAd.imageUrl}")`}}></div>
            </div>
        </div>
    );
};