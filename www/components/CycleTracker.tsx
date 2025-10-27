import React, { useContext, useState } from 'react';
import { DailyCheckIn } from './DailyCheckIn';
import { SymptomLogger } from './SymptomLogger';
import { CalendarView } from './CalendarView';
import { PregnancyModeSwitch } from './PregnancyModeSwitch';
import { CycleInsights } from './CycleInsights';
import { ResourceCenter } from './ResourceCenter';
import { useCycleData } from '../hooks/useCycleData';
import { AppContext } from '../App';
import { DailyTip } from './DailyTip';
import { AnalyzeDayModal } from './AnalyzeDayModal';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { useTranslation } from '../hooks/useTranslation';
import { CycleTipsHistory } from './CycleTipsHistory';
import { RewardedAdModal } from './RewardedAdModal';
import { BannerAd } from './common/BannerAd';

export const CycleTracker: React.FC = () => {
    const cycleInfo = useCycleData();
    const { userData } = useContext(AppContext);
    const { t } = useTranslation();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isViewingHistory, setIsViewingHistory] = useState(false);
    const [showRewardedAd, setShowRewardedAd] = useState(false);
    const [analysisUnlocked, setAnalysisUnlocked] = useState(() => sessionStorage.getItem('analysisUnlocked') === 'true');

    const today = new Date().toISOString().split('T')[0];
    const symptomKeys = userData?.symptoms[today] || [];

    const handleAnalyzeDayClick = () => {
        if (analysisUnlocked) {
            setIsAnalyzing(true);
        } else {
            setShowRewardedAd(true);
        }
    };


    return (
        <div className="space-y-6">
            <DailyCheckIn />
            <SymptomLogger />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DailyTip mode="cycle" cycleInfo={cycleInfo} />
                <Card className="p-4 flex flex-col justify-center items-center gap-2">
                    <Button onClick={() => setIsViewingHistory(true)} size="sm" className="w-full">{t('viewTipHistory')}</Button>
                    <Button onClick={handleAnalyzeDayClick} size="sm" className="w-full">{t('analyzeMyDay')}</Button>
                </Card>
            </div>

            <CycleInsights />
            <CalendarView />
            <ResourceCenter 
                mode="cycle" 
                cycleInfo={cycleInfo} 
                symptomKeys={symptomKeys} 
            />
            <PregnancyModeSwitch />
            <BannerAd />
            
            {isAnalyzing && <AnalyzeDayModal mode="cycle" cycleInfo={cycleInfo} onClose={() => setIsAnalyzing(false)} />}
            {isViewingHistory && <CycleTipsHistory onClose={() => setIsViewingHistory(false)} />}
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
