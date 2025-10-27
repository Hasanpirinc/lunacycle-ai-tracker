import React, { useState, useContext, useEffect } from 'react';
import { AppContext, SyncState } from '../App';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { useTranslation } from '../hooks/useTranslation';
import { formatDateForInput } from '../utils/helpers';
import type { UserData, Reminder } from '../types';
import { useAudio } from '../hooks/useAudio';
import { CheckIcon } from './icons';
import { Spinner } from './common/Spinner';

const formInputClasses = "w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors duration-200 bg-white text-slate-900 border-slate-300";

const DataBackupSettings: React.FC = () => {
    const { 
        isDriveReady, 
        isDriveAuthenticated, 
        connectToDrive, 
        disconnectFromDrive,
        backupToDrive,
        listBackupsFromDrive,
        restoreFromDrive
    } = useContext(AppContext);
    const { t, language } = useTranslation();
    const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });
    const [backups, setBackups] = useState<any[]>([]);
    
    const handleConnect = async () => {
        setStatus({ type: 'loading', message: t('settings.driveSyncing') });
        try {
            await connectToDrive();
            setStatus({ type: 'success', message: t('settings.driveConnected') });
        } catch (e) {
            setStatus({ type: 'error', message: t('settings.driveConnectError') });
        } finally {
            setTimeout(() => setStatus({ type: 'idle', message: '' }), 2000);
        }
    };

    const handleBackup = async () => {
        setStatus({ type: 'loading', message: 'Backing up...' });
        try {
            await backupToDrive();
            setStatus({ type: 'success', message: t('settings.backupSuccess') });
            handleListBackups(); // Refresh list after backup
        } catch (e) {
             setStatus({ type: 'error', message: t('settings.backupError') });
        } finally {
             setTimeout(() => setStatus({ type: 'idle', message: '' }), 2000);
        }
    };

    const handleListBackups = async () => {
        setStatus({ type: 'loading', message: 'Listing backups...' });
        try {
            const files = await listBackupsFromDrive();
            setBackups(files);
            setStatus({ type: 'idle', message: '' });
        } catch (e) {
             setStatus({ type: 'error', message: 'Failed to list backups.' });
             setTimeout(() => setStatus({ type: 'idle', message: '' }), 2000);
        }
    };

    const handleRestore = async (fileId: string) => {
        if (!window.confirm(t('settings.confirmRestore'))) {
            return;
        }
        setStatus({ type: 'loading', message: 'Restoring...' });
         try {
            await restoreFromDrive(fileId);
            setStatus({ type: 'success', message: t('settings.restoreSuccess') });
             alert(t('settings.restoreSuccess'));
        } catch (e) {
             setStatus({ type: 'error', message: t('settings.restoreError') });
             alert(t('settings.restoreError'));
        } finally {
             setTimeout(() => setStatus({ type: 'idle', message: '' }), 2000);
        }
    };
    
    useEffect(() => {
        if(isDriveAuthenticated) {
            handleListBackups();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDriveAuthenticated]);

    const renderContent = () => {
        if (!isDriveReady) {
            return (
                <div className="p-4 bg-yellow-50 rounded-lg text-center">
                    <p className="text-sm text-yellow-800">{t('settings.driveNotConfigured')}</p>
                </div>
            );
        }

        if (isDriveAuthenticated) {
            return (
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-800">{t('settings.driveConnected')}</p>
                        <Button size="sm" onClick={disconnectFromDrive} className="bg-red-500 hover:bg-red-600 w-full sm:w-auto">
                            {t('settings.disconnect')}
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Button onClick={handleBackup} disabled={status.type === 'loading'} className="w-full">{t('settings.backupNow')}</Button>
                        <Button onClick={handleListBackups} disabled={status.type === 'loading'} className="w-full bg-gray-500 hover:bg-gray-600">{t('settings.listBackups')}</Button>
                    </div>

                    <div className="mt-4 space-y-2">
                         {backups.length > 0 ? backups.map(file => (
                             <div key={file.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                 <div>
                                     <p className="text-sm font-medium">{file.name}</p>
                                     <p className="text-xs text-gray-500">{new Date(file.modifiedTime).toLocaleString(language)}</p>
                                 </div>
                                 <Button size="sm" onClick={() => handleRestore(file.id)} disabled={status.type === 'loading'}>{t('settings.restore')}</Button>
                             </div>
                         )) : (
                             <p className="text-sm text-center text-gray-500">{t('settings.noBackupsFound')}</p>
                         )}
                    </div>
                </div>
            );
        }
        
        return (
             <div className="flex flex-col items-center gap-4">
                 <Button 
                    onClick={handleConnect} 
                    disabled={status.type === 'loading'}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
                >
                   {status.type === 'loading' ? <Spinner /> : t('settings.connectToDrive')}
                </Button>
            </div>
        );
    };

    return (
        <Card className="p-4 md:p-6 relative">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{t('settings.dataBackup')}</h3>
            <p className="text-sm text-gray-600 mb-6">{t('settings.driveDescription')}</p>
            {renderContent()}
            {status.type !== 'idle' && (
                 <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md text-sm z-50 animate-pop-in">
                    <p className={status.type === 'error' ? 'text-red-600' : 'text-gray-800'}>{status.message}</p>
                </div>
            )}
        </Card>
    );
}


export const SettingsScreen: React.FC = () => {
    const { userData, setUserData, setCurrentView } = useContext(AppContext);
    const { t, language, setLanguage, availableLanguages } = useTranslation();
    const { playSound } = useAudio();
    
    const [name, setName] = useState(userData?.name || '');
    const [dob, setDob] = useState(userData?.dateOfBirth ? formatDateForInput(userData.dateOfBirth) : '');
    const [avgCycle, setAvgCycle] = useState(userData?.avgCycleLength || 28);
    const [avgPeriod, setAvgPeriod] = useState(userData?.avgPeriodLength || 5);
    const [reminders, setReminders] = useState<Reminder[]>(userData?.reminders || [
        { id: 'symptom_log', time: '20:00', enabled: false },
        { id: 'medication', time: '09:00', enabled: false },
    ]);
    const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if(userData) {
            setName(userData.name);
            setDob(userData.dateOfBirth ? formatDateForInput(userData.dateOfBirth) : '');
            setAvgCycle(userData.avgCycleLength);
            setAvgPeriod(userData.avgPeriodLength);
            setReminders(userData.reminders || [
                { id: 'symptom_log', time: '20:00', enabled: false },
                { id: 'medication', time: '09:00', enabled: false },
            ]);
        }
    }, [userData]);

    const handleSave = () => {
        if (!userData || !setUserData) return;
        
        const dateOfBirth = dob ? new Date(`${dob}T12:00:00`) : undefined;

        const updatedUserData: UserData = {
            ...userData,
            name,
            dateOfBirth,
            avgCycleLength: Number(avgCycle),
            avgPeriodLength: Number(avgPeriod),
            reminders,
        };
        
        setUserData(updatedUserData);
        playSound('confirm');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2500);
    };
    
    const requestNotificationPermission = async () => {
        if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);
        }
    };
    
    const handleReminderToggle = (id: Reminder['id'], enabled: boolean) => {
        if (enabled && notificationPermission !== 'granted') {
            requestNotificationPermission();
        }
        handleReminderChange(id, { enabled });
    };
    
    const handleReminderChange = (id: Reminder['id'], newReminder: Partial<Reminder>) => {
        setReminders(prev => prev.map(r => r.id === id ? { ...r, ...newReminder } : r));
    };
    
    const handleBack = () => {
        setCurrentView(userData?.isPregnant ? 'pregnancy_tracker' : 'cycle_tracker');
    }

    return (
        <div className="space-y-8 max-w-2xl mx-auto pb-12">
            <h2 className="text-3xl font-bold text-gray-800">{t('settings.title')}</h2>

            <Card className="p-4 md:p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6">{t('profileSettings')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('name')}</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className={formInputClasses} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('dateOfBirth')}</label>
                        <input type="date" value={dob} onChange={e => setDob(e.target.value)} className={formInputClasses} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('avgCycleLength')}</label>
                        <input type="number" value={avgCycle} onChange={e => setAvgCycle(Number(e.target.value))} className={formInputClasses} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('avgPeriodLength')}</label>
                        <input type="number" value={avgPeriod} onChange={e => setAvgPeriod(Number(e.target.value))} className={formInputClasses} />
                    </div>
                </div>
            </Card>
            
            <DataBackupSettings />

            <Card className="p-4 md:p-6">
                 <h3 className="text-xl font-bold text-gray-800 mb-6">{t('appPreferences')}</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('language')}</label>
                        <select value={language} onChange={e => setLanguage(e.target.value)} className={formInputClasses}>
                           {availableLanguages.map(lang => (
                               <option key={lang.code} value={lang.code}>{lang.name}</option>
                           ))}
                        </select>
                    </div>
                 </div>
            </Card>
            
            <Card className="p-4 md:p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{t('reminders')}</h3>
                 <p className="text-sm text-gray-600 mb-4">{t('remindersDescription')}</p>
                 {notificationPermission !== 'granted' && (
                    <div className="mb-4 p-3 bg-yellow-50 rounded-lg text-center">
                        <Button size="sm" onClick={requestNotificationPermission} className="w-full bg-yellow-500 hover:bg-yellow-600" disabled={notificationPermission === 'denied'}>
                             {notificationPermission === 'denied' ? t('permissionDenied') : t('requestPermission')}
                        </Button>
                    </div>
                )}
                 <div className="space-y-4">
                    {reminders.map(reminder => (
                         <div key={reminder.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                            <div className="flex-grow pr-4">
                                <p className="font-medium text-gray-800">{t(reminder.id === 'symptom_log' ? 'symptomLogReminder' : 'medicationReminder')}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                   <input 
                                        type="time" 
                                        value={reminder.time}
                                        onChange={e => handleReminderChange(reminder.id, { time: e.target.value })}
                                        className={formInputClasses}
                                        disabled={!reminder.enabled || notificationPermission !== 'granted'}
                                    />
                                </div>
                            </div>
                            <label htmlFor={`reminder-${reminder.id}`} className="flex items-center cursor-pointer">
                                <div className="relative">
                                <input
                                    id={`reminder-${reminder.id}`}
                                    type="checkbox"
                                    className="sr-only"
                                    checked={reminder.enabled}
                                    onChange={e => handleReminderToggle(reminder.id, e.target.checked)}
                                    disabled={notificationPermission !== 'granted'}
                                />
                                <div className="block w-14 h-8 rounded-full bg-slate-200"></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${reminder.enabled ? 'translate-x-6 bg-teal-500' : ''}`}></div>
                                </div>
                            </label>
                         </div>
                    ))}
                </div>
            </Card>

            <div className="flex flex-col sm:flex-row justify-end items-center gap-4">
                {showSuccess && 
                    <div className="flex items-center gap-2 text-sm text-green-600 animate-fade-in-out">
                        <CheckIcon className="w-5 h-5" />
                        <span>{t('changesSaved')}</span>
                    </div>
                }
                <div className="flex w-full sm:w-auto gap-4">
                    <Button onClick={handleBack} size="lg" className="w-full bg-slate-500 hover:bg-slate-600">{t('back')}</Button>
                    <Button onClick={handleSave} size="lg" className="w-full">{t('saveChanges')}</Button>
                </div>
            </div>
        </div>
    );
};