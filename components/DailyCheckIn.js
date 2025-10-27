import React, { useState, useContext } from 'react';
import { useCycleData } from '../hooks/useCycleData.js';
import { useCycleManagement } from '../hooks/useCycleManagement.js';
import { Card } from './common/Card.js';
import { Button } from './common/Button.js';
import { Spinner } from './common/Spinner.js';
import { useTranslation } from '../hooks/useTranslation.js';
import { useAudio } from '../hooks/useAudio.js';
import { LogPeriodEndModal } from './LogPeriodEndModal.js';

export const DailyCheckIn: React.FC = () => {
    const cycleInfo = useCycleData();
    const { logPeriodStart } = useCycleManagement();
    const { t } = useTranslation();
    const { playSound } = useAudio();
    const [isLogEndModalOpen, setIsLogEndModalOpen] = useState(false);

    if (!cycleInfo) {
        return (
            <Card className="p-4 md:p-6 bg-white">
                <div className="flex justify-center">
                    <Spinner />
                </div>
            </Card>
        );
    }

    const { currentDay, currentPhase, currentCycle, userData } = cycleInfo;

    const handleLogStart = () => {
        playSound('log');
        logPeriodStart();
    };
    
    const handleOpenLogEnd = () => {
        playSound('switch');
        setIsLogEndModalOpen(true);
    };

    // A period is actively being logged if the user started it but hasn't ended it.
    const isPeriodLoggingActive = !currentCycle.actualPeriodLength;
    
    // A period is considered "over" if it's being logged, but we're well past a reasonable period length (e.g., 10 days).
    // This handles cases where a user forgets to log the end.
    const periodIsLikelyOver = isPeriodLoggingActive && currentDay > 10;

    const showLogEndButton = isPeriodLoggingActive && !periodIsLikelyOver;

    return (
        <>
            <Card className="p-4 md:p-6 bg-white">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl font-bold text-gray-800">
                            {t('dailyCheckIn.dayOfCycle', { day: currentDay })}
                        </h2>
                        <p className="text-md text-gray-600">
                            {t('dailyCheckIn.currentPhase', { phase: t(`phases.${currentPhase}`) })}
                        </p>
                    </div>
                    <div className="flex-shrink-0">
                        {showLogEndButton ? (
                            <Button size="md" onClick={handleOpenLogEnd} className="bg-red-500 hover:bg-red-600">
                                {t('dailyCheckIn.logPeriodEnd')}
                            </Button>
                        ) : (
                            <Button size="md" onClick={handleLogStart}>
                                {t('dailyCheckIn.logPeriodStart')}
                            </Button>
                        )}
                    </div>
                </div>
            </Card>
            {isLogEndModalOpen && <LogPeriodEndModal onClose={() => setIsLogEndModalOpen(false)} />}
        </>
    );
};