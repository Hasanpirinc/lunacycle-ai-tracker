import React, { useState, useContext, useEffect, useRef } from 'react';
import { AppContext } from '../App.js';
import { Button } from './common/Button.js';
import { useTranslation } from '../hooks/useTranslation.js';
import { formatDateForInput, addDays } from '../utils/helpers.js';
import { useAudio } from '../hooks/useAudio.js';

const formInputClasses = "w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors duration-200 bg-white text-slate-900 border-slate-300";

interface SetDueDateModalProps {
    onClose: () => void;
}

export const SetDueDateModal: React.FC<SetDueDateModalProps> = ({ onClose }) => {
    const { userData, setUserData } = useContext(AppContext);
    const { t } = useTranslation();
    const { playSound } = useAudio();
    
    const initialStartDate = userData?.lastPeriodDate || new Date();
    const initialDueDate = userData?.pregnancyDueDate || addDays(initialStartDate, 280);

    const [startDate, setStartDate] = useState(formatDateForInput(initialStartDate));
    const [dueDate, setDueDate] = useState(formatDateForInput(initialDueDate));
    const isEditingRef = useRef<'start' | 'due' | null>(null);

    useEffect(() => {
        if (isEditingRef.current !== 'start') return;
        const newStartDate = new Date(`${startDate}T12:00:00`);
        if (!isNaN(newStartDate.getTime())) {
            const newDueDate = addDays(newStartDate, 280);
            setDueDate(formatDateForInput(newDueDate));
        }
    }, [startDate]);

    useEffect(() => {
        if (isEditingRef.current !== 'due') return;
        const newDueDate = new Date(`${dueDate}T12:00:00`);
        if (!isNaN(newDueDate.getTime())) {
            const newStartDate = addDays(newDueDate, -280);
            setStartDate(formatDateForInput(newStartDate));
        }
    }, [dueDate]);
    
    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        isEditingRef.current = 'start';
        setStartDate(e.target.value);
    };

    const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        isEditingRef.current = 'due';
        setDueDate(e.target.value);
    };

    const handleSave = () => {
        if (userData && setUserData) {
            const newStartDate = new Date(`${startDate}T12:00:00`);
            const newDueDate = new Date(`${dueDate}T12:00:00`);
            
            setUserData({ ...userData, pregnancyDueDate: newDueDate, lastPeriodDate: newStartDate });
            playSound('confirm');
            onClose();
        }
    };

    const handleClose = () => {
        playSound('cancel');
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={handleClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-medium text-gray-900">{t('editPregnancyDates')}</h3>
                <p className="mt-2 text-sm text-gray-500">
                    {t('setDueDateDescription')}
                </p>
                <div className="mt-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('pregnancyStartDate')}</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={handleStartDateChange}
                            className={formInputClasses}
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('estimatedDueDate')}</label>
                         <input
                            type="date"
                            value={dueDate}
                            onChange={handleDueDateChange}
                            className={formInputClasses}
                        />
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <Button onClick={handleClose} className="bg-gray-500 hover:bg-gray-600">{t('cancel')}</Button>
                    <Button onClick={handleSave} className="bg-pink-500 hover:bg-pink-600">
                        {t('save')}
                    </Button>
                </div>
            </div>
        </div>
    );
};