import React, {useState, useEffect, useCallback} from 'react';
import { SearchHeaderAndFooterLayout } from "../../layouts/UserLayout";
import {ChevronLeft, ChevronRight, CheckCircle, Play, Circle, ChevronUp, ChevronDown} from 'lucide-react';
import {Chapter, Lesson, VideoLessonData} from "../../types/course";
import {useNavigate, useParams} from "react-router-dom";
import {formatDuration} from "../../utils/formatSecondToHour";
import {requestPostWithAuth, requestWithAuth} from "../../utils/request";
import {usePreventInspect} from "../../utils/hooks";
import AIChatDrawer from "../../components/course/AIChatDrawer";
import {LoadingState} from "../../components/course/LoadingState";
import {Message} from "postcss";
import {sendMessageAI} from "../../services/chatService";
import {MessageUtils} from "../../utils/messageUtil";
import VideoLesson from "./VideoLesson";
import {VideoPlayer} from "../../components/common/VideoPlayer";


interface VideoLessonApiResponse {
    currentLesson: VideoLessonData
}

interface CurriculumApiResponse {
    error_message: Record<string, unknown>;
    code: number;
    data: {
        chapters: {
            chapters: Chapter[];
        }
    }
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

    usePreventInspect()

    // 1. Hooks và State Declarations
    const navigate = useNavigate();
    const { courseId, chapterId, lessonId } = useParams();

    const [currentLesson, setCurrentLesson] = useState<VideoLessonData | null>(null);
    const [curriculum, setCurriculum] = useState<Chapter[] | null>(null);
    const [expandedChapters, setExpandedChapters] = useState<number[]>([]);

    const [isLessonLoading, setIsLessonLoading] = useState(true);
    const [isCurriculumLoading, setIsCurriculumLoading] = useState(true);

    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [messages, setMessages] = useState<Message[]>(() =>
        MessageUtils.createInitialMessages() // Không cần truyền params
    );


    // 2. Data Fetching
    useEffect(() => {
        const { currentChapter } = findNavigationInfo();
        if (currentChapter) {
            setExpandedChapters(prev => {
                if (!prev.includes(currentChapter.id)) {
                    return [...prev, currentChapter.id];
                }
                return prev;
            });
        }
    }, [curriculum, lessonId]);

    useEffect(() => {
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

        if (courseId && lessonId) {
            fetchLessonData();
        }
    }, [courseId, lessonId, refreshTrigger]);

    useEffect(() => {
        const fetchCurriculum = async () => {
            try {
                setIsCurriculumLoading(true);
                const endpoint = `/course/${courseId}/curriculum`;
                const data = await requestWithAuth<CurriculumApiResponse['data']>(endpoint);
                setCurriculum(data.chapters.chapters);
                console.log('[VideoLesson] Successfully fetched curriculum:', data.chapters.chapters);
            } catch (error) {
                console.error('Error fetching curriculum:', error);
            } finally {
                setIsCurriculumLoading(false);
            }
        };

        if (courseId) {
            fetchCurriculum();
        }
    }, [courseId, refreshTrigger]);


    const handleAIMessage = async (content: string): Promise<void> => {
        try {
            // Add user message
            const userMessage = MessageUtils.createUserMessage(content, {
                lessonId: currentLesson?.id,
                lessonTitle: lessonInfo?.title,
                chapterId: currentChapter?.id
            });
            setMessages(prev => [...prev, userMessage]);

            // Get AI response
            const response = await sendMessageAI(content);

            if (response.code === 1 && response.data?.message) {
                const aiMessage = MessageUtils.createAIMessage(
                    response.data.message,
                    {
                        lessonId: currentLesson?.id,
                        lessonTitle: lessonInfo?.title,
                        chapterId: currentChapter?.id
                    }
                );
                setMessages(prev => [...prev, aiMessage]);
            } else {
                throw new Error('Failed to get AI response');
            }
        } catch (error) {
            const errorMessage = MessageUtils.createErrorMessage(
                error instanceof Error ? error.message : undefined
            );
            setMessages(prev => [...prev, errorMessage]);
        }
    };
    // 3. Navigation Helpers
    const findNavigationInfo = useCallback(() => {
        if (!curriculum || !lessonId) {
            return {
                currentChapter: null,
                currentLesson: null,
                nextLesson: null,
                prevLesson: null
            };
        }

        let result = {
            currentChapter: null as Chapter | null,
            currentLesson: null as Lesson | null,
            nextLesson: null as Lesson | null,
            prevLesson: null as Lesson | null
        };

        // Duyệt trực tiếp qua curriculum vì đã là Chapter[]
        for (let i = 0; i < curriculum.length; i++) {
            const chapter = curriculum[i];
            const lessonIndex = chapter.lessons.findIndex(l => l.id === Number(lessonId));

            if (lessonIndex !== -1) {
                result.currentChapter = chapter;
                result.currentLesson = chapter.lessons[lessonIndex];

                // Next lesson
                if (lessonIndex < chapter.lessons.length - 1) {
                    result.nextLesson = chapter.lessons[lessonIndex + 1];
                } else if (i < curriculum.length - 1) {
                    const nextChapter = curriculum[i + 1];
                    if (nextChapter.lessons.length > 0) {
                        result.nextLesson = nextChapter.lessons[0];
                    }
                }

                // Previous lesson
                if (lessonIndex > 0) {
                    result.prevLesson = chapter.lessons[lessonIndex - 1];
                } else if (i > 0) {
                    const prevChapter = curriculum[i - 1];
                    if (prevChapter.lessons.length > 0) {
                        result.prevLesson = prevChapter.lessons[prevChapter.lessons.length - 1];
                    }
                }
                break;
            }
        }

        return result;
    }, [curriculum, lessonId]);
    const findChapterByLessonId = useCallback((lessonId: number): Chapter | null => {
        return curriculum?.find(chapter =>
            chapter.lessons.some(lesson => lesson.id === lessonId)
        ) || null;
    }, [curriculum]);

    // 4. Navigation Actions
    const handleLessonNavigation = useCallback((lesson: Lesson, nextChapterId: number) => {
        const baseCoursePath = `/course-detail/${courseId}`;
        const getPath = (type: string) => `${baseCoursePath}/${nextChapterId}/${lesson.id}/${type}`;

        const paths = {
            'video': 'video',
            'text': 'reading',
            'code': 'practice',
            'quiz': 'quiz'
        };

        navigate(getPath(paths[lesson.type] || ''));
    }, [courseId, navigate]);

    const handleNavigation = useCallback((direction: 'next' | 'prev') => {
        const { nextLesson, prevLesson } = findNavigationInfo();

        if (direction === 'next' && nextLesson) {
            const nextChapter = findChapterByLessonId(nextLesson.id);
            if (nextChapter) {
                handleLessonNavigation(nextLesson, nextChapter.id);
            }
        } else if (direction === 'prev' && prevLesson) {
            const prevChapter = findChapterByLessonId(prevLesson.id);
            if (prevChapter) {
                handleLessonNavigation(prevLesson, prevChapter.id);
            }
        }
    }, [findNavigationInfo, findChapterByLessonId, handleLessonNavigation]);

    // 5. UI Helpers
    const toggleChapter = useCallback((chapterId: number) => {
        setExpandedChapters(prev =>
            prev.includes(chapterId)
                ? prev.filter(id => id !== chapterId)
                : [...prev, chapterId]
        );
    }, []);

    const calculateChapterProgress = useCallback((chapter: Chapter): number => {
        if (!chapter.lessons.length) return 0;

        const completedLessons = chapter.lessons.filter(
            lesson => lesson.progress?.status === 'completed'
        ).length;

        return Math.round((completedLessons / chapter.lessons.length) * 100);
    }, []);

    // 6. Render Helpers
    const renderLessonItem = useCallback((lesson: Lesson, chapter: Chapter) => (
        <button
            key={lesson.id}
            onClick={() => handleLessonNavigation(lesson, chapter.id)}
            className={`w-full text-left p-2 rounded flex items-center gap-2 hover:bg-gray-50 transition-colors
                ${Number(lessonId) === lesson.id ? 'bg-blue-50' : ''}`}
        >
            {lesson.progress?.status === 'completed' ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
            ) : Number(lessonId) === lesson.id ? (
                <Play className="w-4 h-4 text-blue-500" />
            ) : (
                <Circle className="w-4 h-4 text-gray-300" />
            )}
            <span className="text-sm flex-1">{lesson.title}</span>
            <span className="text-xs text-gray-500">
                {formatDuration(lesson.duration || 0)}
            </span>
        </button>
    ), [lessonId, handleLessonNavigation]);

    // 7. Additional Actions
    // const refreshCurriculum = useCallback(async () => {
    //     // Gọi lại API curriculum khi cần refresh
    //     const fetchCurriculum = async () => {
    //         try {
    //             setIsCurriculumLoading(true);
    //             // const response = await fetch(`/api/courses/${courseId}/curriculum`);
    //             // const data = await response.json();
    //             setCurriculum(mockCurriculumResponse.data.chapters.chapters);
    //         } catch (error) {
    //             console.error('Error refreshing curriculum:', error);
    //         } finally {
    //             setIsCurriculumLoading(false);
    //         }
    //     };
    //
    //     await fetchCurriculum();
    // }, [courseId]);


    const handleSubmitLesson = async (
        courseId: string | number,
        chapterId: string | number,
        lessonId: string | number
    ): Promise<void> => {
        try {
            const requestData: SubmitLessonRequest = {
                courseId,
                chapterId,
                lessonId
            };

            console.log('Submitting lesson:', requestData);


            setIsSubmitting(true);

            const response = await requestPostWithAuth<SubmitLessonResponse>(
                '/course/video/submit',
                requestData
            );

            console.log('Lesson submitted successfully:', response);

            // Trigger re-fetch curriculum
            setRefreshTrigger(prev => prev + 1);

            // Nếu có next lesson và muốn tự động chuyển sang bài kế
            if (nextLesson) {
                const nextChapter = findChapterByLessonId(nextLesson.id);
                if (nextChapter) {
                    handleLessonNavigation(nextLesson, nextChapter.id);
                }
            }

        } catch (error) {
            console.error('Error submitting lesson:', error);
            const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi khi nộp bài';
            // Có thể thêm toast thông báo lỗi ở đây
        } finally {
            setIsSubmitting(false);
        }
    };

    // 8. Loading States
    if (isLessonLoading || !currentLesson || !curriculum) {
        return (
            <SearchHeaderAndFooterLayout>
                <LoadingState />
            </SearchHeaderAndFooterLayout>
        );
    }

    // 9. Get Current Navigation Info
    const { currentChapter, currentLesson: lessonInfo, nextLesson, prevLesson } = findNavigationInfo();

    return (
        <SearchHeaderAndFooterLayout>
            <div className="min-h-screen bg-gray-100">
                <div className="container mx-auto py-6 px-4 lg:px-6">
                    {/* Navigation Bar */}
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                {currentChapter && (
                                    <>
                                        <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                            <Play className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500">Chương hiện tại</div>
                                            <div className="font-medium text-gray-900">{currentChapter.title}</div>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleNavigation('prev')}
                                    disabled={!prevLesson}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all
                                    ${!prevLesson
                                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'border-blue-100 text-blue-600 hover:bg-blue-50'}`}
                                >
                                    <ChevronLeft className="w-4 h-4"/>
                                    <span className="hidden sm:inline">Bài trước</span>
                                </button>
                                <button
                                    onClick={() => handleNavigation('next')}
                                    disabled={!nextLesson}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all
                                    ${!nextLesson
                                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'border-blue-100 text-blue-600 hover:bg-blue-50'}`}
                                >
                                    <span className="hidden sm:inline">Bài tiếp</span>
                                    <ChevronRight className="w-4 h-4"/>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Video Player Section */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                {currentLesson ? (
                                    <>
                                        <div className="relative w-full" >
                                            <VideoPlayer
                                                url={currentLesson.videoUrl}
                                                className="w-full"
                                            />
                                        </div>

                                        {/* Lesson Info Section */}
                                        <div className="p-6">
                                            {lessonInfo && (
                                                <div className="space-y-4">
                                                    <h1 className="text-2xl font-bold text-gray-900">
                                                        {lessonInfo.title}
                                                    </h1>
                                                    <div className="flex flex-wrap items-center gap-4 text-sm">
                                                        <div className="flex items-center gap-2 text-blue-600">
                                                            <Play className="w-4 h-4" />
                                                            <span>Video Bài Giảng</span>
                                                        </div>
                                                        {lessonInfo.duration && (
                                                            <div className="flex items-center gap-2 text-gray-600">
                                                                <span>•</span>
                                                                <span>{formatDuration(lessonInfo.duration)}</span>
                                                            </div>
                                                        )}
                                                        {lessonInfo.progress?.status === 'completed' ? (
                                                            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                                                                <CheckCircle className="w-4 h-4" />
                                                                <span>Đã hoàn thành</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                                                                <Play className="w-4 h-4" />
                                                                <span>Đang học</span>
                                                            </div>
                                                        )}
                                                        {/* Submit Button Section - NEW */}
                                                        <div className="flex flex-col sm:flex-row items-start justify-between pt-6 mt-6 border-t border-gray-100">
                                                            {/* Left side - Text content */}
                                                            <div className="w-full sm:w-1/2 mb-4 sm:mb-0">
                                                                <div className="space-y-1">
                                                                    <h4 className="text-base font-medium text-gray-900">Hoàn thành bài học</h4>
                                                                    <p className="text-sm text-gray-500 leading-relaxed">
                                                                        Hoàn thành bài học này để mở khóa nội dung tiếp theo trong khóa học của bạn.
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* Right side - Button */}
                                                            <div className="w-full sm:w-auto">
                                                                <button
                                                                    onClick={() => handleSubmitLesson(courseId || 0, chapterId || 0, lessonId || 0)}
                                                                    disabled={isSubmitting || lessonInfo.progress?.status === 'completed'}
                                                                    className={`w-full sm:w-auto flex items-center gap-3 px-8 py-3 rounded-lg font-medium 
        transition-all duration-200 ease-in-out min-w-[200px] justify-center
        ${lessonInfo.progress?.status === 'completed'
                                                                        ? 'bg-green-50 text-green-600 border border-green-200'
                                                                        : isSubmitting
                                                                            ? 'bg-gray-50 text-gray-400 border border-gray-200'
                                                                            : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm hover:shadow-md active:shadow-sm'
                                                                    }
        ${lessonInfo.progress?.status === 'completed' && !isSubmitting && 'hover:-translate-y-0.5 active:translate-y-0'}
    `}
                                                                >
                                                                    {lessonInfo.progress?.status === 'completed' ? (
                                                                        <>
                                                                            <CheckCircle
                                                                                className="w-5 h-5 opacity-90"/>
                                                                            <span>Bài học đã hoàn thành</span>
                                                                        </>
                                                                    ) : isSubmitting ? (
                                                                        <>
                                                                            <div
                                                                                className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"/>
                                                                            <span>Đang xử lý...</span>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <CheckCircle
                                                                                className="w-5 h-5 opacity-90"/>
                                                                            <span>Xác nhận hoàn thành</span>
                                                                        </>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-64">
                                        <div className="text-gray-500">Đang tải...</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Course Progress Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tiến độ chương</h2>
                                        {currentChapter && (
                                            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                        style={{
                                                            width: `${calculateChapterProgress(currentChapter)}%`
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                <span className="font-medium text-gray-900">
                                                    {calculateChapterProgress(currentChapter)}% hoàn thành
                                                </span>
                                                    <span className="text-gray-500">
                                                    {currentChapter.lessons.filter(l => l.progress?.status === 'completed').length}/
                                                        {currentChapter.lessons.length} bài học
                                                </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="font-medium text-gray-900">Nội dung khóa học</h3>
                                        <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-400px)] pr-2">
                                            {curriculum?.map((chapter) => (
                                                <div key={chapter.id}
                                                     className={`border rounded-lg transition-all ${
                                                         currentChapter?.id === chapter.id ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                                                     }`}
                                                >
                                                    <button
                                                        onClick={() => toggleChapter(chapter.id)}
                                                        className="w-full flex items-center justify-between p-4"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <h4 className="font-medium text-left font-bold text-gray-900">{chapter.title}</h4>
                                                            <div className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                                                                {chapter.lessons.length} bài học
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            {calculateChapterProgress(chapter) > 0 && (
                                                                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                                                {calculateChapterProgress(chapter)}%
                                                            </span>
                                                            )}
                                                            {expandedChapters.includes(chapter.id) ? (
                                                                <ChevronUp className="w-4 h-4 text-gray-400" />
                                                            ) : (
                                                                <ChevronDown className="w-4 h-4 text-gray-400" />
                                                            )}
                                                        </div>
                                                    </button>

                                                    {/* Lessons List */}
                                                    {expandedChapters.includes(chapter.id)  && (
                                                        <div className="border-t border-gray-200">
                                                            <div className="divide-y divide-gray-200">
                                                                {chapter.lessons.map((lesson) => (
                                                                    <button
                                                                        key={lesson.id}
                                                                        onClick={() => handleLessonNavigation(lesson, chapter.id)}
                                                                        className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors ${
                                                                            Number(lessonId) === lesson.id ? 'bg-blue-50' : ''
                                                                        }`}
                                                                    >
                                                                        {lesson.progress?.status === 'completed' ? (
                                                                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                                        ) : Number(lessonId) === lesson.id ? (
                                                                            <Play className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                                                        ) : (
                                                                            <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                                                                        )}
                                                                        <span className="text-sm text-left flex-grow text-gray-700">
                                                                        {lesson.title}
                                                                    </span>
                                                                        {lesson.duration && (
                                                                            <span className="text-xs text-gray-500 whitespace-nowrap">
                                                                            {formatDuration(lesson.duration)}
                                                                        </span>
                                                                        )}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <AIChatDrawer
                position="right"
                onSendMessage={handleAIMessage}
                messages={messages}
            />
        </SearchHeaderAndFooterLayout>
    );
};

export default VideoLessonDetail;