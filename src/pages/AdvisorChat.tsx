import React, { useState, useEffect, useRef } from 'react';
import { MainLayout } from "../layouts/MainLayout";
import {Bot, Loader2, PlusCircle, Send, User} from 'lucide-react';
import { useNotification } from "../components/notification/NotificationProvider";
import { Course } from "../models/Course";
import { CourseHomeSection } from "../components/course/CourseHomeSection";
import { getHomeDiscountCourse, getHomeHotCourse } from "../services/courseService";
import {AIResponse, Message} from "../types/chat";
import {SearchHeaderAndFooterLayout} from "../layouts/UserLayout";
import {MessageUtils} from "../utils/messageUtil";
import {sendMessageAI, sendMessageAIRecommendation} from "../services/chatService";
import {LoadingMessage} from "../components/LoadingMessage";

const LOADING_MESSAGES = [
    "Đang tìm kiếm những khóa học hoàn hảo dành riêng cho bạn...",
    "Chúng tôi đang lựa chọn những khóa học tuyệt vời nhất cho nhu cầu của bạn...",
    "Đang phân tích yêu cầu của bạn để tìm ra những điều tốt nhất...",
    "Hãy chờ một chút, những khóa học đỉnh cao đang trên đường đến với bạn!",
    "Đang tìm kiếm những gợi ý học tập thú vị nhất cho bạn...",
    "Chúng tôi đang khám phá các tùy chọn học tập đẳng cấp cho bạn!",
    "Hãy thư giãn, những nguồn học liệu chất lượng đang được kết nối...",
    "Một chút thời gian nữa thôi, những khóa học hấp dẫn đang sắp xuất hiện!",
    "Đang thu thập thông tin từ những khóa học mới nhất để phục vụ bạn...",
    "Những gợi ý tuyệt vời đang được chuẩn bị, hãy sẵn sàng nhé!",
    "Chúng tôi đang nấu nướng những ý tưởng học thú vị cho bạn!",
    "Hãy đợi một chút, những kho báu kiến thức đang được khai thác!",
    "Đang sắp xếp những điều thú vị mà bạn sẽ khám phá ngay!",
    "Chúng tôi đang thổi hồn vào những khóa học độc đáo chỉ dành cho bạn!",
    "Hãy cùng chờ xem, những điều bất ngờ đang chờ đón bạn phía trước!",
    "Chúng tôi đang lắng nghe trái tim của bạn để mang đến trải nghiệm học tập tuyệt vời nhất...",
    "Đang tìm kiếm những ngôi sao học tập sẽ tỏa sáng trong hành trình của bạn!",
    "Chúng tôi đang làm việc chăm chỉ để mang đến cho bạn những lựa chọn học tập tuyệt vời nhất!",
    "Đang kết nối những ý tưởng sáng tạo với mong muốn của bạn...",
    "Hãy chuẩn bị cho một hành trình học tập đầy thú vị và bất ngờ!",
    "Chúng tôi đang chăm sóc từng chi tiết để mang đến cho bạn trải nghiệm hoàn hảo!",
    "Đang mở ra cánh cửa dẫn đến những kiến thức mới mẻ và hấp dẫn cho bạn!"
];

export function AdvisorChat() {
    const { showNotification } = useNotification();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    // Thêm các state và functions mới
    const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);


    // Chat states
    const [messages, setMessages] = useState<Message[]>([{
        id: 1,
        content: 'Xin chào! Mình là trợ lý AI của EasyEdu. Mình có thể giúp gì cho bạn về việc chọn khóa học phù hợp không?',
        sender: 'ai',
        timestamp: new Date().toISOString(),
        type: 'text'
    }]);
    const [inputMessage, setInputMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Course recommendation states
    const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState<string>("");



    const messagesContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Chỉ scroll xuống khi có tin nhắn mới hoặc đang loading
        if (messages[messages.length - 1]?.sender === 'user' || isLoading) {
            // Scroll container tin nhắn xuống cuối
            if (messagesContainerRef.current) {
                messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
            }
        }
    }, [messages, isLoading]);

    const scrollToMessage = (messageId: number) => {
        setSelectedMessageId(messageId);
        const messageElement = document.getElementById(`message-${messageId}`);
        if (messageElement) {
            messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Highlight message
            messageElement.classList.add('bg-blue-50');
            setTimeout(() => {
                messageElement.classList.remove('bg-blue-50');
            }, 2000);
        }
    };

    const formatMessage = (message: string) => {
        return message.split('\n').map((line, i) => {
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const boldRegex = /\*\*(.*?)\*\*/g;
            const italicRegex = /_(.*?)_/g;
            const strikethroughRegex = /~~(.*?)~~/g;

            const formattedLine = line
                .replace(urlRegex, '[[URL:$1]]') // Tạm thay URL
                .replace(boldRegex, '[[BOLD:$1]]') // Tạm thay in đậm
                .replace(italicRegex, '[[ITALIC:$1]]') // Tạm thay in nghiêng
                .replace(strikethroughRegex, '[[STRIKETHROUGH:$1]]'); // Tạm thay gạch ngang

            const parts = formattedLine.split(/\[\[(.*?)\]\]/);

            return (
                <React.Fragment key={i}>
                    {parts.map((part, j) => {
                        if (part.startsWith('URL:')) {
                            return (
                                <a
                                    key={j}
                                    href={part.substring(4)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline hover:text-blue-800 transition-colors"
                                >
                                    {part.substring(4)}
                                </a>
                            );
                        } else if (part.startsWith('BOLD:')) {
                            return <strong key={j}>{part.substring(5)}</strong>;
                        } else if (part.startsWith('ITALIC:')) {
                            return <em key={j}>{part.substring(7)}</em>;
                        } else if (part.startsWith('STRIKETHROUGH:')) {
                            return <del key={j}>{part.substring(14)}</del>;
                        } else {
                            return part; // Văn bản thông thường
                        }
                    })}
                    <br />
                </React.Fragment>
            );
        });
    };

    const startNewChat = () => {
        setMessages([{
            id: Date.now(),
            content: 'Xin chào! Mình là trợ lý AI của EasyEdu. Mình có thể giúp gì cho bạn về việc chọn khóa học phù hợp không?',
            sender: 'ai',
            timestamp: new Date().toISOString(),
            type: 'text'
        }]);
        setInputMessage('');
        setSelectedMessageId(null);
    };


    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        try {
            setIsLoading(true);
            setLoadingMessage(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);

            // Add user message
            const userMessage = MessageUtils.createUserMessage(inputMessage);
            setMessages(prev => [...prev, userMessage]);
            setInputMessage('');

            // Get AI response using sendMessageAI
            const response = await sendMessageAIRecommendation(inputMessage);

            if (response.code === 1 && response.data?.message) {
                // Add AI response
                const aiMessage = MessageUtils.createAIMessage(response.data.message);
                setMessages(prev => [...prev, aiMessage]);

            } else {
                throw new Error('Failed to get AI response');
            }

        } catch (error) {
            // Add system error message
            const errorMessage = MessageUtils.createErrorMessage(
                'Không thể kết nối với trợ lý AI. Vui lòng thử lại sau.'
            );
            setMessages(prev => [...prev, errorMessage]);

            showNotification(
                'error',
                'Lỗi',
                'Không thể kết nối với trợ lý AI. Vui lòng thử lại sau.'
            );
        } finally {
            setIsLoading(false);
            setLoadingMessage("");
        }
    };

    return (
        <SearchHeaderAndFooterLayout>
            <div className="h-[calc(100vh-64px)] flex">
                {/* Left Sidebar - Message List */}
                <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
                    {/* Sidebar Header */}
                    <div className="h-[76px] p-4 border-b border-slate-200"> {/* Thêm height đồng bộ */}
                        <div className="h-full flex flex-col justify-center"> {/* Thêm container để căn giữa */}
                            <h2 className="text-lg font-semibold text-slate-800">Tin nhắn</h2>
                            <p className="text-sm text-slate-500">Trò chuyện với AI EasyEdu</p>
                        </div>
                    </div>

                    {/* Message List */}
                    <div className="flex-1 overflow-y-auto">
                        {messages.map((msg, index) => (
                            msg.sender === 'user' && (
                                <div
                                    key={msg.id}
                                    onClick={() => scrollToMessage(msg.id)}
                                    className={`p-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors
                           ${selectedMessageId === msg.id ? 'bg-blue-50' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                            <User className="w-5 h-5 text-blue-600"/>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-slate-800">Bạn</p>
                                            <p className="text-sm text-slate-500 truncate">
                                                {msg.content}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {new Date(msg.timestamp).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>

                    {/* New Chat Button */}
                    <div
                        className="p-3 border-t border-slate-200 h-[72px] flex items-center"> {/* Thêm height cố định và flex */}
                        <button
                            onClick={startNewChat}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4
                 bg-blue-600 text-white rounded-xl hover:bg-blue-700
                 transition-colors"
                        >
                            <PlusCircle className="w-5 h-5"/>
                            <span>Cuộc trò chuyện mới</span>
                        </button>
                    </div>
                </div>

                {/* Right Side - Main Chat Area */}
                <div className="flex-1 flex flex-col">
                    {/* Chat Header */}
                    <div
                        className="h-[76px] p-4 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400"> {/* Thêm height cố định */}
                        <div className="flex items-center justify-between max-w-7xl mx-auto h-full"> {/* Thêm h-full */}
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div
                                        className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                                        <Bot className="w-6 h-6 text-white"/>
                                    </div>
                                    <span
                                        className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-white">Trợ lý AI EasyEdu</h1>
                                </div>
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-sm text-blue-100 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                                    Hỏi AI về bất kỳ khóa học nào bạn quan tâm
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* Chat Messages */}
                    <div
                        ref={messagesContainerRef}
                        className="flex-1 overflow-y-auto bg-gradient-to-b from-blue-50 to-white"
                    >
                        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    id={`message-${message.id}`}
                                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}
                          transition-colors duration-300`}
                                >
                                    {message.sender === 'ai' && (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-100 to-blue-200
                                                flex items-center justify-center mr-3 shadow-sm">
                                            <Bot className="w-6 h-6 text-blue-600" />
                                        </div>
                                    )}
                                    <div className={`max-w-[80%] p-4 ${
                                        message.sender === 'user'
                                            ? 'bg-blue-600 text-white rounded-2xl rounded-br-none shadow-md'
                                            : message.sender === 'system'
                                                ? 'bg-red-50 text-red-600 border border-red-100 rounded-2xl'
                                                : 'bg-white text-slate-800 rounded-2xl rounded-bl-none shadow-md'
                                    }`}>
                                        <p className="leading-relaxed">{formatMessage(message.content)}</p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && <LoadingMessage/>}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-slate-200 bg-white h-[72px] flex items-center p-3"> {/* Thêm height đồng bộ */}
                        <div className="max-w-4xl mx-auto flex items-center gap-3 w-full">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Hỏi AI về khóa học bạn quan tâm..."
                                className="flex-1 py-3 px-4 bg-slate-100 border-0 rounded-xl focus:outline-none focus:ring-2
                     focus:ring-blue-500 transition-all placeholder:text-slate-400"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputMessage.trim() || isLoading}
                                className="py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700
                     disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors
                     flex items-center gap-2 min-w-[100px] justify-center"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <span>Gửi</span>
                                        <Send className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </SearchHeaderAndFooterLayout>
    );
}