import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation.js';
import { Button } from './common/Button.js';
import { Spinner } from './common/Spinner.js';

interface ApiKeySetupScreenProps {
  onKeySelected: () => void;
}

export const ApiKeySetupScreen: React.FC<ApiKeySetupScreenProps> = ({ onKeySelected }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleActivate = async () => {
    setIsLoading(true);
    try {
      // @ts-ignore - aistudio is available in the execution environment
      await window.aistudio.openSelectKey();
      // Assume success and proceed. The parent component will handle API call failures.
      onKeySelected();
    } catch (error) {
      console.error("Error opening API key selection:", error);
      setIsLoading(false); // Stay on this screen if there's an error
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-rose-50 p-4">
      <div className="w-full max-w-md text-center bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-pink-600 mb-2">{t('apiKey.title')}</h1>
        <p className="text-gray-600 mb-6">{t('apiKey.description')}</p>
        <Button onClick={handleActivate} disabled={isLoading} className="w-full">
          {isLoading ? <Spinner /> : t('apiKey.cta')}
        </Button>
        <p className="text-xs text-gray-500 mt-4">
          {t('apiKey.billingInfo')}{' '}
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:underline">
            {t('apiKey.billingLink')}
          </a>
        </p>
      </div>
    </div>
  );
};