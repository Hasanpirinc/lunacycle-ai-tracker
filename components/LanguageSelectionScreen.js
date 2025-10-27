import React from 'react';
import { useTranslation } from '../hooks/useTranslation.js';

interface LanguageSelectionScreenProps {
    onLanguageSelected: () => void;
}

export const LanguageSelectionScreen: React.FC<LanguageSelectionScreenProps> = ({ onLanguageSelected }) => {
    const { language, setLanguage, t, availableLanguages } = useTranslation();
    const [selectedLang, setSelectedLang] = React.useState(language);

    const handleSelect = (langCode: string) => {
        setSelectedLang(langCode);
    };

    const handleContinue = () => {
        setLanguage(selectedLang);
        onLanguageSelected();
    };

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden bg-[#fdfaf8] font-['Inter',_sans-serif]">
            <div className="flex flex-col items-center justify-center w-full grow px-4 pt-16 pb-8">
                <div className="flex flex-col items-center gap-4 mb-8">
                    <div className="w-24 h-24 bg-[#e6c3d9] rounded-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c2.28 0 4.39-.76 6.14-2.04A9.954 9.954 0 0 1 12 14c-4.41 0-8-3.59-8-8 0-1.02.19-2 .54-2.86A9.954 9.954 0 0 1 12 2zm0 4c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"></path>
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#5c4b56]">LunaCycle</h1>
                </div>

                <h2 className="text-[#5c4b56] tracking-light text-xl font-medium text-center pb-8">
                    Welcome! Please select your language.
                </h2>
                
                <div className="flex flex-wrap justify-center gap-3 p-3 w-full max-w-md">
                    {availableLanguages.map((lang) => (
                        <button 
                            key={lang.code}
                            onClick={() => handleSelect(lang.code)}
                            className={`flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-full cursor-pointer px-6 transition-all duration-200 ring-2 ring-transparent
                                ${selectedLang === lang.code 
                                    ? 'bg-[#e6c3d9]/80 ring-[#e6c3d9]' 
                                    : 'bg-[#e6c3d9]/20 hover:bg-[#e6c3d9]/40'
                                }`}
                        >
                            <p className="text-[#5c4b56] text-base font-medium leading-normal">{lang.name}</p>
                        </button>
                    ))}
                </div>
                
                <div className="flex-grow"></div>

                <button 
                    onClick={handleContinue}
                    className="flex h-14 w-full max-w-xs items-center justify-center gap-x-2 rounded-full bg-[#e6c3d9] px-6 text-white text-lg font-semibold leading-normal shadow-md hover:bg-opacity-90 transition-all mt-12"
                >
                    Continue
                </button>
            </div>
        </div>
    );
};