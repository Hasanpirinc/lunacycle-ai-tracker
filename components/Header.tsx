import React, { useContext, useState, useRef, useEffect } from 'react';
import { AppContext } from '../App.tsx';
import { useTranslation } from '../hooks/useTranslation.ts';
import { CogIcon, DocumentTextIcon, UserIcon, ArrowRightOnRectangleIcon } from './icons.tsx';

export const Header: React.FC = () => {
  const { setCurrentView, userData, logout } = useContext(AppContext);
  const { t } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleNav = (view: 'settings' | 'my_pregnancies') => {
    setIsDropdownOpen(false);
    setCurrentView(view);
  };
  
  const handleLogout = () => {
      setIsDropdownOpen(false);
      logout();
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const hasCompletedPregnancies = (userData?.completedPregnancies?.length || 0) > 0;
  
  const goHome = () => {
    setCurrentView(userData?.isPregnant ? 'pregnancy_tracker' : 'cycle_tracker');
  }

  return (
    <header className="flex justify-between items-center p-4 bg-white/80 backdrop-blur-sm sticky top-0 z-40 border-b border-gray-200">
      <h1 onClick={goHome} className="font-['Lora',_serif] text-2xl font-bold text-pink-600 cursor-pointer">LunaCycle</h1>
      <div className="relative" ref={dropdownRef}>
        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="p-2 rounded-full hover:bg-gray-100" aria-label={t('profileMenu')}>
            <UserIcon className="w-6 h-6 text-gray-600" />
        </button>

        {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5 animate-pop-in">
                {hasCompletedPregnancies && (
                    <button onClick={() => handleNav('my_pregnancies')} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <DocumentTextIcon className="w-5 h-5 mr-3 text-gray-500" />
                        <span>{t('myPregnancies')}</span>
                    </button>
                )}
                <button onClick={() => handleNav('settings')} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <CogIcon className="w-5 h-5 mr-3 text-gray-500" />
                    <span>{t('settings.title')}</span>
                </button>
                 <div className="my-1 border-t border-gray-100"></div>
                <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                    <span>{t('logout')}</span>
                </button>
            </div>
        )}
      </div>
    </header>
  );
};