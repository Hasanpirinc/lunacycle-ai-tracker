import { useContext, useMemo } from 'react';
import { AppContext } from '../App.js';
import { calculatePregnancyMetrics } from '../utils/helpers.js';

export const usePregnancyData = () => {
  const { userData, language } = useContext(AppContext);

  return useMemo(() => {
    if (!userData || !userData.isPregnant || !userData.lastPeriodDate) {
      return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const metrics = calculatePregnancyMetrics(userData.lastPeriodDate, today, language, userData.pregnancyDueDate);

    return {
      ...metrics,
      userData,
    };
  }, [userData, language]);
};
