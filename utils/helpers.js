import { pregnancyDataByWeek } from '../data/pregnancyData.js';

export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const differenceInDays = (date1, date2) => {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  const diffTime = d1.getTime() - d2.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

export const predictCycleLength = (completedCycles, defaultLength) => {
    if (completedCycles.length < 3) {
        return defaultLength;
    }
    const recentCycles = completedCycles.slice(-6);
    const sum = recentCycles.reduce((acc, cycle) => acc + cycle.length, 0);
    return Math.round(sum / recentCycles.length);
};

export const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const calculateAge = (dob) => {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
};

export const getZodiacSign = (dob) => {
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

export const calculatePregnancyMetrics = (lastPeriod, today, lang, dueDate) => {
    const finalDueDate = dueDate || addDays(lastPeriod, 280);
    const daysPregnant = differenceInDays(today, lastPeriod);
    const daysRemaining = Math.max(0, differenceInDays(finalDueDate, today));

    const currentWeek = Math.floor(daysPregnant / 7) + 1;
    const dayOfWeek = (daysPregnant % 7) + 1;
    
    let trimester = 1;
    if (currentWeek > 27) {
        trimester = 3;
    } else if (currentWeek > 13) {
        trimester = 2;
    }

    const dataWeek = Math.max(4, Math.min(40, currentWeek));
    const weeklyData = pregnancyDataByWeek[dataWeek] || pregnancyDataByWeek[40];

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

export const analyzeSymptomTrends = (cycles, symptoms, lastN) => {
    if (cycles.length < 2) return [];

    const recentCycles = cycles.slice(-lastN -1, -1);
    if (recentCycles.length === 0) return [];
    
    const trendCounts = {};

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