import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import type { PregnancyJourney } from '../types';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { PregnancyJourneyDetail } from './PregnancyJourneyDetail';
import { useTranslation } from '../hooks/useTranslation';

export const MyPregnanciesScreen: React.FC = () => {
    const { userData, setCurrentView } = useContext(AppContext);
    const [selectedJourney, setSelectedJourney] = useState<PregnancyJourney | null>(null);
    const { t, language } = useTranslation();

    const journeys = userData?.completedPregnancies || [];

    if (selectedJourney) {
        return <PregnancyJourneyDetail journey={selectedJourney} onBack={() => setSelectedJourney(null)} />
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">{t('myPregnancies')}</h2>
                <Button size="sm" onClick={() => setCurrentView(userData?.isPregnant ? 'pregnancy_tracker' : 'cycle_tracker')}>{t('backToTracker')}</Button>
            </div>
            {journeys.length === 0 ? (
                <Card className="p-6 text-center bg-white">
                    <p className="text-gray-600">{t('noSavedJourneys')}</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {journeys.map((journey, index) => (
                        <Card key={index} className="p-4 md:p-6 bg-white hover:shadow-lg transition-shadow">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-pink-600">{journey.name}</h3>
                                    <p className="text-sm text-gray-600">
                                        {journey.startDate.toLocaleDateString(language)} - {journey.endDate.toLocaleDateString(language)}
                                    </p>
                                </div>
                                <Button size="sm" onClick={() => setSelectedJourney(journey)} className="bg-pink-500 hover:bg-pink-600">
                                    {t('viewDetails')}
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
