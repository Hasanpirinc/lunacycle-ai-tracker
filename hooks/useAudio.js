import { useContext } from 'react';
import { AudioContext } from '../contexts/AudioContext.js';

export const useAudio = () => {
    return useContext(AudioContext);
};
