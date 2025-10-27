import React, { createContext, useState, useEffect, useCallback } from 'react';

const get = (obj, path, defaultValue = undefined) => {
    const result = path.split('.').reduce((acc, part) => acc && acc[part], obj);
    return result === undefined ? defaultValue : result;
};

const availableLanguages = [
    { code: 'en', name: 'English' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'zh', name: '中文 (Mandarin)' },
    { code: 'hi', name: 'हिन्दी (Hindi)' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'ar', name: 'العربية (Arabic)' },
    { code: 'bn', name: 'বাংলা (Bengali)' },
    { code: 'ru', name: 'Русский (Russian)' },
    { code: 'pt', name: 'Português' },
    { code: 'id', name: 'Bahasa Indonesia' },
    { code: 'de', name: 'Deutsch' },
    { code: 'ja', name: '日本語 (Japanese)' },
    { code: 'sw', name: 'Kiswahili' },
    { code: 'ko', name: '한국어 (Korean)' },
    { code: 'vi', name: 'Tiếng Việt (Vietnamese)' },
    { code: 'it', name: 'Italiano' },
    { code: 'pl', name: 'Polski (Polish)' },
    { code: 'nl', name: 'Nederlands (Dutch)' },
    { code: 'uk', name: 'Українська (Ukrainian)' },
];

export const LocalizationContext = createContext(null);

export const LocalizationProvider = ({ children }) => {
    const [language, setLanguageState] = useState(() => {
        const savedLang = localStorage.getItem('language');
        return availableLanguages.some(l => l.code === savedLang) ? savedLang : 'en';
    });
    
    const [translations, setTranslations] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadTranslations = async () => {
            setIsLoading(true);
            try {
                const loadedTranslations = {};

                await Promise.all(availableLanguages.map(async (lang) => {
                    try {
                        const response = await fetch(`./i18n/${lang.code}.json`);
                        if (!response.ok) {
                            console.warn(`Could not load translation file for ${lang.name} (${lang.code}).`);
                            return;
                        }
                        const translationData = await response.json();
                        loadedTranslations[lang.code] = translationData;
                    } catch (error) {
                         console.error(`Error loading translation for ${lang.name}:`, error);
                    }
                }));

                if (!loadedTranslations['en']) {
                     throw new Error('Failed to load base English translation file.');
                }
                
                setTranslations(loadedTranslations);

            } catch (error) {
                console.error("Could not load translation files:", error);
                setTranslations({});
            } finally {
                setIsLoading(false);
            }
        };

        loadTranslations();
    }, []);

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    const setLanguage = (lang) => {
        if (availableLanguages.some(l => l.code === lang)) {
            setLanguageState(lang);
        }
    };

    const t = useCallback((key, options) => {
        if (isLoading) {
            return key.split('.').pop() || key;
        }

        const langDict = translations[language] || translations.en;
        let translationValue = get(langDict, key, key);

        if (translationValue === key && language !== 'en' && translations.en) {
            translationValue = get(translations.en, key, key);
        }
        
        if (translationValue === key) {
            return key.split('.').pop() || key;
        }

        if (options?.returnObjects && typeof translationValue === 'object' && translationValue !== null) {
            return translationValue;
        }

        if (typeof translationValue !== 'string') {
            console.warn(`Translation for key '${key}' is an object but 'returnObjects' was not specified. Returning key.`);
            return key.split('.').pop() || key;
        }

        let text = translationValue;
        
        if (options) {
            const replacementOptions = { ...options };
            if ('returnObjects' in replacementOptions) {
                delete replacementOptions.returnObjects;
            }

            text = Object.entries(replacementOptions).reduce((acc, [optKey, optValue]) => {
                return acc.replace(`{{${optKey}}}`, String(optValue));
            }, text);
        }
        return text;
    }, [language, translations, isLoading]);

    if (isLoading) {
        return (
            <div className="bg-slate-50 min-h-screen flex items-center justify-center">
                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    return (
        <LocalizationContext.Provider value={{ language, setLanguage, t, availableLanguages }}>
            {children}
        </LocalizationContext.Provider>
    );
};
