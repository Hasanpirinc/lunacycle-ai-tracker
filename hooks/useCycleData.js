import { useContext, useMemo } from 'react';
import { AppContext } from '../App.js';
import { addDays, differenceInDays, predictCycleLength } from '../utils/helpers.js';

export const useCycleData = () => {
  const { userData } = useContext(AppContext);

  return useMemo(() => {
    if (!userData || userData.cycles.length === 0) {
      return null;
    }

    const today = new Date();
    today.setHours(0,0,0,0);
    const currentCycle = userData.cycles[userData.cycles.length - 1];
    
    const currentDay = differenceInDays(today, currentCycle.startDate) + 1;
    
    const completedCycles = userData.cycles.slice(0, -1);
    const predictedCycleLength = predictCycleLength(completedCycles, userData.avgCycleLength);

    const completedPeriods = userData.cycles.filter(c => c.actualPeriodLength);
    const avgPeriodLength = completedPeriods.length > 0
        ? Math.round(completedPeriods.reduce((acc, c) => acc + c.actualPeriodLength, 0) / completedPeriods.length)
        : userData.avgPeriodLength;
    
    const LUTEAL_PHASE_LENGTH = 14;
    const ovulationDay = Math.max(7, predictedCycleLength - LUTEAL_PHASE_LENGTH);

    const fertileWindowStart = ovulationDay - 5;
    const fertileWindowEnd = ovulationDay;

    let currentPhase = 'Follicular';
    const isPeriod = currentDay <= avgPeriodLength;

    if (isPeriod) {
      currentPhase = 'Menstruation';
    } else if (currentDay >= fertileWindowStart && currentDay <= fertileWindowEnd) {
      currentPhase = 'Ovulation';
    } else if (currentDay > fertileWindowEnd) {
      currentPhase = 'Luteal';
    }

    const nextPeriodDate = addDays(currentCycle.startDate, predictedCycleLength);
    const daysUntilPeriod = differenceInDays(nextPeriodDate, today);

    const isFertile = currentDay >= fertileWindowStart && currentDay <= fertileWindowEnd;
    const isOvulating = currentDay === ovulationDay;
    
    return {
      currentDay,
      currentPhase,
      daysUntilPeriod,
      isFertile,
      isOvulating,
      isPeriod,
      nextPeriodDate,
      currentCycle,
      userData,
    };
  }, [userData]);
};
