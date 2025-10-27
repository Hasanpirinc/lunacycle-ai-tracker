import { useContext } from 'react';
import { AppContext } from '../App.js';
import { differenceInDays } from '../utils/helpers.js';

export const useCycleManagement = () => {
    const { userData, setUserData } = useContext(AppContext);

    const logPeriodStart = () => {
        if (!userData || !setUserData) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const newCycle = {
            startDate: today,
            length: userData.avgCycleLength, 
        };
        
        const updatedCycles = [...userData.cycles];

        if (updatedCycles.length > 0) {
            const lastCycleIndex = updatedCycles.length - 1;
            const lastCycle = updatedCycles[lastCycleIndex];
            const lastCycleLength = differenceInDays(today, lastCycle.startDate);
            updatedCycles[lastCycleIndex] = { ...lastCycle, length: Math.max(1, lastCycleLength) };
        }
        
        updatedCycles.push(newCycle);

        setUserData({
            ...userData,
            lastPeriodDate: today,
            cycles: updatedCycles,
        });
    };

    const logPeriodEnd = (endDate) => {
        if (!userData || !setUserData || userData.cycles.length === 0) return;
        
        endDate.setHours(0, 0, 0, 0);

        const updatedCycles = [...userData.cycles];
        const currentCycleIndex = updatedCycles.length - 1;
        const currentCycle = updatedCycles[currentCycleIndex];

        if (endDate < currentCycle.startDate) return;

        const periodLength = differenceInDays(endDate, currentCycle.startDate) + 1;

        const updatedCurrentCycle = {
            ...currentCycle,
            actualPeriodLength: Math.max(1, periodLength),
        };
        
        updatedCycles[currentCycleIndex] = updatedCurrentCycle;

        setUserData({
            ...userData,
            cycles: updatedCycles,
        });
    };

    return { logPeriodStart, logPeriodEnd };
};