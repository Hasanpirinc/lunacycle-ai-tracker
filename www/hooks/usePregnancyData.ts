


import { useContext, useMemo } from 'react';
import { AppContext } from '../App';
import type { PregnancyInfo, UserData } from '../types';
import { calculatePregnancyMetrics } from '../utils/helpers';

export type PregnancyInfoWithUserData = PregnancyInfo & { userData: UserData };

export const usePregnancyData = (): PregnancyInfoWithUserData | null => {
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