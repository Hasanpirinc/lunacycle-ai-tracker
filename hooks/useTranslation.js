import { useContext } from 'react';
import { LocalizationContext } from '../contexts/LocalizationContext.js';

export const useTranslation = () => {
    return useContext(LocalizationContext);
};
