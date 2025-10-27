import React, { useContext, useState } from 'react';
import { Button } from './common/Button.js';
import { AppContext } from '../App.js';
import { NamePregnancyModal } from './NamePregnancyModal.js';
import { useTranslation } from '../hooks/useTranslation.js';
import { useAudio } from '../hooks/useAudio.js';

interface ExitPregnancyModeModalProps {
  onClose: () => void;
}

export const ExitPregnancyModeModal: React.FC<ExitPregnancyModeModalProps> = ({ onClose }) => {
    const { exitPregnancyMode, savePregnancyJourney } = useContext(AppContext);
    const [showNameModal, setShowNameModal] = useState(false);
    const { t } = useTranslation();
    const { playSound } = useAudio();

    const handleExitReason = (reason: 'birth' | 'ended') => {
        if (reason === 'birth') {
            playSound('switch');
            setShowNameModal(true);
        } else {
            playSound('switch');
            exitPregnancyMode();
            onClose();
        }
    };

    const handleSaveJourney = (name: string) => {
        playSound('confirm');
        savePregnancyJourney(name);
        setShowNameModal(false);
        onClose(); // Close the exit modal as well
    }
    
    const handleClose = () => {
        playSound('cancel');
        onClose();
    }
    
    const handleCloseNameModal = () => {
        playSound('cancel');
        setShowNameModal(false);
    }

    if (showNameModal) {
        return <NamePregnancyModal 
                    onClose={handleCloseNameModal}
                    onSave={handleSaveJourney}
                />
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={handleClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-medium text-gray-900 text-center mb-4">{t('whyExitPregnancyMode')}</h3>
                <div className="space-y-3">
                    <Button onClick={() => handleExitReason('birth')} className="w-full bg-pink-500 hover:bg-pink-600">
                        {t('birthHappened')}
                    </Button>
                    <Button onClick={() => handleExitReason('ended')} className="w-full bg-gray-500 hover:bg-gray-600">
                        {t('pregnancyHasEnded')}
                    </Button>
                     <Button onClick={handleClose} className="w-full bg-red-700 hover:bg-red-800">
                        {t('cancel')}
                    </Button>
                </div>
            </div>
        </div>
    );
};