import React, { useState, useEffect, useRef } from 'react';
import { Bot, Loader2, Send, User } from 'lucide-react';
import { SearchHeaderAndFooterLayout } from '../layouts/UserLayout';
import { useNotification } from '../components/notification/NotificationProvider';
import { MessageUtils } from '../utils/messageUtil';
import { sendMessageAIRecommendation } from '../services/chatService';
import { Message } from '../types/chat';

// Danh sách loading messages
const LOADING_MESSAGES = [
    'Đang tìm kiếm khóa học phù hợp...',
    'Gợi ý tuyệt vời đang được chuẩn bị...',
    'Đang phân tích yêu cầu của bạn...',
    'Khóa học đỉnh cao sắp xuất hiện...',
];

// Component hiển thị tin nhắn đang loading
const LoadingIndicator = () => {
    const [loadingText, setLoadingText] = useState(LOADING_MESSAGES[0]);
    const [dots, setDots] = useState('');

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * LOADING_MESSAGES.length);
        setLoadingText(LOADING_MESSAGES[randomIndex]);
        const dotsInterval = setInterval(() => {
            setDots(prev => (prev.length < 3 ? prev + '.' : ''));
        }, 500);
        return () => clearInterval(dotsInterval);
    }, []);

    return (
        <div className="flex items-center space-x-3 p-4 rounded-xl bg-blue-50 max-w-md animate-pulse">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
                <p className="text-blue-800 font-medium">
                    {loadingText}
                    <span>{dots}</span>
                </p>
            </div>
        </div>
    );
};

export function AdvisorChat() {
    // State và Refs
    const { showNotification } = useNotification();
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const [isInitialRender, setIsInitialRender] = useState(true);

    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            content: 'Xin chào! Mình là trợ lý AI của EasyEdu. Mình có thể giúp gì cho bạn về việc chọn khóa học phù hợp không?',
            sender: 'ai',
            timestamp: new Date().toISOString(),
            type: 'text',
        },
    ]);
    const [inputMessage, setInputMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Xử lý scroll khi có tin nhắn mới
    useEffect(() => {
        if (isInitialRender) {
            setIsInitialRender(false);
            return; // Bỏ qua cuộn trong lần render đầu tiên
        }

        if (chatContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
            const isUserSentMessage = messages.length > 0 && messages[messages.length - 1].sender === 'user';
            const isAIMessageReceived = messages.length > 0 && messages[messages.length - 1].sender === 'ai';

            if ((isUserSentMessage || isAIMessageReceived) && isNearBottom) {
                chatContainerRef.current.scrollTo({
                    top: chatContainerRef.current.scrollHeight,
                    behavior: 'smooth',
                });
            }
        }
    }, [messages]);

    // Điều chỉnh chiều cao input khi gõ nhiều dòng
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = '56px'; // Reset height
            inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
        }
    }, [inputMessage]);

    // Format tin nhắn với markdown
    const formatMessage = (content: string) => {
        return content.split('\n').map((line, index) => {
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const boldRegex = /\*\*(.*?)\*\*/g;
            const italicRegex = /_(.*?)_/g;

            let formattedLine = line
                .replace(urlRegex, '[[URL:$1]]')
                .replace(boldRegex, '[[BOLD:$1]]')
                .replace(italicRegex, '[[ITALIC:$1]]');

            const parts = formattedLine.split(/\[\[(.*?)\]\]/);

            return (
                <React.Fragment key={index}>
                    {parts.map((part, j) => {
                        if (part.startsWith('URL:')) {
                            const url = part.substring(4);
                            return (
                                <a
                                    key={j}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                >
                                    {url}
                                </a>
                            );
                        }
                        if (part.startsWith('BOLD:')) return <strong key={j}>{part.substring(5)}</strong>;
                        if (part.startsWith('ITALIC:')) return <em key={j}>{part.substring(7)}</em>;
                        return part;
                    })}
                    <br />
                </React.Fragment>
            );
        });
    };

    // Xử lý gửi tin nhắn
    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = MessageUtils.createUserMessage(inputMessage);
        setMessages(prev => [...prev, userMessage]);

        setInputMessage('');
        setIsLoading(true);

        // Cuộn xuống ngay sau khi gửi tin nhắn
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }

        try {
            const response = await sendMessageAIRecommendation(inputMessage);
            if (response.code === 1 && response.data?.message) {
                setMessages(prev => [...prev, MessageUtils.createAIMessage(response.data.message)]);
            } else {
                throw new Error('Invalid AI response');
            }
        } catch (error) {
            const errorMessage: Message = {
                id: Date.now(),
                content: 'Không thể kết nối với trợ lý AI. Vui lòng thử lại sau.',
                sender: 'system',
                timestamp: new Date().toISOString(),
                type: 'system',
            };
            setMessages(prev => [...prev, errorMessage]);
            showNotification('error', 'Lỗi kết nối', 'Không thể kết nối với trợ lý AI. Vui lòng thử lại sau.');
        } finally {
            setIsLoading(false);
        }
    };

    // Xử lý khi nhấn Enter (gửi tin nhắn)
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <SearchHeaderAndFooterLayout>
            <div className="flex h-[calc(100vh-128px)] bg-gray-100">
                {/* Khu vực chat chính */}
                <div className="flex flex-1 flex-col bg-white rounded-lg shadow-sm overflow-hidden mx-2 my-2 md:mx-4 md:my-4">
                    {/* Header của khu vực chat */}
                    <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-600 p-2 rounded-full">
                                <Bot className="h-5 w-5 text-white" />
                            </div>
                            <h1 className="font-medium text-lg">Trợ lý AI EasyEdu</h1>
                        </div>
                    </div>

                    {/* Khu vực tin nhắn */}
                    <div
                        ref={chatContainerRef}
                        className="flex-1 overflow-y-auto p-4 bg-gray-50"
                        style={{ scrollBehavior: 'smooth', maxHeight: '100%' }}
                    >
                        <div className="max-w-3xl mx-auto space-y-6">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {message.sender === 'ai' && (
                                        <div className="flex-shrink-0 mr-3">
                                            <div className="bg-blue-600 rounded-full p-2 flex items-center justify-center">
                                                <Bot className="h-5 w-5 text-white" />
                                            </div>
                                        </div>
                                    )}

                                    <div
                                        className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm ${
                                            message.sender === 'user'
                                                ? 'bg-blue-600 text-white'
                                                : message.sender === 'system'
                                                    ? 'bg-red-50 border border-red-100 text-red-600'
                                                    : 'bg-white border border-gray-100'
                                        }`}
                                    >
                                        <div className="text-base mb-1">{formatMessage(message.content)}</div>
                                        <div
                                            className={`text-xs ${
                                                message.sender === 'user' ? 'text-blue-200' : 'text-gray-400'
                                            }`}
                                        >
                                            {new Date(message.timestamp).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </div>
                                    </div>

                                    {message.sender === 'user' && (
                                        <div className="flex-shrink-0 ml-3">
                                            <div className="bg-gray-200 rounded-full p-2 flex items-center justify-center">
                                                <User className="h-5 w-5 text-gray-600" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {isLoading && <LoadingIndicator />}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Input area */}
                    <div className="border-t border-gray-100 bg-white p-4">
                        <div className="max-w-3xl mx-auto relative">
                            <textarea
                                ref={inputRef}
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Hỏi về khóa học phù hợp với bạn..."
                                className="w-full px-4 py-3 pr-12 bg-gray-50 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white border border-gray-200 shadow-sm transition-all"
                                style={{ minHeight: '56px', maxHeight: '120px' }}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputMessage.trim() || isLoading}
                                className={`absolute right-3 bottom-3 p-2 rounded-full ${
                                    !inputMessage.trim() || isLoading
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                } transition-colors`}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Send className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                        <div className="text-xs text-center mt-2 text-gray-400">
                            Nhấn Enter để gửi, Shift+Enter để xuống dòng
                        </div>
                    </div>
                </div>
            </div>
        </SearchHeaderAndFooterLayout>
    );
}