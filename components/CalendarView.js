import React, { useMemo, useState } from 'react';
import { useCycleData } from '../hooks/useCycleData.js';
import { Card } from './common/Card.js';
import { useTranslation } from '../hooks/useTranslation.js';
import { Spinner } from './common/Spinner.js';
import { predictCycleLength, addDays, differenceInDays } from '../utils/helpers.js';
import type { UserData, Cycle } from '../types.js';
import { ChevronLeftIcon, ChevronRightIcon, PencilIcon } from './icons.js';
import { EditCycleModal } from './EditCycleModal.js';
import { Button } from './common/Button.js';

interface DayInfo {
    isPeriod: boolean;
    isFertile: boolean;
    isOvulation: boolean;
}

const useCalendarPredictions = () => {
    const cycleData = useCycleData();

    return useMemo(() => {
        if (!cycleData?.userData || cycleData.userData.cycles.length === 0) return new Map<string, DayInfo>();

        const { userData } = cycleData;
        const predictions = new Map<string, DayInfo>();
        
        const completedCycles = userData.cycles.slice(0, -1);
        const predictedCycleLength = predictCycleLength(completedCycles, userData.avgCycleLength);
        
        const addCycleToPredictions = (startDate: Date, cycleLength: number, periodLength: number) => {
            const LUTEAL_PHASE_LENGTH = 14;
            const ovulationDay = Math.max(7, cycleLength - LUTEAL_PHASE_LENGTH);
            const fertileWindowStart = ovulationDay - 5;
            const fertileWindowEnd = ovulationDay;
            
            for (let i = 0; i < cycleLength; i++) {
                const date = addDays(startDate, i);
                const dateStr = date.toISOString().split('T')[0];
                const dayOfCycle = i + 1;
                
                const isPeriod = dayOfCycle <= periodLength;
                const isFertile = dayOfCycle >= fertileWindowStart && dayOfCycle <= fertileWindowEnd;
                const isOvulation = dayOfCycle === ovulationDay;
                
                // Avoid overwriting historical data with future predictions
                if (!predictions.has(dateStr)) {
                    predictions.set(dateStr, { isPeriod, isFertile, isOvulation });
                }
            }
        };

        // 1. Add historical cycles with their actual data
        userData.cycles.forEach((cycle, index) => {
            const isCurrentCycle = index === userData.cycles.length - 1;
            const cycleLen = isCurrentCycle ? predictedCycleLength : cycle.length;
            const periodLen = cycle.actualPeriodLength || userData.avgPeriodLength;
            addCycleToPredictions(cycle.startDate, cycleLen, periodLen);
        });

        // 2. Predict future cycles
        const lastCycle = userData.cycles[userData.cycles.length - 1];
        const lastCycleLen = predictedCycleLength; // Predict from avg
        let lastKnownCycleStart = lastCycle.startDate;
        
        for (let i = 0; i < 12; i++) { // Predict 12 months into the future
             const nextCycleStart = addDays(lastKnownCycleStart, lastCycleLen);
             addCycleToPredictions(nextCycleStart, predictedCycleLength, userData.avgPeriodLength);
             lastKnownCycleStart = nextCycleStart;
        }
        
        // 3. Predict past cycles
        let firstCycleStart = new Date(userData.cycles[0].startDate);

        for (let i = 0; i < 12; i++) { // Predict 12 months into the past
            const prevCycleStart = addDays(firstCycleStart, -predictedCycleLength);
            addCycleToPredictions(prevCycleStart, predictedCycleLength, userData.avgPeriodLength);
            firstCycleStart = prevCycleStart;
        }

        return predictions;

    }, [cycleData?.userData]);
};


const MonthlyCalendar: React.FC = () => {
    const cycleData = useCycleData();
    const { t, language } = useTranslation();
    const [displayDate, setDisplayDate] = useState(new Date());
    const predictions = useCalendarPredictions();

    const { year, month, firstDayOfWeek } = useMemo(() => {
        const year = displayDate.getFullYear();
        const month = displayDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        
        return {
            year,
            month,
            firstDayOfWeek: firstDayOfMonth.getDay(), // 0 for Sunday
        };
    }, [displayDate]);

    const { calendarDays, monthName } = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysOfMonth = Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const date = new Date(year, month, day);
            const dateStr = date.toISOString().split('T')[0];
            
            const dayPredictions = predictions.get(dateStr) || { isPeriod: false, isFertile: false, isOvulation: false };

            return {
                date,
                day,
                isToday: date.toDateString() === today.toDateString(),
                hasSymptoms: !!cycleData?.userData?.symptoms[dateStr]?.length,
                ...dayPredictions,
            };
        });

        const leadingEmptyDays = Array.from({ length: firstDayOfWeek }, () => null);
        const fullCalendarDays = [...leadingEmptyDays, ...daysOfMonth];
        const monthFormatter = new Intl.DateTimeFormat(language, { month: 'long', year: 'numeric' });
        
        return {
            calendarDays: fullCalendarDays,
            monthName: monthFormatter.format(displayDate),
        };
    }, [year, month, firstDayOfWeek, cycleData, language, displayDate, predictions]);


    const weekDays = useMemo(() => {
        const formatter = new Intl.DateTimeFormat(language, { weekday: 'short' });
        return Array.from({ length: 7 }, (_, i) => {
            // Start from a known Sunday (e.g., 2024-01-07) and add i days.
            const day = new Date(2024, 0, 7 + i);
            return formatter.format(day);
        });
    }, [language]);


    if (!cycleData) {
        return <div className="flex justify-center items-center h-64"><Spinner large /></div>;
    }

    const changeMonth = (delta: number) => {
        setDisplayDate(current => {
            const newDate = new Date(current);
            newDate.setDate(1); // Avoid issues with different month lengths
            newDate.setMonth(newDate.getMonth() + delta);
            return newDate;
        });
    };

    return (
        <div className="max-w-md mx-auto">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100" aria-label={t('previousMonth')}>
                    <ChevronLeftIcon />
                </button>
                <h4 className="text-lg font-semibold text-gray-800">{monthName}</h4>
                 <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100" aria-label={t('nextMonth')}>
                    <ChevronRightIcon />
                </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-600 mb-2">
                {weekDays.map(day => <div key={day}>{day.slice(0,2)}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                    if (!day) return <div key={`empty-${index}`} />;

                    const { date, day: dayNum, isToday, hasSymptoms, isPeriod, isFertile, isOvulation } = day;
                    
                    let bgClass = 'bg-transparent';
                    if (isPeriod) bgClass = 'bg-rose-100';
                    else if (isFertile) bgClass = 'bg-blue-100';

                    if (isOvulation) bgClass = 'bg-purple-200';
                    
                    const textClass = isToday ? 'text-white' : 'text-gray-700';
                    const borderClass = isToday ? 'border-2 border-teal-500' : 'border-2 border-transparent';
                    
                    return (
                        <div key={date.toISOString()} className={`relative aspect-square flex items-center justify-center rounded-lg transition-colors ${bgClass}`}>
                            {isToday && <div className="absolute inset-0 bg-teal-500 rounded-lg z-0"></div>}
                            <span className={`relative z-10 font-medium ${textClass}`}>{dayNum}</span>
                            {hasSymptoms && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-teal-600 rounded-full z-10"></div>}
                        </div>
                    );
                })}
            </div>
             {/* Legend */}
            <div className="mt-6 flex flex-wrap justify-center items-center gap-x-4 gap-y-2">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-100 border border-rose-200"></div>
                    <span className="text-xs text-gray-600">{t('legend.period')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-200"></div>
                    <span className="text-xs text-gray-600">{t('legend.fertile')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-200 border border-purple-300"></div>
                    <span className="text-xs text-gray-600">{t('legend.ovulation')}</span>
                </div>
            </div>
        </div>
    );
};


export const CalendarView: React.FC = () => {
    const { t } = useTranslation();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    return (
        <>
            <Card className="p-4 md:p-6 bg-white">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">{t('yourCycle')}</h3>
                    <Button 
                        size="sm" 
                        onClick={() => setIsEditModalOpen(true)}
                        className="flex items-center gap-2 bg-gray-100 !text-gray-700 hover:bg-gray-200 shadow-none"
                    >
                        <PencilIcon className="w-4 h-4" />
                        <span>{t('editCycle')}</span>
                    </Button>
                </div>
                <MonthlyCalendar />
            </Card>
            {isEditModalOpen && <EditCycleModal onClose={() => setIsEditModalOpen(false)} />}
        </>
    );
};