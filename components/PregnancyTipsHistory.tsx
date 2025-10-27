

import React, { useContext } from 'react';
import { AppContext } from '../App';
import { useTranslation } from '../hooks/useTranslation';
import { Card } from './common/Card';
import { Button } from './common/Button';

interface PregnancyTipsHistoryProps {
    onClose: () => void;
}

export const PregnancyTipsHistory: React.FC<PregnancyTipsHistoryProps> = ({ onClose }) => {
    const { userData } = useContext(AppContext);
    const { t, language } = useTranslation();

    const tipsHistory = userData?.pregnancyTipsHistory || {};
    
    const weeklyTips: { [week: number]: string } = {};
    for (const key in tipsHistory) {
        if (key.endsWith(`_${language}`)) {
            const weekStr = key.replace(`w`, '').replace(`_${language}`, '');
            const week = parseInt(weekStr, 10);
            if (!isNaN(week)) {
                weeklyTips[week] = tipsHistory[key];
            }
        }
    }
    const weeks = Object.keys(weeklyTips).map(Number).sort((a, b) => a - b);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-white p-6 border-b z-10">
                    <h3 className="text-xl font-bold text-pink-600">{t('viewTipHistory')}</h3>
                </div>
                <div className="p-6 space-y-4">
                    {weeks.length === 0 ? (
                        <p className="text-gray-500 text-center">{t('noSavedJourneys')}</p>
                    ) : (
                        weeks.map(week => (
                            <Card key={week} className="p-4 bg-gray-50">
                                <h4 className="font-semibold text-gray-800 mb-2">{t('weekLabel', { week })}</h4>
                                <p className="text-sm text-gray-600 italic">"{weeklyTips[week]}"</p>
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