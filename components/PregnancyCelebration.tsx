import React, { useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface PregnancyCelebrationProps {
    onFinish: () => void;
}

const playSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const notes = [392, 494, 587, 784]; // G4, B4, D5, G5 - a G major arpeggio
    let startTime = audioContext.currentTime;

    notes.forEach((note, i) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(note, startTime + i * 0.15);
      gainNode.gain.setValueAtTime(0.3, startTime + i * 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + i * 0.15 + 0.2);

      oscillator.start(startTime + i * 0.15);
      oscillator.stop(startTime + i * 0.15 + 0.2);
    });

  } catch (e) {
    console.error("Could not play celebration sound:", e);
  }
};

const ConfettiPiece: React.FC<{ style: React.CSSProperties, className: string }> = ({ style, className }) => {
    return <div className={`confetti ${className}`} style={style}></div>;
};

export const PregnancyCelebration: React.FC<PregnancyCelebrationProps> = ({ onFinish }) => {
  const { t } = useTranslation();
  
  useEffect(() => {
    playSound();
    const timer = setTimeout(onFinish, 7000); // Let the animation play for a bit
    return () => clearTimeout(timer);
  }, [onFinish]);
  
  const confettiPieces = [
      { className: 'h-4 w-4 bg-[#f28cf2] rounded-full', duration: 12 },
      { className: 'h-3 w-3 bg-[#eaddf7] rounded-full', duration: 15 },
      { className: 'h-5 w-5 bg-[#fde2e4] rounded-full', duration: 10 },
      { className: 'h-2 w-2 bg-[#f28cf2] rounded-full', duration: 18 },
      { className: 'h-4 w-4 bg-[#f8f6f8] rounded-full', duration: 13 },
      { className: 'h-3 w-3 bg-[#eaddf7] rounded-full', duration: 11 },
      { className: 'h-5 w-5 bg-[#fde2e4] rounded-full', duration: 16 },
      { className: 'h-2 w-2 bg-[#f28cf2] rounded-full', duration: 14 },
      { className: 'h-4 w-4 bg-[#f8f6f8] rounded-full', duration: 17 },
  ];

  const confetti = confettiPieces.map((piece, i) => {
    const style: React.CSSProperties = {
      left: `${(i * 10)}%`,
      animationDelay: `-${i*2}s`,
      animationDuration: `${piece.duration}s`,
    };
    return <ConfettiPiece key={i} style={style} className={piece.className} />;
  });

  return (
    <div className="flex w-full flex-col justify-center items-center bg-gradient-to-br from-[#fde2e4] to-[#eaddf7] group/design-root overflow-hidden fixed inset-0 z-[100]">
        <div className="absolute inset-0 z-0">
            {confetti}
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center p-4 h-full text-center">
            <div className="flex-grow flex flex-col justify-center items-center animate-pop-in">
                <h1 className="text-[#181118] tracking-tight text-5xl font-['Newsreader',_serif] font-bold leading-tight pb-3 pt-6">{t('congratulations')}</h1>
                <p className="text-[#181118]/80 text-lg font-['Noto_Sans',_sans-serif] font-normal leading-normal pb-3 pt-1 px-4">{t('amazingJourneyBegins')}</p>
            </div>
            <div className="w-full max-w-sm pb-8">
                <div className="flex px-4 py-3 justify-center">
                    <button onClick={onFinish} className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 flex-1 bg-[#f28cf2] text-[#181118] text-base font-bold leading-normal tracking-[0.015em] shadow-lg hover:bg-[#f28cf2]/90 transition-colors">
                        <span className="truncate font-['Noto_Sans',_sans-serif]">{t('pregnancy.continueToJourney')}</span>
                    </button>
                </div>
                <div className="flex px-4 py-3 justify-center">
                    <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 flex-1 bg-transparent text-[#181118] text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#f28cf2]/20 transition-colors">
                        <span className="truncate font-['Noto_Sans',_sans-serif]">{t('pregnancy.shareNews')}</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};