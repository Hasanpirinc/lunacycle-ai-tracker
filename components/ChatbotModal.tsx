import React, { useState, useContext, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { AppContext } from '../App';
import { Button } from './common/Button';
import { Spinner } from './common/Spinner';
import { useTranslation } from '../hooks/useTranslation';
import { getChatbotResponse } from '../services/geminiService';
import type { ChatMessage } from '../types';
import { useCycleData } from '../hooks/useCycleData';
import { usePregnancyData } from '../hooks/usePregnancyData';
import { PaperAirplaneIcon, UserIcon, SparklesIcon } from './icons';

interface ChatbotModalProps {
    onClose: () => void;
}

export const ChatbotModal: React.FC<ChatbotModalProps> = ({ onClose }) => {
    const { userData, language } = useContext(AppContext);
    const { t } = useTranslation();
    const cycleInfo = useCycleData();
    const pregnancyInfo = usePregnancyData();

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Add a welcome message when the modal opens
    useEffect(() => {
        setMessages([{
            id: 'welcome',
            role: 'model',
            text: t('lunaWelcome', { name: userData?.name || 'there' })
        }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [t, userData?.name]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading || !userData) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: input,
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const today = new Date().toISOString().split('T')[0];
            const symptoms = userData.isPregnant 
                ? userData.pregnancySymptoms?.[today] || []
                : userData.symptoms[today] || [];
            
            const context = {
                cycleInfo,
                pregnancyInfo,
                symptoms,
            };

            const response = await getChatbotResponse(input, userData, context, language);

            const modelMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: response.text,
                sources: response.sources,
            };
            setMessages(prev => [...prev, modelMessage]);

        } catch (err: any) {
            setError(err.message || t('error.occurred'));
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: t('error.occurred'),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-[60] p-0 sm:p-4" onClick={onClose}>
            <div 
                className="bg-rose-50 rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-lg h-[85vh] sm:h-[70vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="sticky top-0 bg-rose-50 p-4 border-b border-rose-200 z-10 flex justify-between items-center rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                            <SparklesIcon className="w-6 h-6 text-pink-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">{t('luna')}</h3>
                            <p className="text-xs text-gray-500">{t('chatbot.tagline')}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-800">&times;</button>
                </header>

                <main className="flex-grow p-4 overflow-y-auto">
                    <div className="space-y-6">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                {msg.role === 'model' && (
                                    <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <SparklesIcon className="w-5 h-5 text-pink-500" />
                                    </div>
                                )}
                                <div className={`p-3 rounded-2xl max-w-xs md:max-w-md ${msg.role === 'user' ? 'bg-pink-500 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                                    <div className="prose prose-sm max-w-none">
                                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                                    </div>
                                     {msg.sources && msg.sources.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                            <h4 className="font-semibold text-xs mb-1">{t('sources')}</h4>
                                            <ul className="space-y-1">
                                                {msg.sources.map((source, i) => (
                                                    <li key={i}>
                                                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:underline text-xs block truncate">
                                                            {source.title}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                                {msg.role === 'user' && (
                                     <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                        <UserIcon className="w-5 h-5 text-gray-600" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <SparklesIcon className="w-5 h-5 text-pink-500" />
                                </div>
                                <div className="p-3 rounded-2xl bg-gray-100">
                                    <Spinner />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </main>

                <footer className="sticky bottom-0 bg-rose-50 p-4 border-t border-rose-200">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={t('typeYourMessage')}
                            className="w-full px-4 py-2.5 border rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200 bg-white"
                            disabled={isLoading}
                        />
                        <Button onClick={handleSend} disabled={isLoading || !input.trim()} className="flex-shrink-0 !p-3">
                            <PaperAirplaneIcon className="w-5 h-5" />
                        </Button>
                    </div>
                </footer>
            </div>
        </div>
    );
};