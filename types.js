// This file is used for type definitions with JSDoc comments for type safety in a JS environment.
// It is not directly executed but helps with development and static analysis.

/**
 * @typedef {object} Cycle
 * @property {Date} startDate
 * @property {number} length
 * @property {number} [actualPeriodLength]
 */

/**
 * @typedef {object} Reminder
 * @property {'symptom_log' | 'medication'} id
 * @property {string} time - 'HH:MM'
 * @property {boolean} enabled
 */

/**
 * @typedef {object} PregnancyJourney
 * @property {string} name
 * @property {Date} startDate
 * @property {Date} endDate
 * @property {Object.<string, string[]>} symptoms - date: 'YYYY-MM-DD'
 */

/**
 * @typedef {object} UserData
 * @property {string} name
 * @property {Date} [dateOfBirth]
 * @property {number} avgCycleLength
 * @property {number} avgPeriodLength
 * @property {Date} [lastPeriodDate]
 * @property {Cycle[]} cycles
 * @property {Object.<string, string[]>} symptoms - date: 'YYYY-MM-DD'
 * @property {boolean} isPregnant
 * @property {Date} [pregnancyDueDate]
 * @property {Object.<string, string[]>} [pregnancySymptoms]
 * @property {PregnancyJourney[]} [completedPregnancies]
 * @property {Reminder[]} reminders
 * @property {Object.<string, string>} [cycleTipsHistory]
 * @property {Object.<string, string>} [pregnancyTipsHistory]
 */

/**
 * @typedef {object} ChatMessage
 * @property {string} id
 * @property {'user' | 'model'} role
 * @property {string} text
 * @property {{uri: string; title: string}[]} [sources]
 */

/**
 * @typedef {object} CycleInfo
 * @property {number} currentDay
 * @property {'Menstruation' | 'Follicular' | 'Ovulation' | 'Luteal'} currentPhase
 * @property {number} daysUntilPeriod
 * @property {boolean} isFertile
 * @property {boolean} isOvulating
 * @property {boolean} isPeriod
 * @property {Date} nextPeriodDate
 * @property {Cycle} currentCycle
 */

/**
 * @typedef {object} PregnancyInfo
 * @property {number} currentWeek
 * @property {number} dayOfWeek
 * @property {1 | 2 | 3} trimester
 * @property {number} daysPregnant
 * @property {number} daysRemaining
 * @property {string} babySizeKey
 * @property {number} babyLength
 * @property {number} babyWeight
 * @property {string} developmentalMilestone
 */

export {};
