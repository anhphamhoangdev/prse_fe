import React, { useEffect, useState, useRef } from 'react';
import { SearchHeaderAndFooterLayout } from '../../layouts/UserLayout';
import { CourseSidebar } from "../../components/course/course-detail/CourseSidebar";
import { CourseContent } from "../../components/course/course-detail/CourseContent";
import { CourseHero } from "../../components/course/course-detail/CourseHero";
import { CourseOverview } from "../../components/course/course-detail/CourseOverview";
import { Chapter, CourseBasicDTO, CourseCurriculumDTO, FeedbackData } from "../../types/course";
import { useNavigate, useParams } from "react-router-dom";
import { getBasicDetailCourse, getCourseCurriculum, getCourseFeedbacks } from "../../services/courseService";
import { CourseNotFound } from "../../components/course/course-detail/CourseNotFound";
import CourseContentLoading from "../../components/course/course-detail/CourseContentLoading";
import { getLessonPath } from "../../types/lesson";
import { requestPostWithAuth, requestWithAuth } from "../../utils/request";
import { useNotification } from "../../components/notification/NotificationProvider";
import { addToCart } from "../../services/cartService";
import { useUser } from '../../context/UserContext';
import { useStudentWebSocket } from '../../context/StudentWebSocketContext';
import { ChatMessageDTO } from '../../types/chat';
import { WebSocketMessage } from '../../types/websocket';
import { webSocketService } from '../../services/instructor/webSocketService';

const handleLessonClick = (chapterId: number, lessonId: number) => {
    console.log(`Navigating to lesson ${lessonId} in chapter ${chapterId}`);
};

const handleBuyNow = () => {
    console.log('Processing purchase...');
};

const TabButton: React.FC<{
    tab: 'overview' | 'content' | 'messages';
    label: string;
    onClick: () => void;
    isActive: boolean;
}> = ({ tab, label, onClick, isActive }) => (
    <button
        className={`pb-4 px-2 ${isActive ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        onClick={onClick}
    >
        {label}
    </button>
);

const CourseDetail: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { user, isLoggedIn } = useUser();
    const { subscribeToConversation, unsubscribeFromConversation, sendMessage } = useStudentWebSocket();
    const { showNotification } = useNotification();

    const [basicInfo, setBasicInfo] = useState<CourseBasicDTO | null>(null);
    const [curriculum, setCurriculum] = useState<CourseCurriculumDTO | null>(null);
    const [isLoadingCurriculum, setIsLoadingCurriculum] = useState(false);
    const [expandedChapters, setExpandedChapters] = useState<Record<number, boolean>>({});
    const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'messages'>('overview');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
    const [feedbackMeta, setFeedbackMeta] = useState({
        total: 0,
        currentPage: 1,
        hasMore: true
    });
    const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessageDTO[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [isSubscribed, setIsSubscribed] = useState(false);
    const messageHandlerRef = useRef<((message: WebSocketMessage) => void) | null>(null);
    const conversationIdRef = useRef<string | null>(null);

    const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
    const chatContainerRef = useRef<HTMLDivElement>(null);



    const isNearBottom = () => {
        if (chatContainerRef.current) {
            const container = chatContainerRef.current;
            const threshold = 150; // Khoảng cách tính bằng pixel từ cuối cửa sổ
            return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
        }
        return true;
    };

    const handleScroll = () => {
        if (chatContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
            const threshold = 150;
            setShouldScrollToBottom(scrollHeight - scrollTop - clientHeight < threshold);
        }
    };


    const handleAddToCartSuccess = () => {
        showNotification('success', 'Thành công', 'Khóa học đã được thêm vào giỏ hàng thành công');
    };

    const handleAddToCartError = (message: string) => {
        showNotification('error', 'Không thành công', message);
    };

    const updateHeaderCartCount = () => {
        const event = new CustomEvent('cartUpdated');
        window.dispatchEvent(event);
    };

    const handleAddToCart = async () => {
        try {
            const response = await addToCart(Number(id));
            if (response.code === 1) {
                updateHeaderCartCount();
                handleAddToCartSuccess();
            } else {
                handleAddToCartError(response.error_message ? response.error_message : 'Có lỗi xảy ra khi thêm vào giỏ hàng');
            }
        } catch (error) {
            console.error('Add to cart error:', error);
            handleAddToCartError('Có lỗi xảy ra khi thêm vào giỏ hàng');
        }
    };

    useEffect(() => {
        const fetchBasicInfo = async () => {
            setIsLoading(true);
            setError(null);
            try {
                if (!id) {
                    throw new Error('Course ID is required');
                }
                const data = await getBasicDetailCourse(Number(id));
                if (data === null) {
                    setBasicInfo(null);
                    return;
                }
                setBasicInfo(data);
            } catch (err) {
                const error = err instanceof Error ? err : new Error('An unknown error occurred');
                setError(error);
                setBasicInfo(null);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchBasicInfo();
        } else {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        const fetchInitialFeedbacks = async () => {
            if (!id) return;
            setIsLoadingFeedbacks(true);
            try {
                const data = await getCourseFeedbacks(Number(id), 1);
                if (data) {
                    setFeedbacks(data.items);
                    setFeedbackMeta({
                        total: data.total,
                        currentPage: 2,
                        hasMore: data.hasMore
                    });
                } else {
                    setFeedbacks([]);
                    setFeedbackMeta({
                        total: 0,
                        currentPage: 1,
                        hasMore: false
                    });
                }
            } catch (error) {
                console.error('[CourseDetail] Error loading initial feedbacks:', error);
                setFeedbacks([]);
            } finally {
                setIsLoadingFeedbacks(false);
            }
        };

        fetchInitialFeedbacks();
    }, [id]);

    const loadMoreFeedbacks = async () => {
        if (!id || !feedbackMeta.hasMore || isLoadingFeedbacks) return;
        setIsLoadingFeedbacks(true);
        try {
            const data = await getCourseFeedbacks(Number(id), feedbackMeta.currentPage);
            if (data) {
                setFeedbacks(prev => [...prev, ...data.items]);
                setFeedbackMeta({
                    total: data.total,
                    currentPage: feedbackMeta.currentPage + 1,
                    hasMore: data.hasMore
                });
            }
        } catch (error) {
            console.error('[CourseDetail] Error loading more feedbacks:', error);
        } finally {
            setIsLoadingFeedbacks(false);
        }
    };

    const fetchCurriculum = async (courseId: number) => {
        try {
            setIsLoadingCurriculum(true);
            const data = await getCourseCurriculum(courseId);
            setCurriculum(data);
            return data;
        } catch (error) {
            console.error('Failed to fetch curriculum:', error);
            return null;
        } finally {
            setIsLoadingCurriculum(false);
        }
    };

    useEffect(() => {
        const loadCurriculum = async () => {
            if (activeTab === 'content' && !curriculum && id) {
                await fetchCurriculum(Number(id));
            }
        };
        loadCurriculum();
    }, [activeTab, curriculum, id]);

    const fetchFeedbacks = async (courseId: number, page: number) => {
        setIsLoadingFeedbacks(true);
        try {
            const data = await getCourseFeedbacks(courseId, page);
            return data;
        } catch (error) {
            console.error('[CourseDetail] Error loading feedbacks:', error);
            throw error;
        } finally {
            setIsLoadingFeedbacks(false);
        }
    };

    const handleSubmitFeedback = async (rating: number, comment: string) => {
        if (!id) return;
        try {
            const feedbackData = {
                courseId: Number(id),
                rating: rating,
                comment: comment.trim()
            };
            await requestPostWithAuth<void>('/course/feedback', feedbackData);
            const data = await fetchFeedbacks(Number(id), 1);
            if (data) {
                setFeedbacks(data.items);
                setFeedbackMeta({
                    total: data.total,
                    currentPage: 2,
                    hasMore: data.hasMore
                });
                showNotification('success', 'Thành công', 'Đánh giá của bạn đã được gửi thành công');
            } else {
                setFeedbacks([]);
                setFeedbackMeta({
                    total: 0,
                    currentPage: 1,
                    hasMore: false
                });
            }
        } catch (error) {
            console.error('[CourseDetail] Failed to submit feedback:', error);
            showNotification(
                'error',
                'Lỗi',
                error instanceof Error ? error.message : 'Không thể gửi đánh giá. Vui lòng thử lại sau.'
            );
        }
    };

    const findNextLesson = (chapters: Chapter[]): {
        chapterId: number;
        lessonId: number;
        type: string;
    } | null => {
        for (const chapter of chapters) {
            for (let i = 0; i < chapter.lessons.length; i++) {
                const currentLesson = chapter.lessons[i];
                if (!currentLesson.progress || currentLesson.progress.status !== 'completed') {
                    return {
                        chapterId: chapter.id,
                        lessonId: currentLesson.id,
                        type: currentLesson.type
                    };
                }
                if (currentLesson.progress?.status === 'completed' && i < chapter.lessons.length - 1) {
                    const nextLesson = chapter.lessons[i + 1];
                    if (!nextLesson.progress || nextLesson.progress.status !== 'completed') {
                        return {
                            chapterId: chapter.id,
                            lessonId: nextLesson.id,
                            type: nextLesson.type
                        };
                    }
                }
            }
        }
        if (chapters.length > 0 && chapters[0].lessons.length > 0) {
            return {
                chapterId: chapters[0].id,
                lessonId: chapters[0].lessons[0].id,
                type: chapters[0].lessons[0].type
            };
        }
        return null;
    };

    const handleStartLearning = (
        courseId: string | number,
        isEnrolled: boolean,
        chapters: Chapter[],
        navigate: (path: string) => void
    ): void => {
        if (!isEnrolled) return;
        const nextLesson = findNextLesson(chapters);
        if (nextLesson) {
            const path = getLessonPath(courseId, nextLesson.chapterId, nextLesson.lessonId, nextLesson.type);
            navigate(path);
        } else {
            console.warn('No lessons found in the course');
        }
    };

    const handleStartLearningClick = async () => {
        if (!id) return;
        let currentCurriculum = curriculum;
        if (!currentCurriculum) {
            const fetchedData = await fetchCurriculum(Number(id));
            if (!fetchedData) return;
            currentCurriculum = fetchedData;
        }
        if (currentCurriculum?.chapters) {
            handleStartLearning(Number(id), basicInfo?.enrolled ?? false, currentCurriculum.chapters, navigate);
        }
    };

    useEffect(() => {
        const fetchConversationAndMessages = async () => {
            if (activeTab === 'messages' && basicInfo?.enrolled && id && isLoggedIn && user && !isSubscribed) {
                setIsLoadingMessages(true);
                try {
                    const instructorId = basicInfo.instructor.id;
                    const conversationResponse = await requestPostWithAuth<{ conversationId: string }>(
                        '/conversations/create',
                        {
                            studentId: user.id,
                            instructorId,
                        }
                    );
                    const newConversationId = conversationResponse.conversationId;
                    setConversationId(newConversationId);
                    conversationIdRef.current = newConversationId;

                    // Subscribe to conversation
                    if (!isSubscribed) {
                        subscribeToConversation(newConversationId);
                        setIsSubscribed(true);
                    }

                    // Fetch initial messages
                    const messagesResponse = await requestWithAuth<{ messages: ChatMessageDTO[] }>(
                        `/conversations/chat/${newConversationId}/messages`
                    );
                    setMessages(messagesResponse.messages);

                    // Set up message handler
                    if (!messageHandlerRef.current) {
                        const handleMessage = (wsMessage: WebSocketMessage) => {
                            console.log('Received WebSocket message:', wsMessage);
                            if (wsMessage.type === 'NEW_MESSAGE' && wsMessage.data) {
                                const message = wsMessage.data as ChatMessageDTO;
                                if (message.conversationId === Number(newConversationId)) {
                                    setMessages((prev) => {
                                        // Kiểm tra trùng lặp dựa trên id (nếu có) hoặc nội dung và timestamp
                                        const isDuplicate = prev.some(
                                            (m) => m.id && message.id && m.id === message.id
                                        );
                                        if (!isDuplicate) {
                                            return [...prev, message];
                                        }
                                        return prev;
                                    });
                                }
                            }
                        };
                        webSocketService.addMessageHandler(handleMessage);
                        messageHandlerRef.current = handleMessage;
                    }
                } catch (error) {
                    console.error('Error fetching conversation/messages:', error);
                    showNotification('error', 'Lỗi', 'Không thể tải cuộc trò chuyện. Vui lòng thử lại.');
                } finally {
                    setIsLoadingMessages(false);
                }
            }
        };

        fetchConversationAndMessages();

        return () => {
            if (activeTab !== 'messages' && isSubscribed && conversationIdRef.current) {
                unsubscribeFromConversation(conversationIdRef.current);
                if (messageHandlerRef.current) {
                    webSocketService.removeMessageHandler(messageHandlerRef.current);
                    messageHandlerRef.current = null;
                }
                setIsSubscribed(false);
            }
        };
    }, [activeTab, basicInfo?.enrolled, basicInfo?.instructor?.id, id, isLoggedIn, user, isSubscribed]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !conversationId || !user || isSendingMessage) return;

        setIsSendingMessage(true);

        const chatMessage: ChatMessageDTO = {
            conversationId: parseInt(conversationId),
            senderId: user.id,
            senderType: 'STUDENT',
            senderName: user.fullName,
            content: newMessage,
            timestamp: new Date().toISOString(),
        };

        try {
            // Gửi tin nhắn qua WebSocket
            sendMessage('/app/send-message', chatMessage);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            showNotification('error', 'Lỗi', 'Không thể gửi tin nhắn. Vui lòng thử lại.');
        } finally {
            setIsSendingMessage(false);
        }
    };

    useEffect(() => {
        if (shouldScrollToBottom && messages.length && chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, shouldScrollToBottom]);

    useEffect(() => {
        if (newMessage === '' && chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            setShouldScrollToBottom(true);
        }
    }, [newMessage]);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !isSendingMessage) {
            handleSendMessage();
        }
    };

    if (isLoading) return (
        <div className="fixed inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin border-t-blue-600"></div>
        </div>
    );

    if (error || !basicInfo) {
        return <CourseNotFound />;
    }

    return (
        <SearchHeaderAndFooterLayout>
            <CourseHero
                courseData={basicInfo}
                onAddToCart={handleAddToCart}
                onBuyNow={handleAddToCart}
                onStartLearning={handleStartLearningClick}
            />
            <div className="container mx-auto px-4 py-8">
                <div className="flex space-x-8">
                    <div className="w-2/3">
                        <div className="border-b border-gray-200 mb-6">
                            <div className="flex space-x-8">
                                <TabButton
                                    tab="overview"
                                    label="Tổng quan"
                                    onClick={() => setActiveTab('overview')}
                                    isActive={activeTab === 'overview'}
                                />
                                <TabButton
                                    tab="content"
                                    label="Nội dung khoá học"
                                    onClick={() => setActiveTab('content')}
                                    isActive={activeTab === 'content'}
                                />
                                {basicInfo.enrolled && (
                                    <TabButton
                                        tab="messages"
                                        label="Tin nhắn"
                                        onClick={() => setActiveTab('messages')}
                                        isActive={activeTab === 'messages'}
                                    />
                                )}
                            </div>
                        </div>
                        {activeTab === 'overview' ? (
                            <CourseOverview
                                courseData={basicInfo}
                                feedbacks={feedbacks}
                                hasMoreFeedbacks={feedbackMeta.hasMore}
                                onLoadMoreFeedbacks={loadMoreFeedbacks}
                                onSubmitFeedback={handleSubmitFeedback}
                                isLoadingFeedback={isLoadingFeedbacks}
                            />
                        ) : activeTab === 'content' ? (
                            isLoadingCurriculum ? (
                                <CourseContentLoading />
                            ) : curriculum && (
                                <CourseContent
                                    curriculum={curriculum}
                                    expandedChapters={expandedChapters}
                                    setExpandedChapters={setExpandedChapters}
                                    isEnrolled={basicInfo.enrolled}
                                    courseId={id}
                                    onLessonClick={handleLessonClick}
                                />
                            )
                        ) : (
                            isLoadingMessages ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin border-t-blue-600"></div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg shadow-lg flex flex-col h-[500px]">
                                    {/* Header */}
                                    <div className="p-4 border-b border-gray-200">
                                        <h2 className="text-xl font-semibold text-gray-800">
                                            Trò chuyện với {basicInfo.instructor?.fullName || 'Giảng viên'}
                                        </h2>
                                    </div>

                                    {/* Chat Area */}
                                    <div
                                        ref={chatContainerRef}
                                        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
                                        onScroll={handleScroll}
                                    >
                                        {/* Nội dung tin nhắn vẫn giữ nguyên */}
                                        {messages.length === 0 ? (
                                            <div className="flex items-center justify-center h-full text-gray-500">
                                                Chưa có tin nhắn nào. Hãy bắt đầu trò chuyện!
                                            </div>
                                        ) : (
                                            messages.map((msg, index) => (
                                                <div
                                                    key={msg.id || index}
                                                    className={`flex ${
                                                        msg.senderType === 'STUDENT'
                                                            ? 'justify-end'
                                                            : 'justify-start'
                                                    } mb-2`}
                                                >
                                                    <div
                                                        className={`max-w-[70%] p-3 rounded-lg shadow-sm ${
                                                            msg.senderType === 'STUDENT'
                                                                ? 'bg-blue-500 text-white rounded-br-none'
                                                                : 'bg-gray-200 text-gray-800 rounded-bl-none'
                                                        }`}
                                                    >
                                                        <p className="text-sm">{msg.content}</p>
                                                        <span className="text-xs opacity-75 mt-1 block">
            {new Date(msg.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            })}
          </span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                        <div ref={messagesEndRef}/>
                                    </div>

                                    {/* Message Input */}
                                    <div className="p-4 border-t border-gray-200 bg-white">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                onKeyPress={handleKeyPress}
                                                placeholder="Nhập tin nhắn..."
                                                className="flex-1 p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                disabled={isSendingMessage}
                                            />
                                            <button
                                                onClick={handleSendMessage}
                                                className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                disabled={isSendingMessage || !newMessage.trim()}
                                            >
                                                {isSendingMessage ? (
                                                    <svg
                                                        className="animate-spin h-5 w-5 text-white"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            className="opacity-25"
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                        />
                                                        <path
                                                            className="opacity-75"
                                                            fill="currentColor"
                                                            d="M4 12a8 8 0 018-8v8z"
                                                        />
                                                    </svg>
                                                ) : (
                                                    <svg
                                                        className="h-5 w-5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                                        />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                    <div className="w-1/3">
                        <CourseSidebar
                            courseData={basicInfo}
                            onAddToCart={handleAddToCart}
                            onBuyNow={handleAddToCart}
                            onStartLearning={handleStartLearningClick}
                        />
                    </div>
                </div>
            </div>
        </SearchHeaderAndFooterLayout>
    );
};

export default CourseDetail;