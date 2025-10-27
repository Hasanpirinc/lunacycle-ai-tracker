import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface RewardedAdModalProps {
    onClose: (rewarded: boolean) => void;
    featureName: string;
}

type AdState = 'initial' | 'playing' | 'rewarded';

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({ onClose, featureName }) => {
    const { t } = useTranslation();
    const [adState, setAdState] = useState<AdState>('initial');
    const [countdown, setCountdown] = useState(5);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (adState === 'playing') {
            if (countdown > 0) {
                timer = setTimeout(() => {
                    setCountdown(c => c - 1);
                    setProgress(p => p + (100 / 5));
                }, 1000);
            } else {
                setAdState('rewarded');
                setTimeout(() => onClose(true), 1500);
            }
        }
        return () => clearTimeout(timer);
    }, [adState, countdown, onClose]);
    
    const handleWatchAd = () => {
        setAdState('playing');
    };

    const handleClose = () => {
        onClose(false);
    }
    
    if (adState === 'playing') {
        return (
             <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/50 p-4" id="ad-in-progress">
                <div className="flex flex-col gap-4 w-full max-w-xs text-center">
                    <div className="rounded-full bg-white/20">
                        <div className="h-2 rounded-full bg-[#A0C1B8] transition-all duration-1000 linear" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="text-white text-sm font-normal leading-normal">{t('rewardInSeconds', { count: countdown })}</p>
                </div>
            </div>
        )
    }

    if (adState === 'rewarded') {
        return (
            <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4" id="reward-granted">
                <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
                <div className="relative flex flex-col w-full max-w-sm bg-[#FCF8F3] rounded-lg shadow-xl p-6 text-center items-center">
                    <div className="w-20 h-20 bg-[#A0C1B8]/20 rounded-full flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-5xl text-[#A0C1B8]">check_circle</span>
                    </div>
                    <h1 className="text-[#4A4A4A] font-['Lora',_serif] tracking-light text-2xl font-bold leading-tight pb-2">{t('rewardGranted')}</h1>
                    <p className="text-[#4A4A4A]/80 text-base font-normal leading-normal pb-6">{t('featureUnlocked')}</p>
                    <div className="w-full">
                        <button onClick={() => onClose(true)} className="flex min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-5 bg-[#A0C1B8] text-white gap-2 text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#A0C1B8]/90 transition-colors">
                            <span className="truncate">Continue</span>
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4" id="initial-modal">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
            <div className="relative flex flex-col w-full max-w-sm bg-[#FCF8F3] rounded-lg shadow-xl p-6 text-center">
                <button onClick={handleClose} className="absolute top-4 right-4 text-[#4A4A4A]/50">
                    <span className="material-symbols-outlined">close</span>
                </button>
                <div className="mb-4">
                    <span className="material-symbols-outlined text-6xl text-[#D4C4E3]">workspace_premium</span>
                </div>
                <h1 className="text-[#4A4A4A] font-['Lora',_serif] tracking-light text-2xl font-bold leading-tight pb-2">{t('unlockFeature')}</h1>
                <p className="text-[#4A4A4A]/80 text-base font-normal leading-normal pb-6">{t('watchAdToUnlock')}</p>
                <div className="flex flex-col gap-2">
                    <button onClick={handleWatchAd} className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-5 bg-[#A0C1B8] text-white gap-2 text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#A0C1B8]/90 transition-colors">
                        <span className="material-symbols-outlined">play_arrow</span>
                        <span className="truncate">{t('watchAd')}</span>
                    </button>
                    <button onClick={handleClose} className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-transparent text-[#4A4A4A]/70 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-black/5 transition-colors">
                        <span className="truncate">{t('noThanks')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
