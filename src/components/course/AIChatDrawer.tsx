import React, {useState, useCallback, KeyboardEvent, ChangeEvent, useRef, useEffect} from 'react';
import {MessageCircle, X, Send, Loader2, MinusCircle, Bot, ChevronUp, ChevronDown, Check, Copy} from 'lucide-react';

export interface Message {
    id: number;
    content: string;
    sender: 'user' | 'ai';
    timestamp: string;
    type?: 'text' | 'code';
    language?: string;
}

interface AIChatDrawerProps {
    className?: string;
    position?: 'left' | 'right';
    messages: Message[];
    onSendMessage: (message: string) => Promise<void>;
}

const CodeBlock: React.FC<{ content: string; language?: string }> = ({ content, language }) => {
    const [isCopied, setIsCopied] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const codeRef = useRef<HTMLPreElement>(null);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const isLongCode = content.split('\n').length > 10;

    return (
        <div className="relative font-mono text-sm bg-gray-900 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-gray-400 text-xs">
                <span>{language || 'code'}</span>
                <div className="flex items-center gap-2">
                    {isLongCode && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="hover:text-white transition-colors"
                            aria-label={isExpanded ? 'Show less' : 'Show more'}
                        >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                    )}
                    <button
                        onClick={copyToClipboard}
                        className="hover:text-white transition-colors"
                        aria-label="Copy code"
                    >
                        {isCopied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                </div>
            </div>
            {/* Code Content */}
            <pre
                ref={codeRef}
                className={`p-4 text-gray-100 overflow-x-auto ${!isExpanded && isLongCode ? 'max-h-[250px]' : ''}`}
            >
                <code>{content}</code>
            </pre>
        </div>
    );
};

const MessageContent: React.FC<{ message: Message }> = ({ message }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const [isLongContent, setIsLongContent] = useState(false);

    useEffect(() => {
        if (contentRef.current) {
            setIsLongContent(contentRef.current.scrollHeight > 300);
        }
    }, [message.content]);

    const getMessageContent = () => {
        if (message.type === 'code') {
            return <CodeBlock content={message.content} language={message.language} />;
        }

        // Detect if the content contains code blocks (marked with ```)
        const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = codeBlockRegex.exec(message.content)) !== null) {
            // Add text before code block
            if (match.index > lastIndex) {
                parts.push({
                    type: 'text',
                    content: message.content.slice(lastIndex, match.index)
                });
            }

            // Add code block
            parts.push({
                type: 'code',
                language: match[1] || undefined,
                content: match[2].trim()
            });

            lastIndex = match.index + match[0].length;
        }

        // Add remaining text
        if (lastIndex < message.content.length) {
            parts.push({
                type: 'text',
                content: message.content.slice(lastIndex)
            });
        }

        return parts.length > 0 ? (
            <div className="space-y-3">
                {parts.map((part, index) => (
                    part.type === 'code' ? (
                        <CodeBlock key={index} content={part.content} language={part.language} />
                    ) : (
                        <div key={index} className="whitespace-pre-wrap">{part.content}</div>
                    )
                ))}
            </div>
        ) : (
            <div className="whitespace-pre-wrap">{message.content}</div>
        );
    };

    return (
        <div
            ref={contentRef}
            className={`${!isExpanded && isLongContent ? 'max-h-[300px] overflow-hidden relative' : ''}`}
        >
            {getMessageContent()}
            {isLongContent && !isExpanded && (
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-gray-800 to-transparent pointer-events-none" />
            )}
            {isLongContent && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                    {isExpanded ? 'Hiển thị ít hơn' : 'Xem thêm'}
                </button>
            )}
        </div>
    );
};

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
            await onSendMessage(inputMessage);
            setInputMessage('');
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