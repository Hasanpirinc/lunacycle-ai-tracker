import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation.js';
import { useAudio } from '../hooks/useAudio.js';
import { Button } from './common/Button.js';

interface PinEntryScreenProps {
    mode: 'setup' | 'confirm' | 'enter';
    pinToConfirm?: string;
    onPinSet?: (pin: string) => void;
    onPinConfirm?: (pin: string) => void;
    onPinEnter: (pin: string) => void;
    title?: string;
    error?: string;
    onLogout?: () => void;
}

const PIN_LENGTH = 4;

export const PinEntryScreen: React.FC<PinEntryScreenProps> = ({ mode, pinToConfirm, onPinSet, onPinConfirm, onPinEnter, title, error, onLogout }) => {
    const { t } = useTranslation();
    const { playSound } = useAudio();
    const [pin, setPin] = useState('');
    const [isWrong, setIsWrong] = useState(false);

    useEffect(() => {
        if (error) {
            handleWrongPin(false); // don't reset pin from parent error
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error]);

    const getTitle = () => {
        if (title) return title;
        switch (mode) {
            case 'setup': return t('pin.setupTitle');
            case 'confirm': return t('pin.confirmTitle');
            case 'enter': default: return t('pin.enterTitle');
        }
    };
    
    const handleKeyPress = (key: string) => {
        playSound('log');
        if (pin.length < PIN_LENGTH) {
            setPin(pin + key);
        }
    };

    const handleDelete = () => {
        playSound('cancel');
        setPin(p => p