import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { useTranslation } from '../hooks/useTranslation';
import { useAudio } from '../hooks/useAudio';
import * as cache from '../utils/cache';

const symptomCategoryKeys = [
    {
        nameKey: 'symptomCategories.mood',
        symptomKeys: ['moodSwings', 'anxious', 'happy', 'sad', 'irritable', 'calm']
    },
    {
        nameKey: 'symptomCategories.physical',
        symptomKeys: ['cramps', 'headache', 'bloating', 'fatigue', 'tenderBreasts', 'acne', 'backache', 'nausea']
    },
    {
        nameKey: 'symptomCategories.discharge',
        symptomKeys: ['none', 'spotting', 'light', 'medium', 'heavy', 'sticky', 'eggWhite']
    },
    {
        nameKey: 'symptomCategories.other',
        symptomKeys: ['cravings', 'insomnia', 'highLibido', 'lowLibido']
    }
];

export const SymptomLogger: React.FC = () => {
  const { userData } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation();
  const { playSound } = useAudio();
  const today = new Date().toISOString().split('T')[0];
  const loggedSymptomKeys = userData?.symptoms[today] || [];

  const handleOpenModal = () => {
    playSound('switch');
    setIsModalOpen(true);
  }

  const handleCloseModal = () => {
    setIsModalOpen(false);
  }

  return (
    <>
        <Card className="p-4 md:p-6 bg-white">
            <div className="flex justify-between items-center mb-4">
                 <h3 className="text-lg font-semibold">{t('howAreYouFeelingToday')}</h3>
                 <Button onClick={handleOpenModal} size="sm">{t('logSymptoms')}</Button>
            </div>
            {loggedSymptomKeys.length > 0 ? (
                 <div className="flex flex-wrap gap-2">
                    {loggedSymptomKeys.map(key => (
                        <div key={key} className="px-3 py-1.5 text-sm font-medium rounded-full bg-pink-100 text-pink-800">
                            {t(key)}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-500">{t('noSymptomsLogged')}</p>
            )}
        </Card>
        {isModalOpen && <SymptomModal onClose={handleCloseModal} />}
    </>
  );
};


const SymptomModal: React.FC<{onClose: () => void}> = ({ onClose }) => {
    const { userData, setUserData } = useContext(AppContext);
    const { t } = useTranslation();
    const { playSound } = useAudio();
    const today = new Date().toISOString().split('T')[0];
    const [selectedSymptomKeys, setSelectedSymptomKeys] = useState(() => userData?.symptoms[today] || []);

    const toggleSymptom = (symptomKey: string) => {
        playSound('log');
        setSelectedSymptomKeys(currentSymptoms => {
            if (currentSymptoms.includes(symptomKey)) {
                return currentSymptoms.filter(s => s !== symptomKey);
            } else {
                return [...currentSymptoms, symptomKey];
            }
        });
    };

    const handleSave = () => {
        if (userData) {
            const newSymptoms = { ...userData.symptoms, [today]: selectedSymptomKeys };
            setUserData({ ...userData, symptoms: newSymptoms });
            cache.invalidate('api_cache_');
        }
        playSound('confirm');
        onClose();
    };

    const handleCancel = () => {
        playSound('cancel');
        onClose();
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={handleCancel}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-white p-6 border-b z-10">
                    <h3 className="text-xl font-bold text-pink-600">{t('logYourSymptoms')}</h3>
                    <p className="text-sm text-gray-500">{t('selectAllThatApply')}</p>
                </div>
                <div className="p-6 space-y-6">
                    {symptomCategoryKeys.map(category => (
                        <div key={category.nameKey}>
                             <h4 className="text-md font-semibold mb-3">{t(category.nameKey)}</h4>
                              <div className="flex flex-wrap gap-2">
                                {category.symptomKeys.map(symptomKey => {
                                    const fullKey = `symptoms.${symptomKey}`;
                                    return (
                                        <button
                                            key={fullKey}
                                            onClick={() => toggleSymptom(fullKey)}
                                            className={`px-3 py-1.5 text-sm font-medium rounded-full border-2 transition-all duration-200 text-center ${
                                            selectedSymptomKeys.includes(fullKey)
                                                ? 'bg-pink-500 border-pink-500 text-white'
                                                : 'bg-white border-gray-300 hover:border-pink-400'
                                            }`}
                                        >
                                            {t(fullKey)}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="sticky bottom-0 bg-white p-6 border-t">
                    <Button onClick={handleSave} className="w-full">{t('done')}</Button>
                </div>
            </div>
        </div>
    );
};
