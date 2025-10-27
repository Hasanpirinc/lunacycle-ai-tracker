import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation.ts';
import { Spinner } from './common/Spinner.tsx';

// This is a placeholder for a real Google Sign-In library integration
// In a real app, this would use a library like '@react-oauth/google'
const googleSignIn = async (): Promise<{ accessToken: string; profile: { name: string; email: string; } }> => {
    // This simulates the popup and permission grant process.
    // NOTE: THIS IS A MOCK. It requires a real OAuth implementation.
    // For this environment, we'll assume a successful sign-in.
    console.log("Simulating Google Sign-In...");
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
    
    // In a real scenario, the Google library would return these details.
    // We are returning a mock access token. It won't work with the real API,
    // but it allows us to build the application flow.
    return {
        accessToken: 'mock-access-token-' + Date.now(),
        profile: {
            name: 'Jane Doe',
            email: 'jane.doe@example.com'
        }
    };
};


interface LoginScreenProps {
  onGoogleLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onGoogleLoginSuccess }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
        // In a real app, you would get an access token here and pass it up.
        await googleSignIn(); 
        onGoogleLoginSuccess();
    } catch (error) {
        console.error("Google Sign-In failed:", error);
        alert("Google Sign-In failed. Please try again.");
        setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-[#FFFBF7] py-6 sm:py-12 font-['Inter',_sans-serif]">
        <div className="relative bg-[#FFFBF7] px-6 pb-8 pt-10 ring-1 ring-gray-900/5 sm:mx-auto sm:max-w-lg sm:rounded-lg sm:px-10">
            <div className="mx-auto max-w-md text-center">
                <h1 className="font-['Lora',_serif] text-4xl font-bold text-[#5C3D3D]">LunaCycle</h1>
                <div className="divide-y divide-gray-300/50">
                    <div className="space-y-6 py-8 text-base leading-7 text-gray-600">
                        <div className="relative flex h-auto w-full flex-col items-center bg-transparent group/design-root">
                            <h2 className="text-[#5C3D3D] tracking-light text-lg font-['Lora',_serif] leading-tight px-4 text-center pb-8 pt-5">{t('login.tagline')}</h2>
                            <div className="w-full max-w-xs">
                                <div className="flex px-4 py-3 justify-center w-full">
                                    <button onClick={handleLogin} disabled={isLoading} className="flex min-w-[84px] w-full max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-5 bg-[#E6B8B8] text-[#5C3D3D] gap-2 pl-5 text-base font-bold leading-normal tracking-[0.015em] shadow-md hover:shadow-lg transition-shadow disabled:bg-gray-300">
                                        {isLoading ? <Spinner /> : (
                                            <>
                                                <div className="text-[#5C3D3D]">
                                                    <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_1003_1215)"><path d="M21.9999 12.24C21.9999 11.43 21.9299 10.63 21.7999 9.87H12.2399V14.3H17.7599C17.5199 15.69 16.7199 16.89 15.5299 17.68V20.14H18.9199C20.8899 18.32 21.9999 15.53 21.9999 12.24Z" fill="#4285F4"></path><path d="M12.2399 22.0001C15.2399 22.0001 17.7599 21.0301 19.5199 19.5401L16.1299 17.0801C15.0999 17.7601 13.7799 18.1501 12.2399 18.1501C9.31994 18.1501 6.81994 16.2701 5.92994 13.7301H2.41992V16.2801C4.18992 19.6801 7.91992 22.0001 12.2399 22.0001Z" fill="#34A853"></path><path d="M5.92993 13.73C5.71993 13.11 5.59993 12.45 5.59993 11.77C5.59993 11.09 5.71993 10.43 5.92993 9.81V7.26001H2.41992C1.65992 8.79001 1.24992 10.47 1.24992 12.27C1.24992 14.07 1.65992 15.75 2.41992 17.28L5.92993 14.73V13.73Z" fill="#FBBC04"></path><path d="M12.2399 5.38C13.8899 5.38 15.3199 5.95 16.3699 6.94L19.5899 3.72C17.7599 1.99 15.2399 1 12.2399 1C7.91992 1 4.18992 3.32 2.41992 6.72L5.92992 9.27C6.81992 6.73 9.31994 5.38 12.2399 5.38Z" fill="#EA4335"></path></g><defs><clipPath id="clip0_1003_1215"><rect fill="white" height="24" width="24"></rect></clipPath></defs></svg>
                                                </div>
                                                <span className="truncate">{t('login.google')}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <p className="text-[#5C3D3D]/70 text-xs font-normal leading-normal pb-3 pt-1 px-4 text-center">{t('login.legal')} <a className="underline" href="#">{t('login.privacy')}</a> and <a className="underline" href="#">{t('login.terms')}</a>.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};