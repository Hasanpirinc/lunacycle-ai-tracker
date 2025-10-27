// Fix: Implement the full content for ResourceCenter.tsx.
import React, { useState, useEffect } from 'react';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Spinner } from './common/Spinner';
import { useTranslation } from '../hooks/useTranslation';
import { 
    getPersonalizedResourceTopics, 
    getPersonalizedPregnancyResourceTopics, 
    getResourceContent,
    getExerciseRecommendations,
    getPregnancyExerciseRecommendations
} from '../services/geminiService';
import type { CycleInfo, PregnancyInfo } from '../types';
import { BookOpenIcon, ChevronLeftIcon, BoltIcon, ChevronDownIcon } from './icons';
import ReactMarkdown from 'react-markdown';
import { BannerAd } from './common/BannerAd';
import { useInView } from '../hooks/useInView';

interface ResourceCenterProps {
    mode: 'cycle' | 'pregnancy';
    cycleInfo?: CycleInfo | null;
    pregnancyInfo?: PregnancyInfo | null;
    symptomKeys: string[];
}

const ArticleView: React.FC<{ topic: string, onBack: () => void }> = ({ topic, onBack }) => {
    const { t, language } = useTranslation();
    const [content, setContent] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            setIsLoading(true);
            const articleContent = await getResourceContent(topic, language);
            setContent(articleContent);
            setIsLoading(false);
        };
        fetchContent();
    }, [topic, language]);

    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                 <Button onClick={onBack} size="sm" className="bg-gray-200 text-gray-800 hover:bg-gray-300 !px-2 !py-2">
                    <ChevronLeftIcon className="w-5 h-5" />
                </Button>
                <h4 className="text-lg font-bold text-gray-800 truncate">{topic}</h4>
            </div>

            <div className="my-6">
                <BannerAd />
            </div>

            {isLoading ? (
                <div className="flex justify-center py-8"><Spinner /></div>
            ) : (
                <>
                    <div className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-lg">
                        <ReactMarkdown>{content || t('error.contentNotFound')}</ReactMarkdown>
                    </div>
                    <div className="mt-6">
                        <BannerAd />
                    </div>
                </>
            )}
        </div>
    );
};


export const ResourceCenter: React.FC<ResourceCenterProps> = ({ mode, cycleInfo, pregnancyInfo, symptomKeys }) => {
    const { t, language } = useTranslation();
    const [topics, setTopics] = useState<string[]>([]);
    const [exercises, setExercises] = useState<{name: string, description: string}[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
    
    const [ref, isInView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    useEffect(() => {
        if (!isInView || hasFetched) {
            return;
        }

        const fetchResources = async () => {
            setIsLoading(true);
            setHasFetched(true);
            const translatedSymptoms = symptomKeys.map(key => t(key));
            
            let topicFetcher: Promise<string[]> | undefined;
            let exerciseFetcher: Promise<{ name: string; description: string; }[]> | undefined;

            if (mode === 'pregnancy' && pregnancyInfo) {
                topicFetcher = getPersonalizedPregnancyResourceTopics(pregnancyInfo, translatedSymptoms, language);
                exerciseFetcher = getPregnancyExerciseRecommendations(pregnancyInfo, translatedSymptoms, language);
            } else if (mode === 'cycle' && cycleInfo) {
                topicFetcher = getPersonalizedResourceTopics(cycleInfo.currentPhase, translatedSymptoms, language);
                exerciseFetcher = getExerciseRecommendations(cycleInfo.currentPhase, translatedSymptoms, language);
            }
            
            if (topicFetcher && exerciseFetcher) {
                // The services have built-in fallbacks, so we don't expect Promise.all to reject on 429.
                const [fetchedTopics, fetchedExercises] = await Promise.all([topicFetcher, exerciseFetcher]);
                setTopics(fetchedTopics);
                setExercises(fetchedExercises);
            }

            setIsLoading(false);
        };

        if ((mode === 'pregnancy' && pregnancyInfo) || (mode === 'cycle' && cycleInfo)) {
             fetchResources();
        } else {
             setIsLoading(false); // Should not happen, but as a safeguard
        }
    }, [isInView, hasFetched, mode, cycleInfo, pregnancyInfo, symptomKeys, language, t]);


    if (selectedTopic) {
        return (
            <Card className="p-4 md:p-6 bg-white">
                <ArticleView topic={selectedTopic} onBack={() => setSelectedTopic(null)} />
            </Card>
        );
    }
    
    return (
        <Card ref={ref} className="p-4 md:p-6 bg-white min-h-[250px]">
            {isLoading ? (
                <div className="flex justify-center py-8"><Spinner large /></div>
            ) : (
                <>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('resourceCenter')}</h3>
                        {hasFetched && (topics.length > 0 ? (
                            <ul className="space-y-3">
                                {topics.map(topic => (
                                    <li key={topic}>
                                        <button 
                                            onClick={() => setSelectedTopic(topic)}
                                            className="w-full text-left p-4 rounded-lg bg-gray-50 hover:bg-teal-50 transition-colors flex items-center gap-4"
                                        >
                                            <BookOpenIcon className="w-5 h-5 text-teal-600 flex-shrink-0" />
                                            <span className="font-medium text-sm text-gray-700">{topic}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : hasFetched && <p className="text-sm text-gray-500">{t('noRecommendations')}</p>)}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <BoltIcon className="w-5 h-5 text-teal-600" />
                            {t('exerciseRecommendations')}
                        </h3>
                        {hasFetched && (exercises.length > 0 ? (
                            <div className="space-y-2">
                                {exercises.map((exercise, index) => (
                                    <div key={index} className="rounded-lg bg-gray-50 overflow-hidden transition-all duration-300">
                                        <button
                                            onClick={() => setExpandedExercise(expandedExercise === exercise.name ? null : exercise.name)}
                                            className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-100"
                                            aria-expanded={expandedExercise === exercise.name}
                                        >
                                            <span className="font-medium text-sm text-gray-800">{exercise.name}</span>
                                            <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${expandedExercise === exercise.name ? 'rotate-180' : ''}`} />
                                        </button>
                                        {expandedExercise === exercise.name && (
                                            <div className="px-4 pb-4 animate-pop-in">
                                                <p className="text-sm text-gray-600">{exercise.description}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : hasFetched && <p className="text-sm text-gray-500">{t('noRecommendations')}</p>)}
                    </div>
                </>
            )}
        </Card>
    );
};