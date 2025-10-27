import React from 'react';
import type { PregnancyJourney } from '../types';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { calculatePregnancyMetrics } from '../utils/helpers';
import { useTranslation } from '../hooks/useTranslation';

interface PregnancyJourneyDetailProps {
    journey: PregnancyJourney;
    onBack: () => void;
}

interface DayLog {
    date: Date;
    symptoms: string[];
    week: number;
    babySizeKey: string;
}

export const PregnancyJourneyDetail: React.FC<PregnancyJourneyDetailProps> = ({ journey, onBack }) => {
    const { t, language } = useTranslation();

    // Group symptoms by week
    const groupedByWeek = Object.keys(journey.symptoms)
        .sort() // Sort dates chronologically
        .reduce<Record<number, DayLog[]>>((acc, dateStr) => {
            const date = new Date(dateStr);
            const symptoms = journey.symptoms[dateStr];
            if (!symptoms || symptoms.length === 0) return acc; // Skip days with no symptoms

            // JS Date ctor from 'YYYY-MM-DD' is UTC. Add timezone offset to avoid being a day behind.
            const timezoneOffset = date.getTimezoneOffset() * 60000;
            const localDate = new Date(date.getTime() + timezoneOffset);

            const metrics = calculatePregnancyMetrics(journey.startDate, localDate, language);
            const week = metrics.currentWeek;

            if (!acc[week]) {
                acc[week] = [];
            }

            acc[week].push({
                date: localDate,
                symptoms,
                week,
                babySizeKey: metrics.babySizeKey,
            });

            return acc;
        }, {});

    const weeks = Object.keys(groupedByWeek).map(Number).sort((a,b) => a - b);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-pink-600">{journey.name}</h2>
                <Button size="sm" onClick={onBack}>{t('backToJourneys')}</Button>
            </div>

            {weeks.length === 0 && (
                <Card className="p-6 text-center bg-white">
                    <p className="text-gray-600">{t('noSymptomsLoggedJourney')}</p>
                </Card>
            )}

            {weeks.map(week => (
                <Card key={week} className="p-4 md:p-6 bg-white">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">
                        {t('weekLabel', { week })}
                        <span className="ml-4 text-base font-normal text-gray-600">
                           {t('babySizeLabel', { size: t(`babySizes.${groupedByWeek[week][0].babySizeKey}`) })}
                        </span>
                    </h3>
                    <ul className="divide-y divide-gray-200">
                        {groupedByWeek[week].map(log => (
                            <li key={log.date.toISOString()} className="py-3">
                                <p className="font-semibold text-gray-700">
                                    {log.date.toLocaleDateString(language, { weekday: 'long', month: 'long', day: 'numeric' })}
                                </p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {log.symptoms.map(symptomOrKey => (
                                        <div key={symptomOrKey} className="px-3 py-1 text-xs font-medium rounded-full bg-pink-100 text-pink-800">
                                            {t(symptomOrKey)}
                                        </div>
                                    ))}
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>
            ))}
        </div>
    );
};