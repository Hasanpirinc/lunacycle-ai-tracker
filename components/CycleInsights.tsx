import React, { useState } from 'react';
import { useCycleData } from '../hooks/useCycleData';
import { useTranslation } from '../hooks/useTranslation';
import { Card } from './common/Card';
import { Spinner } from './common/Spinner';
import { CalendarIcon, SparklesIcon, BellIcon, DropletIcon, SunIcon, ChartBarIcon } from './icons';
import { SymptomTrendsModal } from './SymptomTrendsModal';
import { Button } from './common/Button';


export const CycleInsights: React.FC = () => {
    const cycleInfo = useCycleData();
    const { t } = useTranslation();
    const [isTrendsModalOpen, setIsTrendsModalOpen] = useState(false);

    if (!cycleInfo) {
        return (
            <Card className="p-4 md:p-6">
                <div className="flex justify-center">
                    <Spinner />
                </div>
            </Card>
        );
    }

    const { daysUntilPeriod, isFertile, isOvulating, currentPhase } = cycleInfo;

    let insight: { text: string; icon: React.ReactNode };

    if (isOvulating) {
        insight = {
            text: t('insights.ovulating'),
            // Use purple for peak ovulation day to make it stand out
            icon: <SparklesIcon className="w-6 h-6 text-purple-500" />,
        };
    } else if (isFertile) {
        insight = {
            text: t('insights.fertileWindow'),
            // Use SunIcon for fertile window to distinguish from ovulation
            icon: <SunIcon className="w-6 h-6 text-green-500" />,
        };
    } else if (currentPhase === 'Luteal' && daysUntilPeriod <= 3 && daysUntilPeriod >= 0) {
        insight = {
            text: t('insights.pms'),
            // BellIcon for warning/heads-up
            icon: <BellIcon className="w-6 h-6 text-yellow-500" />,
        };
    } else if (daysUntilPeriod > 3 && daysUntilPeriod <= 7) {
        insight = {
            text: t('insights.periodSoon', { count: daysUntilPeriod }),
            icon: <CalendarIcon className="w-6 h-6 text-red-500" />,
        };
    } else if (currentPhase === 'Menstruation') {
        insight = {
            text: t('insights.menstruation'),
            icon: <DropletIcon className="w-6 h-6 text-red-500" />,
        };
    } else {
        insight = {
            text: t('insights.general'),
            // SparklesIcon for general positive insights
            icon: <SparklesIcon className="w-6 h-6 text-pink-500" />,
        };
    }

    return (
        <>
            <Card className="p-4 md:p-6 bg-rose-50">
                <h3 className="text-lg font-semibold mb-3">{t('insights.title')}</h3>
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 pt-1">{insight.icon}</div>
                    <p className="text-sm">{insight.text}</p>
                </div>
                 <div className="mt-4 pt-4 border-t border-pink-200">
                    <Button 
                        size="sm" 
                        onClick={() => setIsTrendsModalOpen(true)} 
                        className="w-full flex items-center justify-center gap-2 bg-pink-500/80 hover:bg-pink-500"
                    >
                        <ChartBarIcon className="w-5 h-5" />
                        {t('symptomTrends.viewTrends')}
                    </Button>
                </div>
            </Card>
            {isTrendsModalOpen && <SymptomTrendsModal onClose={() => setIsTrendsModalOpen(false)} />}
        </>
    );
};