import { useContext } from 'react';
import { AudioContext } from '../contexts/AudioContext';

export const useAudio = () => {
    return useContext(AudioContext);
};
