import React, { useEffect, useContext } from 'react';
import { AppContext } from '../App.js';
import { useTranslation } from '../hooks/useTranslation.js';

// This component is responsible for checking and firing notifications.
// It renders no UI.
export const ReminderManager: React.FC = () => {
    const { userData } = useContext(AppContext);
    const { t } = useTranslation();

    useEffect(() => {
        // Don't run if there's no data or no reminders configured
        if (!userData?.reminders) {
            return;
        }

        const checkReminders = () => {
            if (Notification.permission !== 'granted') {
                return;
            }

            const now = new Date();
            const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            const todayStr = now.toISOString().split('T')[0];

            userData.reminders?.forEach(reminder => {
                const notificationKey = `notif_${reminder.id}_${todayStr}`;
                const hasBeenSentToday = localStorage.getItem(notificationKey);

                if (reminder.enabled && reminder.time === currentTime && !hasBeenSentToday) {
                    const titleKey = reminder.id === 'symptom_log' ? 'notificationSymptomTitle' : 'notificationMedicationTitle';
                    const bodyKey = reminder.id === 'symptom_log' ? 'notificationSymptomBody' : 'notificationMedicationBody';
                    
                    // Show notification
                    new Notification(t(titleKey), {
                        body: t(bodyKey),
                    });

                    localStorage.setItem(notificationKey, 'true');
                }
            });
        };

        // Check reminders every minute
        const intervalId = setInterval(checkReminders, 60000);

        // Cleanup on unmount or when dependencies change
        return () => {
            clearInterval(intervalId);
        };

    }, [userData, t]);

    return null; // This component does not render anything
};