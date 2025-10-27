import React, { useState } from 'react';
import { Button } from './common/Button.js';
import { useTranslation } from '../hooks/useTranslation.js';

const formInputClasses = "w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors duration-200 bg-white text-slate-900 border-slate-300";

interface NamePregnancyModalProps {
    onClose: () => void;
    onSave: (name: string) => void;
}

export const NamePregnancyModal: React.FC<NamePregnancyModalProps> = ({ onClose, onSave }) => {
    const [name, setName] = useState('');
    const { t } = useTranslation();

    const handleSave = () => {
        if (name.trim()) {
            onSave(name.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-medium text-gray-900">{t('nameThisJourney')}</h3>
                <p className="mt-2 text-sm text-gray-500">
                    {t('nameJourneyDescription')}
                </p>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('nameJourneyPlaceholder')}
                    className={`mt-4 ${formInputClasses}`}
                />
                <div className="mt-6 flex justify-end gap-4">
                    <Button onClick={onClose} className="bg-red-700 hover:bg-red-800">{t('cancel')}</Button>
                    <Button onClick={handleSave} disabled={!name.trim()} className="bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300">
                        {t('saveJourney')}
                    </Button>
                </div>
            </div>
        </div>
    );
};