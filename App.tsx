import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { UserData, Cycle, PregnancyJourney } from './types.ts';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
// Fix: The useTranslation hook is in its own file, not in the context file.
import { LocalizationProvider } from './contexts/LocalizationContext.tsx';
import { useTranslation } from './hooks/useTranslation.ts';
import { AudioProvider } from './contexts/AudioContext.tsx';
import { useDebounce } from './hooks/useDebounce.ts';
import { LoginScreen } from './components/LoginScreen.tsx';
import { ProfileSetupScreen } from './components/ProfileSetupScreen.tsx';
import { PinEntryScreen } from './components/PinEntryScreen.tsx';
import { CycleTracker } from './components/CycleTracker.tsx';
import { PregnancyTracker } from './components/PregnancyTracker.tsx';
import { Header } from './components/Header.tsx';
import { SettingsScreen } from './components/SettingsScreen.tsx';
import { MyPregnanciesScreen } from './components/MyPregnanciesScreen.tsx';
import { ReminderManager } from './components/ReminderManager.tsx';
import { ChatbotWidget } from './components/ChatbotWidget.tsx';
import { PregnancyCelebration } from './components/PregnancyCelebration.tsx';
import * as cryptoService from './services/cryptoService.ts';
import * as googleDriveService from './services/googleDriveService.ts';
import { addDays } from './utils/helpers.ts';
// Fix: Import the LanguageSelectionScreen component to resolve the "Cannot find name" error.
import { LanguageSelectionScreen } from './components/LanguageSelectionScreen.tsx';

type AppState = 'initializing' | 'language_selection' | 'login' | 'pin_setup' | 'pin_entry' | 'profile_setup' | 'ready' | 'celebration';
export type SyncState = 'idle' | 'syncing' | 'synced' | 'error';
type AppView = 'cycle_tracker' | 'pregnancy_tracker' | 'settings' | 'my_pregnancies';

export interface AppContextType {
    userData: UserData | null;
    setUserData: (data: UserData) => void;
    currentView: AppView;
    setCurrentView: (view: AppView) => void;
    logout: () => void;
    language: string;
    setLanguage: (lang: string) => void;
    confirmPregnancy: () => void;
    exitPregnancyMode: () => void;
    savePregnancyJourney: (name: string) => void;
    updateCycles: (dates: { lastPeriod: string; prevPeriod1: string; prevPeriod2: string; }) => void;
    isDriveReady: boolean;
    isDriveAuthenticated: boolean;
    connectToDrive: () => Promise<void>;
    disconnectFromDrive: () => void;
    backupToDrive: () => Promise<void>;
    listBackupsFromDrive: () => Promise<any[]>;
    restoreFromDrive: (fileId: string) => Promise<void>;
}

export const AppContext = React.createContext<AppContextType>({} as AppContextType);

// JSON reviver to convert date strings back to Date objects
const dateReviver = (key: string, value: any) => {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
    if (typeof value === 'string' && isoDateRegex.test(value)) {
        return new Date(value);
    }
    return value;
};


const AppContent: React.FC = () => {
    const [appState, setAppState] = useState<AppState>('initializing');
    const [userData, setUserDataState] = useState<UserData | null>(null);
    const [pin, setPin] = useState<string | null>(null);
    const [pinError, setPinError] = useState('');
    const [currentView, setCurrentView] = useState<AppView>('cycle_tracker');
    const debouncedUserData = useDebounce(userData, 1500);
    const { t, language, setLanguage } = useTranslation();
    const [isDriveReady, setIsDriveReady] = useState(false);
    const [isDriveAuthenticated, setDriveAuthenticated] = useState(false);
    const [driveFolderId, setDriveFolderId] = useState<string | null>(null);

    // Initial load effect
    useEffect(() => {
        const initialize = async () => {
            const clientId = process.env.GOOGLE_CLIENT_ID;

            if (clientId) {
                try {
                    await googleDriveService.initClient(clientId);
                    setIsDriveReady(true);
                } catch (error) {
                    console.error("Failed to initialize Google Drive client:", error);
                    setIsDriveReady(false);
                }
            } else {
                console.warn("Google Client ID is not configured. Google Drive backup feature will be disabled.");
                setIsDriveReady(false);
            }

            const hasSeenLangScreen = localStorage.getItem('hasSeenLangScreen');
            if (!hasSeenLangScreen) {
                setAppState('language_selection');
                return;
            }

            const storedPin = localStorage.getItem('user_pin_set');
            if (storedPin) {
                setAppState('pin_entry');
            } else {
                setAppState('login');
            }
        };
        initialize();
    }, []);

    const handlePinEntry = async (enteredPin: string) => {
        try {
            setPinError('');
            const encryptedData = localStorage.getItem('userData');
            if (!encryptedData) {
                setAppState('profile_setup');
                setPin(enteredPin);
                return;
            }

            const decryptedData = await cryptoService.decryptData<UserData>(enteredPin, encryptedData);
            setUserDataState(JSON.parse(JSON.stringify(decryptedData), dateReviver));
            setPin(enteredPin);
            setCurrentView(decryptedData.isPregnant ? 'pregnancy_tracker' : 'cycle_tracker');
            setAppState('ready');

        } catch (error) {
            setPinError(t('pin.errorIncorrect', {default: 'Incorrect PIN. Please try again.'}));
            setTimeout(() => setPinError(''), 1500);
        }
    };
    
    const logout = () => {
        localStorage.removeItem('userData');
        localStorage.removeItem('user_pin_set');
        disconnectFromDrive();
        setUserDataState(null);
        setPin(null);
        setAppState('login');
    };

    const connectToDrive = async () => {
        if (!isDriveReady) return;
        try {
            await googleDriveService.signIn();
            const folderId = await googleDriveService.findOrCreateFolder();
            setDriveAuthenticated(true);
            setDriveFolderId(folderId);
            localStorage.setItem('drive_authenticated', 'true');
        } catch (error) {
            console.error("Drive connection failed", error);
            throw error;
        }
    };
    
    const disconnectFromDrive = () => {
        if(isDriveReady) {
            googleDriveService.signOut();
        }
        setDriveAuthenticated(false);
        setDriveFolderId(null);
        localStorage.removeItem('drive_authenticated');
    };

    const backupToDrive = async () => {
        if (!isDriveAuthenticated || !driveFolderId || !userData || !pin) {
            throw new Error("Not ready for backup.");
        }
        const encryptedData = await cryptoService.encryptData(pin, userData);
        await googleDriveService.saveData(driveFolderId, encryptedData);
    };

    const listBackupsFromDrive = async (): Promise<any[]> => {
        if (!isDriveAuthenticated || !driveFolderId) {
            throw new Error("Not connected to Drive.");
        }
        return await googleDriveService.listBackups(driveFolderId);
    };

    const restoreFromDrive = async (fileId: string) => {
        if (!isDriveAuthenticated || !pin) {
            throw new Error("Not ready for restore.");
        }
        const encryptedData = await googleDriveService.loadData(fileId);
        if (encryptedData) {
            const decryptedData = await cryptoService.decryptData<UserData>(pin, encryptedData);
            setUserDataState(JSON.parse(JSON.stringify(decryptedData), dateReviver));
            // Save locally immediately after restore
            localStorage.setItem('userData', encryptedData);
        } else {
            throw new Error("Backup file is empty or could not be loaded.");
        }
    };
    
    const confirmPregnancy = () => {
        if (userData) {
            const today = new Date();
            today.setHours(0, 0, 0, 0); 
            setUserDataState({ 
                ...userData, 
                isPregnant: true,
                lastPeriodDate: today,
                pregnancyDueDate: addDays(today, 280)
            });
            setAppState('celebration');
        }
    };

    const finishCelebration = () => {
        setCurrentView('pregnancy_tracker');
        setAppState('ready');
    };

    const exitPregnancyMode = () => {
        if (userData) {
            setUserDataState({ ...userData, isPregnant: false, pregnancyDueDate: undefined });
            setCurrentView('cycle_tracker');
        }
    };

    const savePregnancyJourney = (name: string) => {
        if (userData && userData.lastPeriodDate) {
            const journey: PregnancyJourney = {
                name,
                startDate: userData.lastPeriodDate,
                endDate: new Date(),
                symptoms: userData.pregnancySymptoms || {},
            };
            const completed = [...(userData.completedPregnancies || []), journey];
            setUserDataState({ 
                ...userData, 
                isPregnant: false, 
                pregnancyDueDate: undefined,
                pregnancySymptoms: {},
                completedPregnancies: completed
            });
            setCurrentView('cycle_tracker');
        }
    };
    
    const updateCycles = (dates: { lastPeriod: string; prevPeriod1: string; prevPeriod2: string; }) => {
        if (!userData) return;
        
        const dateStrings = [dates.lastPeriod, dates.prevPeriod1, dates.prevPeriod2].filter(Boolean);
        const newDates = dateStrings.map(d => new Date(`${d}T12:00:00`)).sort((a, b) => b.getTime() - a.getTime());

        if (newDates.length === 0) return;

        const newCycles: Cycle[] = [];
        for (let i = 0; i < newDates.length - 1; i++) {
            const cycleLength = Math.round((newDates[i].getTime() - newDates[i+1].getTime()) / (1000 * 60 * 60 * 24));
            newCycles.push({ startDate: newDates[i+1], length: cycleLength });
        }
        
        const currentCycle: Cycle = { startDate: newDates[0], length: userData.avgCycleLength };
        newCycles.push(currentCycle);
        
        const totalLength = newCycles.slice(0, -1).reduce((sum, c) => sum + c.length, 0);
        const avgCycleLength = newCycles.length > 1 ? Math.round(totalLength / (newCycles.length - 1)) : userData.avgCycleLength;

        setUserDataState({ ...userData, cycles: newCycles.reverse(), lastPeriodDate: newDates[0], avgCycleLength });
    };

    const renderContent = () => {
        switch (appState) {
            case 'initializing': return <div className="flex min-h-screen items-center justify-center bg-rose-50"><p>Loading...</p></div>;
            case 'language_selection': return <LanguageSelectionScreen onLanguageSelected={() => { localStorage.setItem('hasSeenLangScreen', 'true'); setAppState('login'); }} />;
            case 'login': return <LoginScreen onGoogleLoginSuccess={() => setAppState('pin_setup')} />;
            
            case 'pin_setup':
                return <PinEntryScreen
                    mode="setup"
                    onPinSet={(p) => {
                        setPin(p);
                        localStorage.setItem('user_pin_set', 'true');
                        setAppState('profile_setup');
                    }}
                    onPinConfirm={() => {}}
                    onPinEnter={() => {}}
                />;
            
            case 'pin_entry':
                return <PinEntryScreen mode="enter" onPinEnter={handlePinEntry} error={pinError} onLogout={logout} />;
            
            case 'profile_setup':
                return <ProfileSetupScreen onComplete={async (initialData) => {
                    if (pin) {
                        const encrypted = await cryptoService.encryptData(pin, initialData);
                        localStorage.setItem('userData', encrypted);
                    }
                    setUserDataState(initialData);
                    setCurrentView('cycle_tracker');
                    setAppState('ready');
                }} />;

            case 'celebration':
                return <PregnancyCelebration onFinish={finishCelebration} />;

            case 'ready':
                if (!userData) return <div>Error: User data not found. Please log out and start again.</div>;
                const MainView = () => {
                    switch(currentView) {
                        case 'pregnancy_tracker': return <PregnancyTracker />;
                        case 'settings': return <SettingsScreen />;
                        case 'my_pregnancies': return <MyPregnanciesScreen />;
                        case 'cycle_tracker':
                        default:
                             return <CycleTracker />;
                    }
                }
                return (
                    <div className="bg-slate-50 min-h-screen">
                        <Header />
                        <main className="max-w-4xl mx-auto p-4 sm:p-6">
                           <MainView />
                        </main>
                        <ChatbotWidget />
                        <ReminderManager />
                    </div>
                );
            default:
                return <div>Unknown app state</div>;
        }
    };
    
    const contextValue = useMemo(() => ({
        userData,
        setUserData: setUserDataState,
        currentView,
        setCurrentView,
        logout,
        language,
        setLanguage,
        confirmPregnancy,
        exitPregnancyMode,
        savePregnancyJourney,
        updateCycles,
        isDriveReady,
        isDriveAuthenticated,
        connectToDrive,
        disconnectFromDrive,
        backupToDrive,
        listBackupsFromDrive,
        restoreFromDrive,
    }), [userData, currentView, language, setLanguage, isDriveReady, isDriveAuthenticated, connectToDrive, disconnectFromDrive]);

    return (
        <AppContext.Provider value={contextValue}>
            {renderContent()}
        </AppContext.Provider>
    );
}


const App: React.FC = () => {
    return (
        <LocalizationProvider>
            <ThemeProvider>
                <AudioProvider>
                    <AppContent />
                </AudioProvider>
            </ThemeProvider>
        </LocalizationProvider>
    );
};

export default App;