import React, { useContext } from 'react';
import { AppContext } from '../App';
import { useTranslation } from '../hooks/useTranslation';
import { Card } from './common/Card';
import { Button } from './common/Button';

interface CycleTipsHistoryProps {
    onClose: () => void;
}

export const CycleTipsHistory: React.FC<CycleTipsHistoryProps> = ({ onClose }) => {
    const { userData } = useContext(AppContext);
    const { t, language } = useTranslation();

    const tipsHistory = userData?.cycleTipsHistory || {};
    
    const dailyTips: { [day: number]: string } = {};
    for (const key in tipsHistory) {
        if (key.endsWith(`_${language}`)) {
            const dayStr = key.replace(`cycleTip_d`, '').replace(`_${language}`, '');
            const day = parseInt(dayStr, 10);
            if (!isNaN(day)) {
                dailyTips[day] = tipsHistory[key];
            }
        }
    }
    const days = Object.keys(dailyTips).map(Number).sort((a, b) => a - b);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-white p-6 border-b z-10">
                    <h3 className="text-xl font-bold text-teal-600">{t('viewTipHistory')}</h3>
                </div>
                <div className="p-6 space-y-4">
                    {days.length === 0 ? (
                        <p className="text-gray-500 text-center">{t('noSavedTips')}</p>
                    ) : (
                        days.map(day => (
                            <Card key={day} className="p-4 bg-gray-50">
                                <h4 className="font-semibold text-gray-800 mb-2">{t('dailyCheckIn.dayOfCycle', { day: day })}</h4>
                                <p className="text-sm text-gray-600 italic">"{dailyTips[day]}"</p>
                            </Card>
                        ))
                    )}
                </div>
                 <div className="sticky bottom-0 bg-white p-6 border-t">
                    <Button onClick={onClose} className="w-full">{t('close')}</Button>
                </div>
            </div>
        </div>
    );
};
