// Fix: Implement the full content for PregnancyTracker.tsx to resolve module errors.
import React, { useState, useContext } from 'react';
import { usePregnancyData } from '../hooks/usePregnancyData';
import { Card } from './common/Card';
import { Spinner } from './common/Spinner';
import { Button } from './common/Button';
import { AppContext } from '../App';
import { useTranslation } from '../hooks/useTranslation';
import { generateBabySizeImage } from '../services/geminiService';
import { AnalyzeDayModal } from './AnalyzeDayModal';
import { PregnancySymptomLogger } from './PregnancySymptomLogger';
import { ResourceCenter } from './ResourceCenter';
import { SetDueDateModal } from './SetDueDateModal';
import { PregnancyTipsHistory } from './PregnancyTipsHistory';
import { DailyTip } from './DailyTip';
import { RewardedAdModal } from './RewardedAdModal';
import { BannerAd } from './common/BannerAd';
import { ExitPregnancyModeModal } from './ExitPregnancyModeModal';

const BabySizeVisual: React.FC<{ babySizeKey: string; babyLength: number; babyWeight: number; week: number; }> = ({ babySizeKey, babyLength, babyWeight, week }) => {
    const { t, language } = useTranslation();
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        const fetchImage = async () => {
            setIsLoading(true);
            const objectName = t(`babySizes.${babySizeKey}`);
            // The caching is now handled inside geminiService, so we can simplify this.
            const url = await generateBabySizeImage(objectName, language);
            
            if (url) {
                setImageUrl(url);
            }
            setIsLoading(false);
        };
        
        // Ensure week is valid before fetching
        if (week && babySizeKey) {
            fetchImage();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [babySizeKey, language, t, week]);


    const sizeText = t(`babySizes.${babySizeKey}`);

    return (
        <div className="text-center">
            <div className="relative w-48 h-48 mx-auto bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                {isLoading ? <Spinner /> : 
                    imageUrl ? <img src={imageUrl} alt={sizeText} className="w-full h-full object-contain" /> : <p className="text-xs text-gray-500">{t('imageNotAvailable')}</p>
                }
            </div>
            <p className="mt-4 text-lg font-semibold text-gray-800">{t('babyIsSizeOf', { size: sizeText })}</p>
            <p className="text-sm text-gray-500">
                {t('approximateLength')}: {babyLength} cm | {t('approximateWeight')}: {babyWeight} g
            </p>
        </div>
    );
};

export const PregnancyTracker: React.FC = () => {
    const pregnancyInfo = usePregnancyData();
    const { userData } = useContext(AppContext);
    const { t } = useTranslation();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSettingDueDate, setIsSettingDueDate] = useState(false);
    const [isViewingHistory, setIsViewingHistory] = useState(false);
    const [isExitModalOpen, setIsExitModalOpen] = useState(false);
    const [showRewardedAd, setShowRewardedAd] = useState(false);
    const [analysisUnlocked, setAnalysisUnlocked] = useState(() => sessionStorage.getItem('analysisUnlocked') === 'true');
    
    const today = new Date().toISOString().split('T')[0];
    const symptomKeys = userData?.pregnancySymptoms?.[today] || [];

    const handleAnalyzeDayClick = () => {
        if (analysisUnlocked) {
            setIsAnalyzing(true);
        } else {
            setShowRewardedAd(true);
        }
    };

    if (!pregnancyInfo) {
        return <div className="flex justify-center items-center h-64"><Spinner large /></div>;
    }

    const { currentWeek, dayOfWeek, trimester, daysRemaining, babySizeKey, babyLength, babyWeight, developmentalMilestone } = pregnancyInfo;

    return (
        <div className="space-y-6">
            <Card className="p-4 md:p-6 bg-white">
                 <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-pink-600">{t('weekLabel', { week: currentWeek })}, {t('dayLabel', { day: dayOfWeek })}</h2>
                    <p className="text-gray-600">{t('trimesterLabel', { trimester: trimester })} | {t('daysRemaining', { count: daysRemaining })}</p>
                    <Button size="sm" onClick={() => setIsSettingDueDate(true)} className="mt-2 bg-pink-400 hover:bg-pink-500">{t('editPregnancyDates')}</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <BabySizeVisual week={currentWeek} babySizeKey={babySizeKey} babyLength={babyLength} babyWeight={babyWeight} />
                    <Card className="p-4 bg-rose-50 h-full flex flex-col justify-center">
                        <h4 className="font-semibold text-gray-800 mb-2">{t('developmentalMilestone')}</h4>
                        <p className="text-sm text-gray-700">{developmentalMilestone}</p>
                    </Card>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DailyTip mode="pregnancy" week={currentWeek} />
                 <Card className="p-4 flex flex-col justify-center items-center gap-2">
                    <Button onClick={() => setIsViewingHistory(true)} size="sm" className="w-full">{t('viewTipHistory')}</Button>
                    <Button onClick={handleAnalyzeDayClick} size="sm" className="w-full">{t('analyzeMyDay')}</Button>
                 </Card>
            </div>
            
            <PregnancySymptomLogger />
            <ResourceCenter 
                mode="pregnancy" 
                pregnancyInfo={pregnancyInfo} 
                symptomKeys={symptomKeys} 
            />
            <BannerAd />

            <div className="pt-6 mt-6 border-t border-gray-200 text-center">
                <Button
                    onClick={() => setIsExitModalOpen(true)}
                    className="bg-gray-500 hover:bg-gray-600"
                >
                    {t('exitPregnancyMode')}
                </Button>
            </div>

            {isAnalyzing && <AnalyzeDayModal mode="pregnancy" pregnancyInfo={pregnancyInfo} onClose={() => setIsAnalyzing(false)} />}
            {isSettingDueDate && <SetDueDateModal onClose={() => setIsSettingDueDate(false)} />}
            {isViewingHistory && <PregnancyTipsHistory onClose={() => setIsViewingHistory(false)} />}
            {isExitModalOpen && <ExitPregnancyModeModal onClose={() => setIsExitModalOpen(false)} />}
            {showRewardedAd && (
                <RewardedAdModal
                    featureName={t('dailyAnalysis')}
                    onClose={(rewarded) => {
                        setShowRewardedAd(false);
                        if (rewarded) {
                            sessionStorage.setItem('analysisUnlocked', 'true');
                            setAnalysisUnlocked(true);
                            setTimeout(() => setIsAnalyzing(true), 200);
                        }
                    }}
                />
            )}
        </div>
    );
};
