import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchHeaderAndFooterLayout } from '../../layouts/UserLayout';
import { ChevronLeft, ChevronRight, Play, CheckCircle, Circle, X, Menu } from 'lucide-react';
import { Lesson, VideoLessonData } from '../../types/course';
import { useNavigate, useParams } from 'react-router-dom';
import { requestPostWithAuth, requestWithAuth } from '../../utils/request';
import AIChatDrawer from '../../components/course/AIChatDrawer';
import { LoadingState } from '../../components/course/LoadingState';
import { Message } from 'postcss';
import { sendMessageAI } from '../../services/chatService';
import { MessageUtils } from '../../utils/messageUtil';
import { VideoPlayer } from '../../components/common/VideoPlayer';
import { useCurriculum } from '../../context/CurriculumContext';
import CurriculumSidebar from '../../components/course/course-detail/CurriculumSidebar';

interface VideoLessonApiResponse {
    currentLesson: VideoLessonData;
}

interface SubmitLessonRequest {
    courseId: string | number;
    chapterId: string | number;
    lessonId: string | number;
}

interface SubmitLessonResponse {
    code: number;
    message?: string;
    error_message?: string;
}

const VideoLessonDetail: React.FC = () => {
    const navigate = useNavigate();
    const { courseId: initialCourseId, chapterId: initialChapterId, lessonId: initialLessonId } = useParams();
    const { curriculum, isLoading: isCurriculumLoading } = useCurriculum();

    const [currentLesson, setCurrentLesson] = useState<VideoLessonData | null>(null);
    const [isLessonLoading, setIsLessonLoading] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [messages, setMessages] = useState<Message[]>(() => MessageUtils.createInitialMessages());
    const [currentCourseId, setCurrentCourseId] = useState(initialCourseId);
    const [currentChapterId, setCurrentChapterId] = useState(initialChapterId);
    const [currentLessonId, setCurrentLessonId] = useState(initialLessonId);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true); // Mặc định visible

    const fetchLessonData = useCallback(async (courseId: string, chapterId: string, lessonId: string) => {
        try {
            setIsLessonLoading(true);
            setCurrentLesson(null);
            const endpoint = `/course/${courseId}/${chapterId}/${lessonId}/video`;
            const videoData: VideoLessonApiResponse = await requestWithAuth(endpoint);
            setCurrentLesson(videoData.currentLesson);
        } catch (error) {
            console.error('Error fetching lesson data:', error);
        } finally {
            setIsLessonLoading(false);
        }
    }, []);

    useEffect(() => {
        if (initialCourseId && initialChapterId && initialLessonId) {
            setCurrentCourseId(initialCourseId);
            setCurrentChapterId(initialChapterId);
            setCurrentLessonId(initialLessonId);
            fetchLessonData(initialCourseId, initialChapterId, initialLessonId);
        }
    }, [initialCourseId, initialChapterId, initialLessonId, fetchLessonData]);

    useEffect(() => {
        if (currentCourseId && currentChapterId && currentLessonId) {
            fetchLessonData(currentCourseId, currentChapterId, currentLessonId);
        }
    }, [refreshTrigger, currentCourseId, currentChapterId, currentLessonId, fetchLessonData]);

    const findNavigationInfo = useCallback(() => {
        if (!curriculum || !currentLessonId) return { currentLesson: null, nextLesson: null, prevLesson: null };
        let currentLesson: Lesson | null = null;
        let nextLesson: Lesson | null = null;
        let prevLesson: Lesson | null = null;

        for (let i = 0; i < curriculum.length; i++) {
            const chapter = curriculum[i];
            const lessonIndex = chapter.lessons.findIndex((l) => l.id === Number(currentLessonId));
            if (lessonIndex !== -1) {
                currentLesson = chapter.lessons[lessonIndex];
                if (lessonIndex < chapter.lessons.length - 1) {
                    nextLesson = chapter.lessons[lessonIndex + 1];
                } else {
                    for (let j = i + 1; j < curriculum.length; j++) {
                        if (curriculum[j].lessons.length > 0) {
                            nextLesson = curriculum[j].lessons[0];
                            break;
                        }
                    }
                }
                if (lessonIndex > 0) {
                    prevLesson = chapter.lessons[lessonIndex - 1];
                } else {
                    for (let j = i - 1; j >= 0; j--) {
                        if (curriculum[j].lessons.length > 0) {
                            prevLesson = curriculum[j].lessons[curriculum[j].lessons.length - 1];
                            break;
                        }
                    }
                }
                break;
            }
        }
        return { currentLesson, nextLesson, prevLesson };
    }, [curriculum, currentLessonId]);

    const handleLessonNavigation = useCallback(
        (lesson: Lesson, nextChapterId: number) => {
            const baseCoursePath = `/course-detail/${currentCourseId}`;
            const paths = { video: 'video', text: 'reading', code: 'practice', quiz: 'quiz' };
            const newUrl = `${baseCoursePath}/${nextChapterId}/${lesson.id}/${paths[lesson.type] || ''}`;
            navigate(newUrl, { replace: true });
            if (lesson.type === 'video') {
                setCurrentChapterId(String(nextChapterId));
                setCurrentLessonId(String(lesson.id));
                fetchLessonData(currentCourseId || '', String(nextChapterId), String(lesson.id));
            }
        },
        [currentCourseId, navigate, fetchLessonData]
    );

    const handleNavigation = useCallback(
        (direction: 'next' | 'prev') => {
            const { nextLesson, prevLesson } = findNavigationInfo();
            const targetLesson = direction === 'next' ? nextLesson : prevLesson;
            if (targetLesson) {
                const chapter = curriculum?.find((ch) => ch.lessons.some((l) => l.id === targetLesson.id));
                if (chapter) handleLessonNavigation(targetLesson, chapter.id);
            }
        },
        [findNavigationInfo, handleLessonNavigation]
    );

    const handleSubmitLesson = async (courseId: string | number, chapterId: string | number, lessonId: string | number) => {
        try {
            setIsSubmitting(true);
            const response = await requestPostWithAuth<SubmitLessonResponse>('/course/video/submit', {
                courseId,
                chapterId,
                lessonId,
            });
            console.log('Lesson submitted successfully:', response);
            setRefreshTrigger((prev) => prev + 1);
        } catch (error) {
            console.error('Error submitting lesson:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAIMessage = async (content: string): Promise<void> => {
        try {
            const userMessage = MessageUtils.createUserMessage(content, {
                lessonId: currentLesson?.id,
                lessonTitle: findNavigationInfo().currentLesson?.title,
                chapterId: Number(currentChapterId),
            });
            setMessages((prev) => [...prev, userMessage]);
            const response = await sendMessageAI(content);
            if (response.code === 1 && response.data?.message) {
                const aiMessage = MessageUtils.createAIMessage(response.data.message, {
                    lessonId: currentLesson?.id,
                    lessonTitle: findNavigationInfo().currentLesson?.title,
                    chapterId: Number(currentChapterId),
                });
                setMessages((prev) => [...prev, aiMessage]);
            } else {
                throw new Error('Failed to get AI response');
            }
        } catch (error) {
            const errorMessage = MessageUtils.createErrorMessage(
                error instanceof Error ? error.message : undefined
            );
            setMessages((prev) => [...prev, errorMessage]);
        }
    };

    const toggleSidebar = () => {
        setIsSidebarVisible((prev) => !prev);
    };

    if (isCurriculumLoading) {
        return (
            <SearchHeaderAndFooterLayout>
                <LoadingState />
            </SearchHeaderAndFooterLayout>
        );
    }

    const { currentLesson: lessonInfo, nextLesson, prevLesson } = findNavigationInfo();
    const currentChapter = curriculum?.find((ch) => ch.id === Number(currentChapterId));

    return (
        <SearchHeaderAndFooterLayout>
            <div className="min-h-screen bg-gray-100">
                <div className="container mx-auto py-6 px-4 lg:px-6 flex flex-col lg:flex-row gap-6">
                    {/* Sidebar bên trái với motion */}
                    <AnimatePresence>
                        {isSidebarVisible && (
                            <motion.div
                                initial={{ x: -300, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -300, opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="lg:w-1/3 w-full" // Tăng từ lg:w-1/4 lên lg:w-1/3
                            >
                                <CurriculumSidebar
                                    courseId={currentCourseId}
                                    currentLessonId={currentLessonId}
                                    onLessonSelect={handleLessonNavigation}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Nội dung chính */}
                    <div
                        className={`relative flex-grow transition-all duration-300 ${
                            isSidebarVisible ? 'lg:w-2/3' : 'w-full max-w-4xl mx-auto' // Giảm từ lg:w-3/4 xuống lg:w-2/3
                        }`}
                    >
                        {/* Nút bật/tắt sidebar cải tiến */}
                        <button
                            onClick={toggleSidebar}
                            className="absolute top-4 left-4 z-20 p-2.5 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 shadow-lg hover:from-gray-200 hover:to-gray-300 transition-all duration-200 flex items-center justify-center"
                        >
                            {isSidebarVisible ? (
                                <X className="w-6 h-6 text-gray-700 transition-transform duration-200 hover:scale-110" />
                            ) : (
                                <Menu className="w-6 h-6 text-gray-700 transition-transform duration-200 hover:scale-110" />
                            )}
                        </button>

                        {/* Thanh điều hướng */}
                        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                        <Play className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500">Chương hiện tại</div>
                                        <div className="font-medium text-gray-900">
                                            {currentChapter?.title || 'Đang tải...'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleNavigation('prev')}
                                        disabled={!prevLesson || isLessonLoading}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                                            !prevLesson || isLessonLoading
                                                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'border-blue-100 text-blue-600 hover:bg-blue-50'
                                        }`}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        <span className="hidden sm:inline">Bài trước</span>
                                    </button>
                                    <button
                                        onClick={() => handleNavigation('next')}
                                        disabled={!nextLesson || isLessonLoading}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                                            !nextLesson || isLessonLoading
                                                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'border-blue-100 text-blue-600 hover:bg-blue-50'
                                        }`}
                                    >
                                        <span className="hidden sm:inline">Bài tiếp</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Nội dung bài học */}
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
                            <div className="relative w-full aspect-video shrink-0">
                                {isLessonLoading && !currentLesson && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
                                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}
                                {currentLesson && (
                                    <VideoPlayer
                                        url={currentLesson.videoUrl}
                                        className={`absolute inset-0 w-full h-full object-cover ${
                                            isLessonLoading ? 'opacity-50' : 'opacity-100'
                                        }`}
                                    />
                                )}
                            </div>
                            <div className="p-6 grow">
                                <div className="space-y-4">
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        {lessonInfo?.title || (isLessonLoading ? 'Đang tải...' : 'Chưa chọn bài học')}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-4 text-sm">
                                        <div className="flex items-center gap-2 text-blue-600">
                                            <Play className="w-4 h-4" />
                                            <span>Video Bài Giảng</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-start justify-between pt-6 mt-6 border-t border-gray-100">
                                        <div className="w-full sm:w-1/2 mb-4 sm:mb-0">
                                            <div className="space-y-1">
                                                <h4 className="text-base font-medium text-gray-900">Hoàn thành bài học</h4>
                                                <p className="text-sm text-gray-500 leading-relaxed">
                                                    Hoàn thành bài học này để mở khóa nội dung tiếp theo trong khóa học của bạn.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="w-full sm:w-auto">
                                            <button
                                                onClick={() =>
                                                    handleSubmitLesson(currentCourseId || 0, currentChapterId || 0, currentLessonId || 0)
                                                }
                                                disabled={isSubmitting || lessonInfo?.progress?.status === 'completed' || isLessonLoading}
                                                className={`w-full sm:w-auto flex items-center gap-3 px-8 py-3 rounded-lg font-medium transition-all duration-200 ease-in-out min-w-[200px] justify-center ${
                                                    lessonInfo?.progress?.status === 'completed'
                                                        ? 'bg-green-50 text-green-600 border border-green-200'
                                                        : isSubmitting || isLessonLoading
                                                            ? 'bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed'
                                                            : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm hover:shadow-md active:shadow-sm'
                                                }`}
                                            >
                                                {lessonInfo?.progress?.status === 'completed' ? (
                                                    <>
                                                        <CheckCircle className="w-5 h-5 opacity-90" />
                                                        <span>Bài học đã hoàn thành</span>
                                                    </>
                                                ) : isSubmitting ? (
                                                    <>
                                                        <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                                                        <span>Đang xử lý...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="w-5 h-5 opacity-90" />
                                                        <span>Xác nhận hoàn thành</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <AIChatDrawer position="right" onSendMessage={handleAIMessage} messages={messages} />
        </SearchHeaderAndFooterLayout>
    );
};

export default VideoLessonDetail;