import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { requestPostWithAuth, requestWithAuth } from '../../utils/request';
import AIChatDrawer from '../../components/course/AIChatDrawer';
import { Message } from 'postcss';
import { sendMessageAI } from '../../services/chatService';
import { MessageUtils } from '../../utils/messageUtil';
import { VideoPlayer } from '../../components/common/VideoPlayer';
import { CheckCircle, ArrowRight, Lightbulb } from 'lucide-react';
import { Lesson, VideoLessonData } from '../../types/course';
import { useCurriculum } from '../../context/CurriculumContext';
import {motivationalMessages} from "../../types/data";
import { motion } from "framer-motion";


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

interface OutletContext {
    currentLesson: Lesson | null;
    handleLessonNavigation: (lesson: Lesson, chapterId: number) => void;
}

const VideoLessonDetail: React.FC = () => {
    const navigate = useNavigate();
    const { courseId, chapterId, lessonId } = useParams();
    const { currentLesson: lessonInfo, handleLessonNavigation } = useOutletContext<OutletContext>();
    const { curriculum, updateLessonProgress } = useCurriculum();
    const [currentLesson, setCurrentLesson] = useState<VideoLessonData | null>(null);
    const [isLessonLoading, setIsLessonLoading] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [messages, setMessages] = useState<Message[]>(() => MessageUtils.createInitialMessages());
    const [motivationalMessage, setMotivationalMessage] = useState('');



    // Hàm tìm bài học tiếp theo
    const findNextLesson = useCallback(() => {
        if (!curriculum || !chapterId || !lessonId) return null;

        const currentChapterIndex = curriculum.findIndex((chapter) => chapter.id === Number(chapterId));
        if (currentChapterIndex === -1) return null;

        const currentChapter = curriculum[currentChapterIndex];
        const currentLessonIndex = currentChapter.lessons.findIndex((lesson) => lesson.id === Number(lessonId));
        if (currentLessonIndex === -1) return null;

        if (currentLessonIndex + 1 < currentChapter.lessons.length) {
            return {
                lesson: currentChapter.lessons[currentLessonIndex + 1],
                chapterId: currentChapter.id,
            };
        }

        if (currentChapterIndex + 1 < curriculum.length) {
            const nextChapter = curriculum[currentChapterIndex + 1];
            if (nextChapter.lessons.length > 0) {
                return {
                    lesson: nextChapter.lessons[0],
                    chapterId: nextChapter.id,
                };
            }
        }

        return null;
    }, [curriculum, chapterId, lessonId]);

    const fetchLessonData = useCallback(
        async (courseId: string, chapterId: string, lessonId: string) => {
            try {
                setIsLessonLoading(true);
                setCurrentLesson(null);
                const endpoint = `/course/${courseId}/${chapterId}/${lessonId}/video`;
                const videoData: VideoLessonApiResponse = await requestWithAuth(endpoint);
                setCurrentLesson(videoData.currentLesson);
                if (videoData.currentLesson.complete) {
                    updateLessonProgress(Number(chapterId), Number(lessonId), 'completed');
                }
            } catch (error) {
                console.error('Error fetching lesson data:', error);
            } finally {
                setIsLessonLoading(false);
            }
        },
        [updateLessonProgress]
    );

    useEffect(() => {
        if (courseId && chapterId && lessonId) {
            fetchLessonData(courseId, chapterId, lessonId);
        }
    }, [courseId, chapterId, lessonId, refreshTrigger, fetchLessonData]);

    // Chọn một thông điệp ngẫu nhiên khi component được tải
    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
        setMotivationalMessage(motivationalMessages[randomIndex]);
    }, [lessonId]); // Thay đổi thông điệp khi chuyển bài học

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

    const handleNextLesson = () => {
        const nextLessonInfo = findNextLesson();
        if (nextLessonInfo) {
            handleLessonNavigation(nextLessonInfo.lesson, nextLessonInfo.chapterId);
        }
    };

    const handleAIMessage = async (content: string): Promise<void> => {
        try {
            const userMessage = MessageUtils.createUserMessage(content, {
                lessonId: currentLesson?.id,
                lessonTitle: lessonInfo?.title,
                chapterId: Number(chapterId),
            });
            setMessages((prev) => [...prev, userMessage]);
            const response = await sendMessageAI(content);
            if (response.code === 1 && response.data?.message) {
                const aiMessage = MessageUtils.createAIMessage(response.data.message, {
                    lessonId: currentLesson?.id,
                    lessonTitle: lessonInfo?.title,
                    chapterId: Number(chapterId),
                });
                setMessages((prev) => [...prev, aiMessage]);
            } else {
                throw new Error('Failed to get AI response');
            }
        } catch (error) {
            const errorMessage = MessageUtils.createErrorMessage(error instanceof Error ? error.message : undefined);
            setMessages((prev) => [...prev, errorMessage]);
        }
    };

    const nextLessonInfo = findNextLesson();

    return (
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
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-6 mt-6 border-t border-gray-100">
                        {/* Bên trái: Nút "Đã hoàn thành bài học" khi hoàn thành */}
                        {currentLesson?.complete ? (
                            <div className="w-full sm:w-1/2 mb-4 sm:mb-0">
                                <button
                                    disabled
                                    className="w-full sm:w-auto flex items-center gap-3 px-8 py-3 rounded-lg font-medium transition-all duration-200 ease-in-out min-w-[200px] justify-center bg-green-50 text-green-600 border border-green-200"
                                >
                                    <CheckCircle className="w-5 h-5 opacity-90" />
                                    <span>Đã hoàn thành bài học</span>
                                </button>
                            </div>
                        ) : (
                            <motion.div
                                className="w-full sm:w-1/2 mb-4 sm:mb-0"
                                initial={{opacity: 0, y: 20}}
                                animate={{opacity: 1, y: 0}}
                                transition={{duration: 0.5, ease: "easeOut"}}
                            >
                                <motion.div
                                    whileHover={{scale: 1.03, boxShadow: "0 8px 20px rgba(59, 130, 246, 0.2)"}}
                                    className="flex items-center gap-3 bg-blue-50 p-3 rounded-2xl shadow-sm"
                                >
                                    <Lightbulb className="w-6 h-6 text-blue-500"/>
                                    <span className="text-sm font-semibold text-blue-700">{motivationalMessage}</span>
                                </motion.div>
                            </motion.div>
                        )}
                        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
                            {/* Nút "Xác nhận hoàn thành" hiển thị khi chưa hoàn thành */}
                            {!currentLesson?.complete && (
                                <button
                                    onClick={() => handleSubmitLesson(courseId || 0, chapterId || 0, lessonId || 0)}
                                    disabled={isSubmitting || isLessonLoading}
                                    className={`w-full sm:w-auto flex items-center gap-3 px-8 py-3 rounded-lg font-medium transition-all duration-200 ease-in-out min-w-[200px] justify-center ${
                                        isSubmitting || isLessonLoading
                                            ? 'bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm hover:shadow-md active:shadow-sm'
                                    }`}
                                >
                                    {isSubmitting ? (
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
                            )}
                            {/* Nút "Bài tiếp theo" hiển thị khi đã hoàn thành và có bài tiếp theo */}
                            {currentLesson?.complete && nextLessonInfo && (
                                <button
                                    onClick={handleNextLesson}
                                    className="w-full sm:w-auto flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 ease-in-out min-w-[140px] justify-center bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm hover:shadow-md active:shadow-sm"
                                >
                                    <span>Bài tiếp theo</span>
                                    <ArrowRight className="w-4 h-4 opacity-90" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <AIChatDrawer position="right" onSendMessage={handleAIMessage} messages={messages} />
        </div>
    );
};

export default VideoLessonDetail;