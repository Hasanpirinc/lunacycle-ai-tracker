import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useAudio } from '../hooks/useAudio';
import { Button } from './common/Button';

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
        setPin(p => p.slice(0, -1));
    };

    const handleSubmit = (finalPin: string) => {
        if (finalPin.length !== PIN_LENGTH) return;

        switch(mode) {
            case 'setup': onPinSet?.(finalPin); break;
            case 'confirm': 
                if (finalPin === pinToConfirm) {
                    onPinConfirm?.(finalPin);
                } else {
                    handleWrongPin();
                }
                break;
            case 'enter': onPinEnter(finalPin); break;
        }
    };

    const handleWrongPin = (resetPin = true) => {
        setIsWrong(true);
        setTimeout(() => {
            if (resetPin) setPin('');
            setIsWrong(false);
        }, 800);
    }

    const pinDots = Array.from({ length: PIN_LENGTH }, (_, i) => (
        <div key={i} className={`w-4 h-4 rounded-full border-2 border-pink-300 transition-colors ${pin.length > i ? 'bg-pink-400' : 'bg-transparent'}`}></div>
    ));

    const keypad = [
        '1', '2', '3',
        '4', '5', '6',
        '7', '8', '9',
        '', '0', 'backspace'
    ].map(key => (
        <button
            key={key}
            onClick={() => key === 'backspace' ? handleDelete() : handleKeyPress(key)}
            disabled={!key}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-semibold transition-colors
                ${key ? 'text-pink-600 hover:bg-pink-100 active:bg-pink-200' : 'bg-transparent'}
            `}
        >
            {key === 'backspace' ? <span className="material-symbols-outlined">backspace</span> : key}
        </button>
    ));

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-rose-50 p-4">
            <div className="text-center w-full max-w-xs">
                 <h1 className="font-['Lora',_serif] text-3xl font-bold text-pink-600 mb-4">LunaCycle</h1>
                 <h2 className="text-lg font-medium text-gray-700 mb-6">{getTitle()}</h2>
                
                <div className={`flex justify-center gap-4 mb-8 transition-transform duration-300 ${isWrong ? 'animate-shake' : ''}`}>
                    {pinDots}
                </div>
                
                <div className="h-5 mb-4">
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>

                
                <div className="grid grid-cols-3 gap-4 justify-items-center">
                    {keypad}
                </div>

                <div className="mt-8 w-full">
                    <Button
                        onClick={() => handleSubmit(pin)}
                        disabled={pin.length !== PIN_LENGTH}
                        className="w-full disabled:bg-pink-300 disabled:cursor-not-allowed"
                    >
                        {t('confirm')}
                    </Button>
                </div>

                {mode === 'enter' && onLogout && (
                     <button onClick={onLogout} className="mt-4 text-sm text-gray-500 hover:text-pink-600">
                        {t('pin.logout')}
                    </button>
                )}
            </div>
        </div>
    );
};
