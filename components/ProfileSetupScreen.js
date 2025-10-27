import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation.js';
import { Button } from './common/Button.js';
import { Spinner } from './common/Spinner.js';
import { formatDateForInput } from '../utils/helpers.js';
import type { UserData } from '../types.js';

interface ProfileSetupScreenProps {
    onComplete: (userData: UserData) => void;
}

const formInputClasses = "w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors duration-200 bg-white text-slate-900 border-slate-300";

export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({ onComplete }) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [lastPeriod, setLastPeriod] = useState(formatDateForInput(new Date()));
    const [prevPeriod1, setPrevPeriod1] = useState('');
    const [prevPeriod2, setPrevPeriod2] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = () => {
        if (!name || !lastPeriod) {
            setError(t('profileSetup.errorRequired'));
            return;
        }
        setError('');
        setIsLoading(true);

        const dateStrings = [lastPeriod, prevPeriod1, prevPeriod2].filter(Boolean);
        const dates = dateStrings.map(d => new Date(`${d}T12:00:00`)).sort((a, b) => b.getTime() - a.getTime());

        const cycles = [];
        let totalCycleLength = 0;
        for (let i = 0; i < dates.length; i++) {
            if (i + 1 < dates.length) {
                const cycleLength = Math.round((dates[i].getTime() - dates[i+1].getTime()) / (1000 * 60 * 60 * 24));
                cycles.push({ startDate: dates[i+1], length: cycleLength });
                totalCycleLength += cycleLength;
            }
        }
        cycles.push({ startDate: dates[0], length: 28 }); // Current cycle

        const avgCycleLength = cycles.length > 1 ? Math.round(totalCycleLength / (cycles.length - 1)) : 28;

        const initialUserData: UserData = {
            name,
            dateOfBirth: dob ? new Date(`${dob}T12:00:00`) : undefined,
            avgCycleLength: avgCycleLength,
            avgPeriodLength: 5,
            lastPeriodDate: dates[0],
            cycles: cycles.reverse(), // oldest first
            symptoms: {},
            isPregnant: false,
            reminders: [
                { id: 'symptom_log', time: '20:00', enabled: false },
                { id: 'medication', time: '09:00', enabled: false },
            ]
        };

        setTimeout(() => {
            onComplete(initialUserData);
        }, 500);
    };

    return (
        <div className="flex min-h-screen flex-col justify-center bg-rose-50 py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h1 className="text-center font-['Lora',_serif] text-4xl font-bold text-pink-600">LunaCycle</h1>
                <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">{t('profileSetup.title')}</h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white px-6 py-12 shadow-xl sm:rounded-lg sm:px-12">
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">{t('name')}</label>
                            <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required className={formInputClasses} />
                        </div>
                        <div>
                            <label htmlFor="dob" className="block text-sm font-medium leading-6 text-gray-900">{t('dateOfBirth')}</label>
                            <input id="dob" type="date" value={dob} onChange={e => setDob(e.target.value)} className={formInputClasses} />
                        </div>
                         <div>
                            <label htmlFor="lastPeriod" className="block text-sm font-medium leading-6 text-gray-900">{t('profileSetup.lastPeriodLabel')}</label>
                            <input id="lastPeriod" type="date" value={lastPeriod} onChange={e => setLastPeriod(e.target.value)} required className={formInputClasses} max={formatDateForInput(new Date())}/>
                        </div>

                        <details className="group">
                            <summary className="cursor-pointer text-sm font-medium text-teal-600 hover:underline">{t('profileSetup.optionalTitle')}</summary>
                             <div className="mt-4 space-y-4 border-l-2 border-teal-200 pl-4">
                                <p className="text-xs text-gray-500">{t('profileSetup.optionalSubtitle')}</p>
                                <div>
                                    <label htmlFor="prevPeriod1" className="block text-sm font-medium leading-6 text-gray-900">{t('profileSetup.prevPeriod1Label')}</label>
                                    <input id="prevPeriod1" type="date" value={prevPeriod1} onChange={e => setPrevPeriod1(e.target.value)} className={formInputClasses} max={formatDateForInput(new Date())}/>
                                </div>
                                <div>
                                    <label htmlFor="prevPeriod2" className="block text-sm font-medium leading-6 text-gray-900">{t('profileSetup.prevPeriod2Label')}</label>
                                    <input id="prevPeriod2" type="date" value={prevPeriod2} onChange={e => setPrevPeriod2(e.target.value)} className={formInputClasses} max={formatDateForInput(new Date())}/>
                                </div>
                            </div>
                        </details>
                        
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        
                        <div>
                            <Button onClick={handleSubmit} disabled={isLoading} className="flex w-full justify-center">
                                {isLoading ? <Spinner /> : t('continue')}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};