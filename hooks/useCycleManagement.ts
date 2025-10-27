import { useContext } from 'react';
import { AppContext } from '../App';
import { differenceInDays } from '../utils/helpers';
import type { UserData, Cycle } from '../types';

export const useCycleManagement = () => {
    const { userData, setUserData } = useContext(AppContext);

    const logPeriodStart = () => {
        if (!userData || !setUserData) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const newCycle: Cycle = {
            startDate: today,
            // Use the user's average as the initial prediction for the new cycle's length
            length: userData.avgCycleLength, 
        };
        
        const updatedCycles = [...userData.cycles];

        // If there are existing cycles, update the length of the last one
        if (updatedCycles.length > 0) {
            const lastCycleIndex = updatedCycles.length - 1;
            const lastCycle = updatedCycles[lastCycleIndex];
            const lastCycleLength = differenceInDays(today, lastCycle.startDate);
            // Ensure cycle length is at least 1 day
            updatedCycles[lastCycleIndex] = { ...lastCycle, length: Math.max(1, lastCycleLength) };
        }
        
        // Add the new cycle
        updatedCycles.push(newCycle);

        setUserData({
            ...userData,
            lastPeriodDate: today,
            cycles: updatedCycles,
        });
    };

    const logPeriodEnd = (endDate: Date) => {
        if (!userData || !setUserData || userData.cycles.length === 0) return;
        
        endDate.setHours(0, 0, 0, 0);

        const updatedCycles = [...userData.cycles];
        const currentCycleIndex = updatedCycles.length - 1;
        const currentCycle = updatedCycles[currentCycleIndex];

        // Don't allow ending a period before it started
        if (endDate < currentCycle.startDate) return;

        const periodLength = differenceInDays(endDate, currentCycle.startDate) + 1;

        const updatedCurrentCycle: Cycle = {
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
