// Fix: Implement the full content for AnalyzeDayModal.tsx.
import React, { useState, useEffect, useContext, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { AppContext } from '../App.tsx';
import { Card } from './common/Card.tsx';
import { Button } from './common/Button.tsx';
import { Spinner } from './common/Spinner.tsx';
import { useTranslation } from '../hooks/useTranslation.ts';
import { analyzeDay, analyzePregnancyDay, generateSpeech } from '../services/geminiService.ts';
import type { CycleInfo, PregnancyInfo } from '../types.ts';
import { useAudio } from '../hooks/useAudio.ts';
import { VolumeUpIcon, VolumeOffIcon } from './icons.tsx';

interface AnalyzeDayModalProps {
    mode: 'cycle' | 'pregnancy';
    cycleInfo?: CycleInfo | null;
    pregnancyInfo?: PregnancyInfo | null;
    onClose: () => void;
}

function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}


export const AnalyzeDayModal: React.FC<AnalyzeDayModalProps> = ({ mode, cycleInfo, pregnancyInfo, onClose }) => {
    const { userData } = useContext(AppContext);
    const { t, language } = useTranslation();
    const { playSound } = useAudio();
    
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [sources, setSources] = useState<{ uri: string; title: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const audioCtxRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

    useEffect(() => {
        const getAnalysis = async (coords: GeolocationCoordinates) => {
            if (!userData) {
                setError(t('error.noUserData'));
                setIsLoading(false);
                return;
            }

            try {
                const today = new Date().toISOString().split('T')[0];
                let result;

                if (mode === 'pregnancy' && pregnancyInfo) {
                    const symptoms = userData.pregnancySymptoms?.[today] || [];
                    result = await analyzePregnancyDay(userData, pregnancyInfo, symptoms.map(s => t(s)), { latitude: coords.latitude, longitude: coords.longitude }, language);
                } else if (mode === 'cycle' && cycleInfo) {
                    const symptoms = userData.symptoms[today] || [];
                    result = await analyzeDay(userData, cycleInfo, symptoms.map(s => t(s)), { latitude: coords.latitude, longitude: coords.longitude }, language);
                } else {
                    throw new Error("Invalid mode or missing data for analysis.");
                }
                
                setAnalysis(result.analysis);
                setSources(result.sources);
            } catch (err: any) {
                setError(err.message || t('error.analysisFailed'));
            } finally {
                setIsLoading(false);
            }
        };

        const fetchLocationAndAnalyze = () => {
            if (!navigator.geolocation) {
                setError(t('error.geolocationNotSupported'));
                setIsLoading(false);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    getAnalysis(position.coords);
                },
                (err) => {
                    setError(t('error.geolocationDenied'));
                    console.error("Geolocation error:", err);
                    setIsLoading(false);
                }
            );
        };
        
        fetchLocationAndAnalyze();
    }, [userData, mode, cycleInfo, pregnancyInfo, t, language]);


    const handlePlaySpeech = async () => {
        if (!analysis || isSpeaking) return;

        setIsSpeaking(true);
        const base64Audio = await generateSpeech(analysis);
        
        if (base64Audio) {
            try {
                if (!audioCtxRef.current) {
                    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
                }
                const audioCtx = audioCtxRef.current;
                if (audioCtx.state === 'suspended') {
                    await audioCtx.resume();
                }
                
                const audioBuffer = await decodeAudioData(decode(base64Audio), audioCtx, 24000, 1);
                const source = audioCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioCtx.destination);
                source.onended = () => {
                    setIsSpeaking(false);
                    sourceNodeRef.current = null;
                };
                source.start();
                sourceNodeRef.current = source;
            } catch (e) {
                console.error("Error playing audio:", e);
                setIsSpeaking(false);
            }
        } else {
            setIsSpeaking(false);
        }
    };

    const handleStopSpeech = () => {
        if (sourceNodeRef.current) {
            sourceNodeRef.current.stop();
            sourceNodeRef.current = null;
        }
        setIsSpeaking(false);
    }
    
    const handleClose = () => {
        handleStopSpeech();
        playSound('cancel');
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={handleClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-white p-6 border-b z-10 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-pink-600">{t('dailyAnalysis')}</h3>
                    {analysis && !isLoading && (
                         <button onClick={isSpeaking ? handleStopSpeech : handlePlaySpeech} className="p-2 rounded-full hover:bg-gray-100">
                           {isSpeaking ? <VolumeOffIcon className="w-6 h-6 text-red-500" /> : <VolumeUpIcon className="w-6 h-6 text-pink-500" />}
                        </button>
                    )}
                </div>

                <div className="p-6 flex-grow">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-full">
                            <Spinner large />
                            <p className="mt-4">{t('generatingAnalysis')}</p>
                        </div>
                    )}
                    {error && (
                         <div className="text-center text-red-600">
                            <p>{t('error.title')}</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    )}
                    {analysis && !isLoading && (
                        <div className="prose prose-sm max-w-none">
                            <ReactMarkdown>{analysis}</ReactMarkdown>
                        </div>
                    )}
                </div>

                {sources.length > 0 && !isLoading && (
                     <div className="p-6 border-t">
                        <h4 className="font-semibold text-sm mb-2">{t('nearbySuggestions')}</h4>
                        <ul className="space-y-1">
                            {sources.map(source => (
                                <li key={source.uri}>
                                    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:underline text-sm">
                                        {source.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                     </div>
                )}

                <div className="sticky bottom-0 bg-white p-6 border-t">
                    <Button onClick={handleClose} className="w-full">{t('close')}</Button>
                </div>
            </div>
        </div>
    );
};