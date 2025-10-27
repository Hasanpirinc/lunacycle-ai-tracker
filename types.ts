
export interface Cycle {
  startDate: Date;
  length: number;
  actualPeriodLength?: number;
}

export interface Reminder {
    id: 'symptom_log' | 'medication';
    time: string; // 'HH:MM'
    enabled: boolean;
}

export interface PregnancyJourney {
    name: string;
    startDate: Date;
    endDate: Date;
    symptoms: { [date: string]: string[] }; // date: 'YYYY-MM-DD'
}

export interface UserData {
  name: string;
  dateOfBirth?: Date;
  avgCycleLength: number;
  avgPeriodLength: number;
  lastPeriodDate?: Date;
  cycles: Cycle[];
  symptoms: { [date: string]: string[] }; // date: 'YYYY-MM-DD'
  isPregnant: boolean;
  pregnancyDueDate?: Date;
  pregnancySymptoms?: { [date: string]: string[] };
  completedPregnancies?: PregnancyJourney[];
  reminders: Reminder[];
  cycleTipsHistory?: { [key: string]: string };
  pregnancyTipsHistory?: { [key: string]: string };
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    sources?: { uri: string; title: string }[];
}

export interface CycleInfo {
  currentDay: number;
  currentPhase: 'Menstruation' | 'Follicular' | 'Ovulation' | 'Luteal';
  daysUntilPeriod: number;
  isFertile: boolean;
  isOvulating: boolean;
  isPeriod: boolean;
  nextPeriodDate: Date;
  currentCycle: Cycle;
}

export interface PregnancyInfo {
  currentWeek: number;
  dayOfWeek: number;
  trimester: 1 | 2 | 3;
  daysPregnant: number;
  daysRemaining: number;
  babySizeKey: string;
  babyLength: number;
  babyWeight: number;
  developmentalMilestone: string;
}