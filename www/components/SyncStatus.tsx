import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { SyncState } from '../App';

interface SyncStatusProps {
    syncState: SyncState;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({ syncState }) => {
    const { t } = useTranslation();

    const getStatusContent = () => {
        switch (syncState) {
            case 'syncing':
                return { text: t('settings.driveSyncing', { default: 'Connecting...' }), color: 'text-yellow-600' };
            case 'synced':
                return { text: t('changesSaved', { default: 'Connected!' }), color: 'text-green-600' };
            case 'error':
                return { text: t('settings.driveConnectError', { default: 'Connection Error' }), color: 'text-red-600' };
            case 'idle':
            default:
                return null;
        }
    };

    const status = getStatusContent();

    if (!status) return null;

    return (
        <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md text-sm z-50 animate-pop-in">
            <p className={status.color}>{status.text}</p>
        </div>
    );
};
