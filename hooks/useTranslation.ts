import { useContext } from 'react';
import { LocalizationContext } from '../contexts/LocalizationContext';

export const useTranslation = () => {
    return useContext(LocalizationContext);
};