import React, { useState, useContext } from 'react';
import { Button } from './common/Button';
import { useTranslation } from '../hooks/useTranslation';
import { formatDateForInput } from '../utils/helpers';
import { useAudio } from '../hooks/useAudio';
import { useCycleManagement } from '../hooks/useCycleManagement';
import { AppContext } from '../App';

const formInputClasses = "w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors duration-200 bg-white text-slate-900 border-slate-300";

interface LogPeriodEndModalProps {
    onClose: () => void;
}

export const LogPeriodEndModal: React.FC<LogPeriodEndModalProps> = ({ onClose }) => {
    const { userData } = useContext(AppContext);
    const { logPeriodEnd } = useCycleManagement();
    const { t } = useTranslation();
    const { playSound } = useAudio();
    
    const [endDate, setEndDate] = useState(formatDateForInput(new Date()));

    const handleSave = () => {
        // Input gives 'YYYY-MM-DD'. To avoid timezone issues where the date might shift,
        // create the date by parsing its components into a local date.
        const [year, month, day] = endDate.split('-').map(Number);
        const selectedDate = new Date(year, month - 1, day);
        
        logPeriodEnd(selectedDate);
        playSound('confirm');
        onClose();
    };

    const handleClose = () => {
        playSound('cancel');
        onClose();
    }
    
    // The user should not be able to select a date before the current cycle started.
    const minDate = userData?.cycles.length ? formatDateForInput(userData.cycles[userData.cycles.length - 1].startDate) : undefined;
    const maxDate = formatDateForInput(new Date());

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={handleClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-medium text-gray-900">{t('logPeriodEndTitle')}</h3>
                <p className="mt-2 text-sm text-gray-500">
                    {t('logPeriodEndDescription')}
                </p>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={minDate}
                    max={maxDate}
                    className={`mt-4 ${formInputClasses}`}
                />
                <div className="mt-6 flex justify-end gap-4">
                    <Button onClick={handleClose} className="bg-gray-500 hover:bg-gray-600">{t('cancel')}</Button>
                    <Button onClick={handleSave} className="bg-red-500 hover:bg-red-600">
                        {t('saveEndDate')}
                    </Button>
                </div>
            </div>
        </div>
    );
};