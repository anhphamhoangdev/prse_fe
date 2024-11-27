import React, {useState, useCallback, KeyboardEvent, ChangeEvent, useRef, useEffect} from 'react';
import {MessageCircle, X, Send, Loader2, MinusCircle, Bot, ChevronUp, ChevronDown, Check, Copy} from 'lucide-react';
import {Message} from "postcss";
import {MessageContent} from "./MessageContent";



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
                                                       onSendMessage
                                                   }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isMinimized, setIsMinimized] = useState<boolean>(false);
    const [inputMessage, setInputMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showHint, setShowHint] = useState<boolean>(true);

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

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


    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setInputMessage(e.target.value);
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const positionStyles = position === 'right' ? 'right-6' : 'left-6';

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <>
            {/* Enhanced Chat Toggle Button with Floating Hint */}
            <div className={`fixed bottom-6 ${positionStyles} z-50 ${isOpen ? 'hidden' : 'block'}`}>
                {showHint && (
                    <div className="absolute bottom-full mb-4 w-36 transform -translate-x-1/2 left-1/2">
                        <div className="bg-white p-3 rounded-lg shadow-lg border border-blue-100 animate-bounce">
                            <p className="text-sm text-center text-gray-600">
                                Bạn cần hỗ trợ ? Hãy hỏi AI 👋
                            </p>
                        </div>
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-4 h-4 bg-white border-r border-b border-blue-100"></div>
                    </div>
                )}
                <button
                    onClick={() => {
                        setIsOpen(true);
                        setIsMinimized(false);
                        setShowHint(false);
                    }}
                    className="group flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full shadow-lg hover:shadow-blue-200 hover:scale-105 transition-all duration-300"
                >
                    <div className="relative">
                        <Bot className="w-6 h-6" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                    </div>
                    <span className="font-medium">Hỏi AI</span>
                </button>
            </div>

            {/* Chat Drawer with Enhanced UI */}
            <div className={`fixed ${positionStyles} bottom-6 w-[450px] bg-white rounded-lg shadow-xl transition-all duration-300 z-50 
                ${isOpen ? 'translate-y-0 shadow-2xl' : 'translate-y-full hidden'}
                ${isMinimized ? 'h-14' : 'h-[600px]'} ${className}`}
            >
                {/* Enhanced Header */}
                <div
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-t-lg">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Bot className="w-6 h-6"/>
                            <span
                                className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                        </div>
                        <div>
                            <h3 className="font-medium">Trợ lý AI</h3>
                            <p className="text-xs text-blue-100">Luôn sẵn sàng hỗ trợ bạn</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsMinimized(!isMinimized)}
                            className="p-1 hover:bg-white/20 rounded-full transition-colors"
                            aria-label={isMinimized ? 'Expand chat' : 'Minimize chat'}
                        >
                            <MinusCircle className="w-5 h-5"/>
                        </button>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-white/20 rounded-full transition-colors"
                            aria-label="Close chat"
                        >
                            <X className="w-5 h-5"/>
                        </button>
                    </div>
                </div>

                {!isMinimized && (
                    <>
                        {/* Enhanced Messages Container */}
                        <div className="flex-1 p-4 space-y-4 overflow-y-auto h-[calc(100%-8rem)] bg-gray-50">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {message.sender === 'ai' && (
                                        <div
                                            className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
                                            <Bot className="w-5 h-5 text-blue-600"/>
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[85%] p-3 rounded-lg shadow-sm ${
                                            message.sender === 'user'
                                                ? 'bg-blue-600 text-white rounded-br-none'
                                                : 'bg-white text-gray-800 rounded-bl-none'
                                        }`}
                                    >
                                        {/* Sử dụng MessageContent component mới */}
                                        <MessageContent message={message}/>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div
                                        className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                                        <Bot className="w-5 h-5 text-blue-600"/>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg shadow-sm">
                                        <Loader2 className="w-5 h-5 animate-spin text-blue-500"/>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef}/>
                        </div>

                        {/* Enhanced Input Container */}
                        <div className="p-4 bg-white border-t">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={handleInputChange}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Nhập câu hỏi của bạn..."
                                    className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                    aria-label="Chat input"
                                />
                                <button
                                    onClick={() => handleSendMessage()}
                                    disabled={!inputMessage.trim() || isLoading}
                                    className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                    aria-label="Send message"
                                >
                                    <Send className="w-5 h-5"/>
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default AIChatDrawer;