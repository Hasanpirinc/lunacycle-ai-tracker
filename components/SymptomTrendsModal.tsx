import React, { useContext } from 'react';
import { AppContext } from '../App';
import { Button } from './common/Button';
import { useTranslation } from '../hooks/useTranslation';
import { analyzeSymptomTrends } from '../utils/helpers';

interface SymptomTrendsModalProps {
    onClose: () => void;
}

export const SymptomTrendsModal: React.FC<SymptomTrendsModalProps> = ({ onClose }) => {
    const { userData } = useContext(AppContext);
    const { t } = useTranslation();

    const trendData = userData ? analyzeSymptomTrends(userData.cycles, userData.symptoms, 3) : [];
    const maxCount = trendData.length > 0 ? trendData[0].count : 0;

    const renderContent = () => {
        if (trendData.length === 0) {
            return (
                <div className="text-center p-8">
                    <p className="text-gray-600">{t('symptomTrends.noData')}</p>
                </div>
            );
        }

        return (
            <div className="p-6 space-y-4">
                <p className="text-sm text-gray-500">{t('symptomTrends.description', { count: 3 })}</p>
                <div className="space-y-3">
                    {trendData.map(({ symptomKey, count }) => {
                        const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
                        return (
                            <div key={symptomKey} className="grid grid-cols-3 gap-2 items-center">
                                <span className="text-sm font-medium truncate pr-2 col-span-1" title={t(symptomKey)}>
                                    {t(symptomKey)}
                                </span>
                                <div className="col-span-2 flex items-center gap-2">
                                    <div className="w-full bg-gray-200 rounded-full h-4">
                                        <div 
                                            className="bg-pink-400 h-4 rounded-full" 
                                            style={{ width: `${barWidth}%`, transition: 'width 0.5s ease-in-out' }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-bold text-gray-600 w-8 text-right">{count}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-white p-6 border-b z-10">
                    <h3 className="text-xl font-bold text-pink-600">{t('symptomTrends.title')}</h3>
                </div>
                {renderContent()}
                <div className="sticky bottom-0 bg-white p-6 border-t">
                    <Button onClick={onClose} className="w-full">{t('close')}</Button>
                </div>
            </div>
        </div>
    );
};