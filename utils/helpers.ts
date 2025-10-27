// Fix: Implement the full content for utils/helpers.ts to resolve module errors.
import type { Cycle, PregnancyInfo } from '../types';
import { pregnancyDataByWeek, WeeklyPregnancyData } from '../data/pregnancyData';

/**
 * Adds a specified number of days to a date.
 * @param date The starting date.
 * @param days The number of days to add.
 * @returns A new Date object.
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Calculates the difference in days between two dates, ignoring time.
 * @param date1 The first date.
 * @param date2 The second date.
 * @returns The number of days between the two dates.
 */
export const differenceInDays = (date1: Date, date2: Date): number => {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  const diffTime = d1.getTime() - d2.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Predicts the length of the next cycle based on historical data.
 * @param completedCycles An array of completed cycles.
 * @param defaultLength The user's average cycle length as a fallback.
 * @returns The predicted cycle length in days.
 */
export const predictCycleLength = (completedCycles: Cycle[], defaultLength: number): number => {
    if (completedCycles.length < 3) {
        return defaultLength;
    }
    // Simple average of the last 3-6 cycles for prediction
    const recentCycles = completedCycles.slice(-6);
    const sum = recentCycles.reduce((acc, cycle) => acc + cycle.length, 0);
    return Math.round(sum / recentCycles.length);
};


/**
 * Formats a Date object into 'YYYY-MM-DD' string for input elements.
 * @param date The date to format.
 * @returns A formatted date string.
 */
export const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Calculates a person's age from their date of birth.
 * @param dob The date of birth.
 * @returns The age in years.
 */
export const calculateAge = (dob: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
};

/**
 * Determines the Zodiac sign from a date of birth.
 * @param dob The date of birth.
 * @returns The Zodiac sign as a string.
 */
export const getZodiacSign = (dob: Date): string => {
    const day = dob.getDate();
    const month = dob.getMonth() + 1;
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
    if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "Pisces";
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
    return "Unknown";
};


/**
 * Calculates key pregnancy metrics based on the last period date.
 * @param lastPeriod The start date of the last menstrual period.
 * @param today The current date.
 * @param lang The current language for milestones.
 * @param dueDate An optional due date to override calculations.
 * @returns An object with pregnancy information.
 */
export const calculatePregnancyMetrics = (lastPeriod: Date, today: Date, lang: string, dueDate?: Date): Omit<PregnancyInfo, 'userData'> => {
    const finalDueDate = dueDate || addDays(lastPeriod, 280);
    const daysPregnant = differenceInDays(today, lastPeriod);
    const daysRemaining = Math.max(0, differenceInDays(finalDueDate, today));

    const currentWeek = Math.floor(daysPregnant / 7) + 1;
    const dayOfWeek = (daysPregnant % 7) + 1;
    
    // Fix: Explicitly type `trimester` to satisfy the `1 | 2 | 3` constraint from `PregnancyInfo`.
    let trimester: 1 | 2 | 3 = 1;
    if (currentWeek > 27) {
        trimester = 3;
    } else if (currentWeek > 13) {
        trimester = 2;
    }

    // Clamp week to valid range for data lookup
    const dataWeek = Math.max(4, Math.min(40, currentWeek));
    const weeklyData: WeeklyPregnancyData = pregnancyDataByWeek[dataWeek] || pregnancyDataByWeek[40];

    const milestoneKey = lang === 'tr' ? 'milestone_tr' : 'milestone_en';
    
    return {
        currentWeek,
        dayOfWeek,
        trimester,
        daysPregnant,
        daysRemaining,
        babySizeKey: weeklyData.sizeKey,
        babyLength: weeklyData.lengthCm,
        babyWeight: weeklyData.weightGrams,
        developmentalMilestone: weeklyData[milestoneKey],
    };
};

/**
 * Analyzes symptom trends over the last N cycles.
 * @param cycles Array of all user cycles.
 * @param symptoms Symptom log object.
 * @param lastN The number of recent cycles to analyze.
 * @returns An array of symptoms sorted by frequency.
 */
export const analyzeSymptomTrends = (cycles: Cycle[], symptoms: { [date: string]: string[] }, lastN: number): { symptomKey: string, count: number }[] => {
    if (cycles.length < 2) return [];

    const recentCycles = cycles.slice(-lastN -1, -1); // Analyze last N completed cycles
    if (recentCycles.length === 0) return [];
    
    const trendCounts: Record<string, number> = {};

    recentCycles.forEach(cycle => {
        for (let i = 0; i < cycle.length; i++) {
            const date = addDays(cycle.startDate, i);
            const dateStr = formatDateForInput(date);
            const daySymptoms = symptoms[dateStr];
            if (daySymptoms) {
                daySymptoms.forEach(symptomKey => {
                    trendCounts[symptomKey] = (trendCounts[symptomKey] || 0) + 1;
                });
            }
        }
    });

    return Object.entries(trendCounts)
        .map(([symptomKey, count]) => ({ symptomKey, count }))
        .sort((a, b) => b.count - a.count);
};
