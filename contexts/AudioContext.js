import React, { createContext, useRef, useCallback } from 'react';

export const AudioContext = createContext(null);

export const AudioProvider = ({ children }) => {
    const audioContextRef = useRef(null);

    const playSound = useCallback((sound) => {
        if (!audioContextRef.current) {
            try {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.error("Web Audio API is not supported in this browser.");
                return;
            }
        }
        
        const ctx = audioContextRef.current;
        
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        const now = ctx.currentTime;
        gainNode.gain.setValueAtTime(0.2, now);
        oscillator.type = 'sine';

        switch (sound) {
            case 'log':
                oscillator.frequency.setValueAtTime(800, now);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
                break;
            case 'confirm':
                oscillator.frequency.setValueAtTime(523.25, now); // C5
                oscillator.frequency.linearRampToValueAtTime(659.25, now + 0.1); // E5
                gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
                break;
            case 'switch':
                oscillator.frequency.setValueAtTime(440, now); // A4
                gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
                
                const oscillator2 = ctx.createOscillator();
                const gainNode2 = ctx.createGain();
                oscillator2.connect(gainNode2);
                gainNode2.connect(ctx.destination);
                oscillator2.type = 'sine';
                gainNode2.gain.setValueAtTime(0.2, now + 0.1);
                oscillator2.frequency.setValueAtTime(587.33, now + 0.1); // D5
                gainNode2.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
                oscillator2.start(now + 0.1);
                oscillator2.stop(now + 0.2);
                break;
            case 'cancel':
                oscillator.frequency.setValueAtTime(300, now);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
                break;
        }

        oscillator.start(now);
        oscillator.stop(now + 0.2);
    }, []);

    return (
        <AudioContext.Provider value={{ playSound }}>
            {children}
        </AudioContext.Provider>
    );
};
