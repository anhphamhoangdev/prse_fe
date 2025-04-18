import React, { useState, useEffect, useRef, ChangeEvent, KeyboardEvent, useCallback } from 'react';
import { X, Send, Bot, MinusCircle } from 'lucide-react';
import { MessageContent } from './MessageContent';
import { Message } from '../../types/chat';
import { motion, AnimatePresence } from 'framer-motion';

interface AIChatDrawerProps {
    className?: string;
    position?: 'left' | 'right';
    messages: Message[];
    onSendMessage: (message: string) => Promise<void>;
}

const AIChatDrawer: React.FC<AIChatDrawerProps> = ({
                                                       className = '',
                                                       position = 'right',
                                                       messages,
                                                       onSendMessage,
                                                   }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isMinimized, setIsMinimized] = useState<boolean>(false);
    const [inputMessage, setInputMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showHint, setShowHint] = useState<boolean>(true);
    const [displayedMessageIds, setDisplayedMessageIds] = useState<number[]>([]);
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const stopTypingRef = useRef<(() => void) | null>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Track typing state of the last message
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (
            lastMessage &&
            lastMessage.sender === 'ai' &&
            lastMessage.type !== 'code' &&
            !displayedMessageIds.includes(lastMessage.id)
        ) {
            setIsTyping(true);
        } else {
            setIsTyping(false);
            stopTypingRef.current = null;
        }
    }, [messages, displayedMessageIds]);

    const markMessageAsDisplayed = (messageId: number) => {
        if (!displayedMessageIds.includes(messageId)) {
            setDisplayedMessageIds((prev) => [...prev, messageId]);
            setIsTyping(false);
            stopTypingRef.current = null;
        }
    };

    const handleStopTyping = useCallback(() => {
        if (stopTypingRef.current) {
            stopTypingRef.current();
            setIsTyping(false);
            stopTypingRef.current = null;
        }
    }, []);

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading || isTyping) return;
        try {
            setIsLoading(true);
            setShowHint(false);
            setInputMessage('');
            await onSendMessage(inputMessage);
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = () => {
        if (isTyping) {
            handleStopTyping();
        } else {
            handleSendMessage();
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setInputMessage(e.target.value);
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey && !isTyping) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const positionStyles = position === 'right' ? 'right-6' : 'left-6';

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        } else if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    };

    // Scroll to bottom when messages change or when chat is opened
    useEffect(() => {
        if (isOpen && !isMinimized) {
            // Small delay to ensure DOM is updated
            const timer = setTimeout(() => {
                scrollToBottom();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [messages, isOpen, isMinimized]);

    // Loading animation variants
    const dotVariants = {
        initial: { scale: 0.8, opacity: 0.6 },
        animate: (i: number) => ({
            scale: [0.8, 1.2, 0.8],
            opacity: [0.6, 1, 0.6],
            transition: {
                repeat: Infinity,
                duration: 1.5,
                delay: i * 0.15,
                ease: "easeInOut"
            }
        })
    };

    const thinkingPhrases = [
        "Thinking...",
        "Processing...",
        "Analyzing...",
        "Computing...",
        "Pondering...",
        "Considering...",
        "Contemplating...",
        "Reflecting..."
    ];

    const [thinkingPhrase, setThinkingPhrase] = useState(thinkingPhrases[0]);

    useEffect(() => {
        if (isLoading) {
            const interval = setInterval(() => {
                setThinkingPhrase(thinkingPhrases[Math.floor(Math.random() * thinkingPhrases.length)]);
            }, 2000);

            return () => clearInterval(interval);
        }
    }, [isLoading]);

    return (
        <>
            {/* Chat Toggle Button with Floating Hint */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className={`fixed bottom-6 ${positionStyles} z-50`}
                    >
                        {showHint && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute bottom-full mb-4 w-56 transform -translate-x-1/2 left-1/2"
                            >
                                <div className="bg-gray-900/80 p-3 rounded-xl shadow-lg border border-gray-700/50 backdrop-blur-sm">
                                    <p className="text-sm text-center text-gray-200 font-medium">
                                        Ask me anything! 🚀
                                    </p>
                                </div>
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-gray-900/80 border-r border-b border-gray-700/50"></div>
                            </motion.div>
                        )}
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: '0 8px 20px rgba(59, 130, 246, 0.4)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setIsOpen(true);
                                setIsMinimized(false);
                                setShowHint(false);
                            }}
                            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-full shadow-lg transition-all duration-300"
                        >
                            <div className="relative">
                                <Bot className="w-5 h-5" />
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-gray-900 animate-pulse"></span>
                            </div>
                            <span className="font-semibold text-sm">AI Assistant</span>
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={`fixed ${positionStyles} bottom-6 w-[700px] mx-auto bg-white rounded-2xl shadow-2xl transition-all duration-300 z-50 border border-gray-200
                            ${isMinimized ? 'h-14' : 'h-[700px]'} ${className}`}
                        style={{
                            left: position === 'right' ? 'auto' : '24px',
                            right: position === 'right' ? '24px' : 'auto',
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-t-2xl">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Bot className="w-6 h-6" />
                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-gray-900 animate-pulse"></span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">EasyEdu Assistant</h3>
                                    <p className="text-xs text-gray-200">Powered by Gemini</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setIsMinimized(!isMinimized)}
                                    className="p-1.5 hover:bg-gray-700/50 rounded-full transition-colors"
                                    aria-label={isMinimized ? 'Expand' : 'Minimize'}
                                >
                                    <MinusCircle className="w-5 h-5" />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 hover:bg-gray-700/50 rounded-full transition-colors"
                                    aria-label="Close chat"
                                >
                                    <X className="w-5 h-5" />
                                </motion.button>
                            </div>
                        </div>

                        {!isMinimized && (
                            <>
                                {/* Messages Container */}
                                <div
                                    ref={messagesContainerRef}
                                    className="flex-1 p-6 space-y-6 overflow-y-auto h-[calc(100%-9rem)] bg-white scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                                >
                                    <AnimatePresence>
                                        {messages.map((message, index) => (
                                            <motion.div
                                                key={message.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ duration: 0.3 }}
                                                className={`flex max-w-full ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                {message.sender === 'user' ? (
                                                    <div className="p-4 bg-blue-600/90 text-white rounded-2xl shadow-md rounded-br-none border border-blue-500/50 max-w-full">
                                                        <div className="text-white">{message.content}</div>
                                                    </div>
                                                ) : (
                                                    <div className="p-4 bg-white text-gray-800 relative group max-w-full">
                                                        <div className="prose prose-gray max-w-full">
                                                            <MessageContent
                                                                message={message}
                                                                isNew={index === messages.length - 1}
                                                                isAlreadyDisplayed={displayedMessageIds.includes(
                                                                    message.id
                                                                )}
                                                                onDisplayed={() =>
                                                                    markMessageAsDisplayed(message.id)
                                                                }
                                                                onStopTyping={() => {
                                                                    setIsTyping(false);
                                                                    stopTypingRef.current = null;
                                                                }}
                                                                setStopTypingRef={(fn: () => void) =>
                                                                    (stopTypingRef.current = fn)
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                        {isLoading && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="flex justify-start"
                                            >
                                                <div className="flex flex-col items-start bg-gray-100 p-4 rounded-2xl shadow-sm">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <motion.div
                                                            animate={{
                                                                rotate: [0, 360],
                                                            }}
                                                            transition={{
                                                                duration: 2,
                                                                repeat: Infinity,
                                                                ease: "linear"
                                                            }}
                                                            className="w-6 h-6 text-blue-500"
                                                        >
                                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M12 6V12L16 14" strokeLinecap="round" />
                                                                <circle cx="12" cy="12" r="10" strokeLinecap="round" />
                                                            </svg>
                                                        </motion.div>
                                                        <span className="text-blue-700 font-medium text-sm">{thinkingPhrase}</span>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        {[0, 1, 2].map((i) => (
                                                            <motion.div
                                                                key={i}
                                                                custom={i}
                                                                variants={dotVariants}
                                                                initial="initial"
                                                                animate="animate"
                                                                className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Container */}
                                <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
                                    <div className="relative flex items-center gap-3">
                                        <input
                                            type="text"
                                            value={inputMessage}
                                            onChange={handleInputChange}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Type your question..."
                                            className="flex-1 p-3 pr-12 bg-white text-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-gray-400 transition-all duration-200 text-sm border border-gray-300"
                                            aria-label="Chat input"
                                            disabled={isTyping || isLoading}
                                        />
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={handleAction}
                                            disabled={isTyping ? false : !inputMessage.trim() || isLoading}
                                            className={`absolute right-2 p-2 rounded-full transition-colors ${
                                                isTyping
                                                    ? 'bg-red-600 hover:bg-red-700'
                                                    : !inputMessage.trim() || isLoading
                                                        ? 'bg-gray-300 cursor-not-allowed'
                                                        : 'bg-blue-600 hover:bg-blue-700'
                                            }`}
                                            aria-label={isTyping ? 'Stop typing' : 'Send message'}
                                        >
                                            {isTyping ? (
                                                <X className="w-4 h-4 text-white" />
                                            ) : (
                                                <Send className="w-4 h-4 text-white" />
                                            )}
                                        </motion.button>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIChatDrawer;