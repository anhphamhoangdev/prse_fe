import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { requestWithAuth } from '../../utils/request';
import { ENDPOINTS } from '../../constants/endpoint';
import { Circle, Play, Trophy, RefreshCw } from 'lucide-react';
import { Lesson } from '../../types/course';
import { motion } from 'framer-motion';

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

interface OutletContext {
    currentLesson: Lesson | null;
    handleLessonNavigation: (lesson: Lesson, chapterId: number) => void;
}

const formatDateVN = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const QuizLessonDetail: React.FC = () => {
    const navigate = useNavigate();
    const { courseId, chapterId, lessonId } = useParams();
    const { currentLesson } = useOutletContext<OutletContext>();
    const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([]);
    const [isQuizLoading, setIsQuizLoading] = useState(false);

    const fetchQuizHistory = useCallback(async () => {
        try {
            setIsQuizLoading(true);
            const data = await requestWithAuth<QuizHistoryApiData>(`${ENDPOINTS.QUIZ.GET_QUIZ_HISTORY}/${lessonId}`);
            setQuizHistory(data.quiz_history);
        } catch (error) {
            console.error('Error fetching quiz history:', error);
        } finally {
            setIsQuizLoading(false);
        }
    }, [lessonId]);

    useEffect(() => {
        if (lessonId) fetchQuizHistory();
    }, [lessonId, fetchQuizHistory]);

    const handleStartQuiz = () => navigate(`/quiz/${courseId}/${chapterId}/${lessonId}`);

    const bestAttempt = quizHistory.length > 0
        ? quizHistory.reduce((prev, current) => (prev.score > current.score ? prev : current))
        : null;

    return (
        <div className="relative rounded-xl bg-gray-50 min-h-screen p-6 md:p-8 font-sans">
            {/* Loading Overlay */}
            {isQuizLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
                    <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
            )}

            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold text-gray-800">
                    {currentLesson?.title || (isQuizLoading ? 'Đang tải...' : 'Chưa chọn bài học')}
                </h1>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mt-2 text-lg text-gray-600"
                >
                    Đạt từ{' '}
                    <span className="font-bold text-blue-600">80 điểm</span> để hoàn thành bạn nhé !
                </motion.p>
            </motion.header>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto space-y-8">
                {/* No Quiz History */}
                {quizHistory.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-center py-16 bg-white rounded-2xl shadow-md"
                    >
                        <Circle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-xl text-gray-700 font-medium">Bạn chưa làm bài quiz này.</p>
                        <p className="text-gray-500 mt-2 mb-6">Hãy bắt đầu để kiểm tra kiến thức của bạn!</p>
                        <button
                            onClick={handleStartQuiz}
                            disabled={isQuizLoading}
                            className={`inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg transition-all duration-200 ${
                                isQuizLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 hover:shadow-lg'
                            }`}
                        >
                            <Play className="w-5 h-5 mr-2" />
                            Bắt đầu bài quiz
                        </button>
                    </motion.div>
                ) : (
                    <div className="space-y-8">
                        {/* Best Attempt */}
                        {bestAttempt && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-2xl p-6 shadow-md"
                            >
                                <div className="flex items-center gap-4">
                                    <Trophy className="w-10 h-10 text-yellow-500" />
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-gray-800">Thành tích tốt nhất</h3>
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-3xl font-bold text-yellow-600">{bestAttempt.score}</span>
                                                <span className="text-sm text-gray-600">
                          ({bestAttempt.correctAnswers}/{bestAttempt.totalQuestions} câu đúng)
                        </span>
                                            </div>
                                            <span className="text-sm text-gray-500">{formatDateVN(bestAttempt.date)}</span>
                                        </div>
                                        <div className="mt-3 h-2 bg-gray-200 rounded-full">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(bestAttempt.correctAnswers / bestAttempt.totalQuestions) * 100}%` }}
                                                transition={{ duration: 0.7, ease: 'easeOut' }}
                                                className="h-2 bg-yellow-500 rounded-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Quiz History */}
                        <div className="bg-white rounded-2xl shadow-md p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-gray-800">Lịch sử làm bài</h3>
                                <button
                                    onClick={handleStartQuiz}
                                    disabled={isQuizLoading}
                                    className={`inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg transition-all duration-200 ${
                                        isQuizLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 hover:shadow-lg'
                                    }`}
                                >
                                    <Play className="w-4 h-4 mr-2" />
                                    Làm lại bài quiz
                                </button>
                            </div>
                            <div className="space-y-4">
                                {quizHistory.map((attempt, index) => (
                                    <motion.div
                                        key={attempt.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                        className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                    >
                                        {/* Score Circle */}
                                        <div className="relative w-12 h-12 mr-4">
                                            <svg className="w-12 h-12 -rotate-90">
                                                <circle cx="24" cy="24" r="20" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                                                <circle
                                                    cx="24"
                                                    cy="24"
                                                    r="20"
                                                    fill="none"
                                                    stroke={
                                                        attempt.score >= 80
                                                            ? '#22c55e' // Green for Xuất sắc
                                                            : attempt.score >= 60
                                                                ? '#eab308' // Yellow for Gần đạt rồi
                                                                : '#ef4444' // Red for Chưa đạt
                                                    }
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

                                        {/* Attempt Details */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-medium text-gray-700">Lần làm thứ {quizHistory.length - index}</span>
                                                <span className="text-xs text-gray-500">{formatDateVN(attempt.date)}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-1.5 bg-gray-200 rounded-full">
                                                    <div
                                                        className="h-1.5 rounded-full"
                                                        style={{
                                                            width: `${(attempt.correctAnswers / attempt.totalQuestions) * 100}%`,
                                                            backgroundColor:
                                                                attempt.score >= 80
                                                                    ? '#22c55e' // Green for Xuất sắc
                                                                    : attempt.score >= 60
                                                                        ? '#eab308' // Yellow for Gần đạt rồi
                                                                        : '#ef4444', // Red for Chưa đạt
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-xs font-medium text-gray-600">
                          {attempt.correctAnswers}/{attempt.totalQuestions}
                        </span>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="ml-4">
                      <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
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
                                ? 'Gần đạt rồi'
                                : 'Chưa đạt'}
                      </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizLessonDetail;