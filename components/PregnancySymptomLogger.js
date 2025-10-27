import React, { useContext, useState } from 'react';
import { AppContext } from '../App.js';
import { Card } from './common/Card.js';
import { Button } from './common/Button.js';
import { useTranslation } from '../hooks/useTranslation.js';
import { useAudio } from '../hooks/useAudio.js';
import * as cache from '../utils/cache.js';

const pregnancySymptomCategoryKeys = [
    {
        nameKey: 'pregnancySymptomCategories.common',
        symptomKeys: ['morningSickness', 'fatigue', 'cravings', 'foodAversions', 'frequentUrination', 'tenderBreasts']
    },
    {
        nameKey: 'pregnancySymptomCategories.physicalDiscomfort',
        symptomKeys: ['backache', 'headache', 'heartburn', 'constipation', 'swelling', 'roundLigamentPain', 'legCramps']
    },
    {
        nameKey: 'pregnancySymptomCategories.moodEnergy',
        symptomKeys: ['moodSwings', 'anxious', 'forgetfulness', 'nestingInstinct', 'insomnia']
    },
    {
        nameKey: 'pregnancySymptomCategories.lessCommon',
        symptomKeys: ['spotting', 'increasedDischarge', 'braxtonHicks', 'dizziness', 'shortnessOfBreath']
    }
];

export const PregnancySymptomLogger: React.FC = () => {
  const { userData } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation();
  const { playSound } = useAudio();
  const today = new Date().toISOString().split('T')[0];
  const loggedSymptomKeys = userData?.pregnancySymptoms?.[today] || [];

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
                 <h3 className="text-lg font-semibold text-gray-800">{t('todaysSymptoms')}</h3>
                 <Button onClick={handleOpenModal} size="sm" className="bg-pink-500 hover:bg-pink-600">{t('updateSymptoms')}</Button>
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
    const [selectedSymptomKeys, setSelectedSymptomKeys] = useState(() => userData?.pregnancySymptoms?.[today] || []);

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
            const newSymptoms = { ...userData.pregnancySymptoms, [today]: selectedSymptomKeys };
            setUserData({ ...userData, pregnancySymptoms: newSymptoms });
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
                    <h3 className="text-xl font-bold text-pink-600">{t('logPregnancySymptoms')}</h3>
                    <p className="text-sm text-gray-500">{t('selectAllThatApply')}</p>
                </div>
                <div className="p-6 space-y-6">
                    {pregnancySymptomCategoryKeys.map(category => (
                        <div key={category.nameKey}>
                             <h4 className="text-md font-semibold text-gray-700 mb-3">{t(category.nameKey)}</h4>
                              <div className="flex flex-wrap gap-2">
                                {category.symptomKeys.map(symptomKey => {
                                    const fullKey = `pregnancySymptoms.${symptomKey}`;
                                    return (
                                        <button
                                            key={fullKey}
                                            onClick={() => toggleSymptom(fullKey)}
                                            className={`px-3 py-1.5 text-sm font-medium rounded-full border-2 transition-all duration-200 text-center ${
                                            selectedSymptomKeys.includes(fullKey)
                                                ? 'bg-pink-500 border-pink-500 text-white'
                                                : 'bg-white border-gray-300 text-gray-700 hover:border-pink-400'
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
                    <Button onClick={handleSave} className="w-full bg-pink-500 hover:bg-pink-600">{t('done')}</Button>
                </div>
            </div>
        </div>
    );
};