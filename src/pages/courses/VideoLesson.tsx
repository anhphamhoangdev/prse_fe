// src/pages/VideoLessonDetail.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { SearchHeaderAndFooterLayout } from '../../layouts/UserLayout';
import { ChevronLeft, ChevronRight, Play, CheckCircle, Circle } from 'lucide-react';
import { Lesson, VideoLessonData } from '../../types/course'; // Không cần import Chapter vì dùng từ context
import { useNavigate, useParams } from 'react-router-dom';
import { requestPostWithAuth, requestWithAuth } from '../../utils/request';
import AIChatDrawer from '../../components/course/AIChatDrawer';
import { LoadingState } from '../../components/course/LoadingState';
import { Message } from 'postcss';
import { sendMessageAI } from '../../services/chatService';
import { MessageUtils } from '../../utils/messageUtil';
import { VideoPlayer } from '../../components/common/VideoPlayer';
import { useCurriculum } from '../../context/CurriculumContext';
import CurriculumSidebar from "../../components/course/course-detail/CurriculumSidebar";

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
    const { courseId, chapterId, lessonId } = useParams();
    const { curriculum, isLoading: isCurriculumLoading, fetchCurriculum } = useCurriculum();

    const [currentLesson, setCurrentLesson] = useState<VideoLessonData | null>(null);
    const [isLessonLoading, setIsLessonLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [messages, setMessages] = useState<Message[]>(() => MessageUtils.createInitialMessages());

    useEffect(() => {
        if (courseId) fetchCurriculum(courseId);

        const fetchLessonData = async () => {
            try {
                setIsLessonLoading(true);
                const endpoint = `/course/${courseId}/${chapterId}/${lessonId}/video`;
                const videoData: VideoLessonApiResponse = await requestWithAuth(endpoint);
                setCurrentLesson(videoData.currentLesson);
            } catch (error) {
                console.error('Error fetching lesson data:', error);
            } finally {
                setIsLessonLoading(false);
            }
        };

        if (courseId && lessonId) fetchLessonData();
    }, [courseId, chapterId, lessonId, refreshTrigger, fetchCurriculum]);

    const findNavigationInfo = useCallback(() => {
        if (!curriculum || !lessonId) return { currentLesson: null, nextLesson: null, prevLesson: null };
        let currentLesson: Lesson | null = null;
        let nextLesson: Lesson | null = null;
        let prevLesson: Lesson | null = null;

        for (let i = 0; i < curriculum.length; i++) {
            const chapter = curriculum[i];
            const lessonIndex = chapter.lessons.findIndex((l) => l.id === Number(lessonId));
            if (lessonIndex !== -1) {
                currentLesson = chapter.lessons[lessonIndex];
                if (lessonIndex < chapter.lessons.length - 1) {
                    nextLesson = chapter.lessons[lessonIndex + 1];
                } else if (i < curriculum.length - 1) {
                    nextLesson = curriculum[i + 1].lessons[0];
                }
                if (lessonIndex > 0) {
                    prevLesson = chapter.lessons[lessonIndex - 1];
                } else if (i > 0) {
                    prevLesson = curriculum[i - 1].lessons[curriculum[i - 1].lessons.length - 1];
                }
                break;
            }
        }
        return { currentLesson, nextLesson, prevLesson };
    }, [curriculum, lessonId]);

    const handleLessonNavigation = useCallback(
        (lesson: Lesson, nextChapterId: number) => {
            const baseCoursePath = `/course-detail/${courseId}`;
            const paths = { video: 'video', text: 'reading', code: 'practice', quiz: 'quiz' };
            navigate(`${baseCoursePath}/${nextChapterId}/${lesson.id}/${paths[lesson.type] || ''}`);
        },
        [courseId, navigate]
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
                lessonTitle: findNavigationInfo().currentLesson?.title, // Dùng title từ curriculum
                chapterId: Number(chapterId),
            });
            setMessages((prev) => [...prev, userMessage]);
            const response = await sendMessageAI(content);
            if (response.code === 1 && response.data?.message) {
                const aiMessage = MessageUtils.createAIMessage(response.data.message, {
                    lessonId: currentLesson?.id,
                    lessonTitle: findNavigationInfo().currentLesson?.title,
                    chapterId: Number(chapterId),
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

    if (isLessonLoading || !currentLesson) {
        return (
            <SearchHeaderAndFooterLayout>
                <LoadingState />
            </SearchHeaderAndFooterLayout>
        );
    }

    const { currentLesson: lessonInfo, nextLesson, prevLesson } = findNavigationInfo();

    return (
        <SearchHeaderAndFooterLayout>
            <div className="min-h-screen bg-gray-100">
                <div className="container mx-auto py-6 px-4 lg:px-6">
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                    <Play className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Chương hiện tại</div>
                                    <div className="font-medium text-gray-900">
                                        {curriculum?.find((ch) => ch.id === Number(chapterId))?.title || 'Đang tải...'}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleNavigation('prev')}
                                    disabled={!prevLesson}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                                        !prevLesson
                                            ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                            : 'border-blue-100 text-blue-600 hover:bg-blue-50'
                                    }`}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    <span className="hidden sm:inline">Bài trước</span>
                                </button>
                                <button
                                    onClick={() => handleNavigation('next')}
                                    disabled={!nextLesson}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                                        !nextLesson
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

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                <div className="relative w-full">
                                    <VideoPlayer url={currentLesson.videoUrl} className="w-full" />
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        <h1 className="text-2xl font-bold text-gray-900">{lessonInfo?.title || 'Video Lesson'}</h1>
                                        <div className="flex flex-wrap items-center gap-4 text-sm">
                                            <div className="flex items-center gap-2 text-blue-600">
                                                <Play className="w-4 h-4" />
                                                <span>Video Bài Giảng</span>
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
                                                        onClick={() => handleSubmitLesson(courseId || 0, chapterId || 0, lessonId || 0)}
                                                        disabled={isSubmitting || lessonInfo?.progress?.status === 'completed'}
                                                        className={`w-full sm:w-auto flex items-center gap-3 px-8 py-3 rounded-lg font-medium transition-all duration-200 ease-in-out min-w-[200px] justify-center ${
                                                            lessonInfo?.progress?.status === 'completed'
                                                                ? 'bg-green-50 text-green-600 border border-green-200'
                                                                : isSubmitting
                                                                    ? 'bg-gray-50 text-gray-400 border border-gray-200'
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
                        <CurriculumSidebar
                            courseId={courseId}
                            currentLessonId={lessonId}
                            onLessonSelect={handleLessonNavigation}
                        />
                    </div>
                </div>
            </div>
            <AIChatDrawer position="right" onSendMessage={handleAIMessage} messages={messages} />
        </SearchHeaderAndFooterLayout>
    );
};

export default VideoLessonDetail;