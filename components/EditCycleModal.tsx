import React, { useState, useContext } from 'react';
import { AppContext } from '../App';
import { Button } from './common/Button';
import { useTranslation } from '../hooks/useTranslation';
import { formatDateForInput } from '../utils/helpers';
import { useAudio } from '../hooks/useAudio';

const formInputClasses = "w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors duration-200 bg-white text-slate-900 border-slate-300";

interface EditCycleModalProps {
    onClose: () => void;
}

export const EditCycleModal: React.FC<EditCycleModalProps> = ({ onClose }) => {
    const { userData, updateCycles } = useContext(AppContext);
    const { t } = useTranslation();
    const { playSound } = useAudio();

    const sortedCycles = [...(userData?.cycles || [])].sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

    const [lastPeriod, setLastPeriod] = useState(() => sortedCycles.length > 0 ? formatDateForInput(sortedCycles[0].startDate) : '');
    const [prevPeriod1, setPrevPeriod1] = useState(() => sortedCycles.length > 1 ? formatDateForInput(sortedCycles[1].startDate) : '');
    const [prevPeriod2, setPrevPeriod2] = useState(() => sortedCycles.length > 2 ? formatDateForInput(sortedCycles[2].startDate) : '');
    const [error, setError] = useState('');

    const handleSave = () => {
        if (!lastPeriod) {
            setError(t('profileSetup.errorRequired'));
            return;
        }
        if (updateCycles) {
            updateCycles({ lastPeriod, prevPeriod1, prevPeriod2 });
            playSound('confirm');
        }
        onClose();
    };
    
    const handleClose = () => {
        playSound('cancel');
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={handleClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-white p-6 border-b z-10">
                    <h3 className="text-xl font-bold text-pink-600">{t('editCycleHistory')}</h3>
                    <p className="text-sm text-gray-500 mt-1">{t('editCycleDescription')}</p>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label htmlFor="lastPeriodEdit" className="block text-sm font-medium text-gray-700 mb-1">{t('profileSetup.lastPeriodLabel')}</label>
                        <input type="date" id="lastPeriodEdit" value={lastPeriod} onChange={e => setLastPeriod(e.target.value)} className={formInputClasses} max={formatDateForInput(new Date())} />
                    </div>

                    <details className="group">
                        <summary className="cursor-pointer text-sm font-medium text-teal-600 hover:underline">
                             {t('profileSetup.optionalTitle')}
                        </summary>
                        <div className="mt-4 space-y-4 border-l-2 border-teal-200 pl-4">
                            <p className="text-xs text-gray-500">{t('profileSetup.optionalSubtitle')}</p>
                             <div>
                                <label htmlFor="prevPeriod1Edit" className="block text-sm font-medium text-gray-700 mb-1">{t('profileSetup.prevPeriod1Label')}</label>
                                <input type="date" id="prevPeriod1Edit" value={prevPeriod1} onChange={e => setPrevPeriod1(e.target.value)} className={formInputClasses} max={formatDateForInput(new Date())}/>
                            </div>
                             <div>
                                <label htmlFor="prevPeriod2Edit" className="block text-sm font-medium text-gray-700 mb-1">{t('profileSetup.prevPeriod2Label')}</label>
                                <input type="date" id="prevPeriod2Edit" value={prevPeriod2} onChange={e => setPrevPeriod2(e.target.value)} className={formInputClasses} max={formatDateForInput(new Date())}/>
                            </div>
                        </div>
                    </details>
                    
                    {error && <p className="text-sm text-red-600">{error}</p>}
                </div>

                <div className="sticky bottom-0 bg-white p-6 border-t flex justify-end gap-4">
                    <Button onClick={handleClose} className="bg-gray-500 hover:bg-gray-600">{t('cancel')}</Button>
                    <Button onClick={handleSave} className="bg-pink-500 hover:bg-pink-600">{t('saveCycleChanges')}</Button>
                </div>
            </div>
        </div>
    );
};
