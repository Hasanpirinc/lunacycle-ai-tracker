import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../App';
import { Card } from './common/Card';
import { Spinner } from './common/Spinner';
import { useTranslation } from '../hooks/useTranslation';
import { getDailyPregnancyTip, getDailyCycleTip } from '../services/geminiService';
import type { CycleInfo } from '../types';

interface DailyTipProps {
    mode: 'cycle' | 'pregnancy';
    week?: number;
    cycleInfo?: CycleInfo | null;
}

export const DailyTip: React.FC<DailyTipProps> = ({ mode, week, cycleInfo }) => {
    const { userData, setUserData } = useContext(AppContext);
    const [tip, setTip] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const { t, language } = useTranslation();

    useEffect(() => {
        const fetchTip = async () => {
            setIsLoading(true);
            let newTip: string | null = null;
            let cacheKey: string | null = null;

            if (mode === 'pregnancy' && week && week > 0) {
                cacheKey = `w${week}_${language}`;
                if (userData?.pregnancyTipsHistory?.[cacheKey]) {
                    setTip(userData.pregnancyTipsHistory[cacheKey]);
                    setIsLoading(false);
                    return;
                }
                newTip = await getDailyPregnancyTip(week, language);

            } else if (mode === 'cycle' && cycleInfo) {
                const day = cycleInfo.currentDay;
                cacheKey = `cycleTip_d${day}_${language}`;
                 if (userData?.cycleTipsHistory?.[cacheKey]) {
                    setTip(userData.cycleTipsHistory[cacheKey]);
                    setIsLoading(false);
                    return;
                }
                newTip = await getDailyCycleTip(cycleInfo, language);
            }

            if (newTip) {
                setTip(newTip);

                // Update user data with the new tip
                if (setUserData && userData && cacheKey) {
                    if (mode === 'pregnancy') {
                        const newHistory = { ...userData.pregnancyTipsHistory, [cacheKey]: newTip };
                        setUserData({ ...userData, pregnancyTipsHistory: newHistory });
                    } else {
                        const newHistory = { ...(userData.cycleTipsHistory || {}), [cacheKey]: newTip };
                        setUserData({ ...userData, cycleTipsHistory: newHistory });
                    }
                }
            }
            setIsLoading(false);
        };
        
        // Ensure we have data before fetching
        if ((mode === 'pregnancy' && week) || (mode === 'cycle' && cycleInfo)) {
            fetchTip();
        } else {
            setIsLoading(false);
        }

    }, [mode, week, cycleInfo, language, userData, setUserData]);

    const cardBg = 'bg-rose-50';

    if (isLoading && !tip) {
         return (
            <Card className={`p-4 ${cardBg}`}>
                <h4 className="font-semibold mb-2">{t('todaysTip')}</h4>
                <div className="flex justify-center"><Spinner /></div>
            </Card>
        );
    }
    
    if (!tip) return null; // Don't render if there's no tip and not loading

    return (
        <Card className={`p-4 ${cardBg}`}>
            <h4 className="font-semibold mb-2">{t('todaysTip')}</h4>
            <p className="text-sm italic">"{tip}"</p>
        </Card>
    );
};
