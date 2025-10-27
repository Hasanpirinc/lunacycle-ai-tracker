import React, { useState, useContext } from 'react';
import { AppContext } from '../App.js';
import { Card } from './common/Card.js';
import { Button } from './common/Button.js';
import { useTranslation } from '../hooks/useTranslation.js';
import { useAudio } from '../hooks/useAudio.js';

export const PregnancyModeSwitch: React.FC = () => {
    const { confirmPregnancy } = useContext(AppContext);
    const [isConfirming, setIsConfirming] = useState(false);
    const { t } = useTranslation();
    const { playSound } = useAudio();

    const handleConfirm = () => {
        playSound('confirm');
        confirmPregnancy();
        setIsConfirming(false);
    };

    const handleOpenConfirm = () => {
        playSound('switch');
        setIsConfirming(true);
    }
    
    const handleCancel = () => {
        playSound('cancel');
        setIsConfirming(false);
    }

    if (isConfirming) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={handleCancel}>
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center" onClick={(e) => e.stopPropagation()}>
                    <h3 className="text-lg font-medium text-gray-900">{t('confirmSwitchToPregnancy')}</h3>
                    <p className="mt-2 text-sm text-gray-500">
                        {t('confirmSwitchDescription')}
                    </p>
                    <div className="mt-6 flex justify-center gap-4">
                        <Button onClick={handleCancel} className="bg-red-700 hover:bg-red-800">{t('cancel')}</Button>
                        <Button onClick={handleConfirm} className="bg-pink-500 hover:bg-pink-600">{t('confirm')}</Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <Card className="p-4 md:p-6 bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                     <h3 className="text-lg font-semibold text-gray-800">{t('expectingLittleOne')}</h3>
                     <p className="text-sm text-gray-600 mt-1">{t('switchToPregnancyTracker')}</p>
                </div>
                <Button onClick={handleOpenConfirm} className="bg-pink-500 hover:bg-pink-600 whitespace-nowrap">
                    {t('switchToPregnancyMode')}
                </Button>
            </div>
        </Card>
    )
}