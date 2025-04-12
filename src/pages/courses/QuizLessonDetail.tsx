import React, { useState, useEffect, useCallback } from 'react';
import { SearchHeaderAndFooterLayout } from '../../layouts/UserLayout';
import { ChevronLeft, ChevronRight, Play, Circle, X, Menu } from 'lucide-react';
import { Lesson } from '../../types/course';
import { useNavigate, useParams } from 'react-router-dom';
import { requestWithAuth } from '../../utils/request';
import { ENDPOINTS } from '../../constants/endpoint';
import { LoadingState } from '../../components/course/LoadingState';
import { useCurriculum } from '../../context/CurriculumContext';
import CurriculumSidebar from '../../components/course/course-detail/CurriculumSidebar';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizHistory {
    id: number;
    studentId: number;
    lessonId: number;
    date: string;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
}

interface QuizHistoryApiData {
    quiz_history: QuizHistory[];
}

const formatDateVN = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}, ${day}/${month}/${year}`;
};

const QuizLessonDetail: React.FC = () => {
    const navigate = useNavigate();
    const { courseId, chapterId, lessonId } = useParams();
    const { curriculum, isLoading: isCurriculumLoading, fetchCurriculum } = useCurriculum();

    const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([]);
    const [isQuizLoading, setIsQuizLoading] = useState(false);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true); // Mặc định sidebar hiển thị

    const fetchQuizHistory = useCallback(async () => {
        try {
            setIsQuizLoading(true);
            const data = await requestWithAuth<QuizHistoryApiData>(ENDPOINTS.QUIZ.GET_QUIZ_HISTORY + `/${lessonId}`);
            await new Promise((resolve) => setTimeout(resolve, 300)); // Delay tối thiểu 300ms
            setQuizHistory(data.quiz_history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } catch (error) {
            console.error('Error fetching quiz history:', error);
        } finally {
            setIsQuizLoading(false);
        }
    }, [lessonId]);

    useEffect(() => {
        if (courseId) fetchCurriculum(courseId);
        if (lessonId) fetchQuizHistory();
    }, [courseId, lessonId, fetchCurriculum, fetchQuizHistory]);

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
            const newUrl = `${baseCoursePath}/${nextChapterId}/${lesson.id}/${paths[lesson.type] || ''}`;
            navigate(newUrl, { replace: true });
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

    const handleStartQuiz = () => navigate(`/quiz/${courseId}/${chapterId}/${lessonId}`);

    const toggleSidebar = () => setIsSidebarVisible((prev) => !prev);

    if (isCurriculumLoading) {
        return (
            <SearchHeaderAndFooterLayout>
                <LoadingState />
            </SearchHeaderAndFooterLayout>
        );
    }

    const { currentLesson, nextLesson, prevLesson } = findNavigationInfo();
    const currentChapter = curriculum?.find((ch) => ch.id === Number(chapterId));

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
                                className="lg:w-1/3 w-full"
                            >
                                <CurriculumSidebar
                                    courseId={courseId}
                                    currentLessonId={lessonId}
                                    onLessonSelect={handleLessonNavigation}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Nội dung chính */}
                    <div
                        className={`relative flex-grow transition-all duration-300 ${
                            isSidebarVisible ? 'lg:w-2/3' : 'w-full max-w-4xl mx-auto'
                        }`}
                    >
                        {/* Nút bật/tắt sidebar */}
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
                                        disabled={!prevLesson || isQuizLoading}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                                            !prevLesson || isQuizLoading
                                                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'border-blue-100 text-blue-600 hover:bg-blue-50'
                                        }`}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        <span className="hidden sm:inline">Bài trước</span>
                                    </button>
                                    <button
                                        onClick={() => handleNavigation('next')}
                                        disabled={!nextLesson || isQuizLoading}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                                            !nextLesson || isQuizLoading
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

                        {/* Nội dung quiz */}
                        <div className="bg-white rounded-lg shadow-sm p-6 transition-opacity duration-300 ease-in-out">
                            {isQuizLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
                                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                            <h1 className="text-2xl font-bold text-gray-900 mb-4 transition-opacity duration-300 ease-in-out">
                                {currentLesson?.title || (isQuizLoading ? 'Đang tải...' : 'Chưa chọn bài học')}
                            </h1>
                            <div className="space-y-6">
                                {quizHistory.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Circle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-600 text-lg">Bạn chưa làm bài quiz này.</p>
                                        <p className="text-gray-500 mb-6">Hãy bắt đầu để kiểm tra kiến thức của bạn!</p>
                                        <button
                                            onClick={handleStartQuiz}
                                            disabled={isQuizLoading}
                                            className={`bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all ${
                                                isQuizLoading
                                                    ? 'opacity-50 cursor-not-allowed'
                                                    : 'hover:shadow-md active:shadow-sm'
                                            }`}
                                        >
                                            Làm bài ngay
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 text-blue-600">
                                            <Play className="w-4 h-4" />
                                            <span>Quiz - {currentLesson?.title}</span>
                                        </div>
                                        <div className="border-t pt-4">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg font-semibold text-gray-900">Lịch sử làm bài</h3>
                                                <button
                                                    onClick={handleStartQuiz}
                                                    disabled={isQuizLoading}
                                                    className={`bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center ${
                                                        isQuizLoading
                                                            ? 'opacity-50 cursor-not-allowed'
                                                            : 'hover:shadow-md active:shadow-sm'
                                                    }`}
                                                >
                                                    <Play className="w-4 h-4 mr-2" />
                                                    Làm lại bài quiz
                                                </button>
                                            </div>
                                            <div className="space-y-3">
                                                {quizHistory.map((attempt, index) => (
                                                    <div
                                                        key={attempt.id}
                                                        className="border rounded-lg overflow-hidden shadow-sm hover:shadow transition-all"
                                                    >
                                                        <div className="flex items-center">
                                                            <div className="bg-blue-50 p-3 flex items-center justify-center">
                                                                <div className="relative w-12 h-12">
                                                                    <svg className="w-12 h-12 -rotate-90">
                                                                        <circle
                                                                            cx="24"
                                                                            cy="24"
                                                                            r="20"
                                                                            fill="none"
                                                                            stroke="#e5e7eb"
                                                                            strokeWidth="4"
                                                                        />
                                                                        <circle
                                                                            cx="24"
                                                                            cy="24"
                                                                            r="20"
                                                                            fill="none"
                                                                            stroke="#3b82f6"
                                                                            strokeWidth="4"
                                                                            strokeDasharray={`${2 * Math.PI * 20 * (attempt.score / 100)} ${
                                                                                2 * Math.PI * 20 * (1 - attempt.score / 100)
                                                                            }`}
                                                                            strokeLinecap="round"
                                                                        />
                                                                    </svg>
                                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                                        <span className="text-sm font-bold text-blue-600">{attempt.score}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="p-3 flex-1">
                                                                <div className="flex justify-between items-center mb-2">
                                                                    <div className="flex items-center">
                                                                        <span className="font-medium text-sm">
                                                                            Bài làm {quizHistory.length - index}
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">{formatDateVN(attempt.date)}</div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="flex-1">
                                                                        <div className="h-1.5 bg-gray-200 rounded-full">
                                                                            <div
                                                                                className="h-1.5 bg-green-500 rounded-full"
                                                                                style={{
                                                                                    width: `${(attempt.correctAnswers / attempt.totalQuestions) * 100}%`,
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <span className="text-xs font-medium">
                                                                        {attempt.correctAnswers}/{attempt.totalQuestions}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="px-3">
                                                                <span
                                                                    className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                                                                        attempt.score >= 80
                                                                            ? 'bg-green-100 text-green-800'
                                                                            : attempt.score >= 60
                                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                                : 'bg-red-100 text-red-800'
                                                                    }`}
                                                                >
                                                                    {attempt.score >= 80
                                                                        ? 'Xuất sắc'
                                                                        : attempt.score >= 60
                                                                            ? 'Đạt'
                                                                            : attempt.score >= 50
                                                                                ? 'Trung Bình'
                                                                                : 'Chưa đạt'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SearchHeaderAndFooterLayout>
    );
};

export default QuizLessonDetail;