import React, { useState } from 'react';
import { ChatBubbleIcon } from './icons';
import { ChatbotModal } from './ChatbotModal';
import { useAudio } from '../hooks/useAudio';

export const ChatbotWidget: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { playSound } = useAudio();

    const handleOpen = () => {
        playSound('switch');
        setIsModalOpen(true);
    };

    const handleClose = () => {
        playSound('cancel');
        setIsModalOpen(false);
    };

    return (
        <>
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={handleOpen}
                    className="w-16 h-16 bg-pink-500 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-pink-600 transition-transform transform hover:scale-110"
                    aria-label="Open Chatbot"
                >
                    <ChatBubbleIcon className="w-8 h-8" />
                </button>
            </div>
            {isModalOpen && <ChatbotModal onClose={handleClose} />}
        </>
    );
};