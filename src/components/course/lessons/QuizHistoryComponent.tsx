import React from 'react';
import { Clock, Award, BarChart2, ChevronRight, BookOpen, CheckCircle, Calendar } from 'lucide-react';

interface QuizHistory {
    id: number;
    studentId: number;
    lessonId: number;
    date: string;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
}

interface QuizHistoryProps {
    quizHistory: QuizHistory[];
    handleStartQuiz: () => void;
    currentLessonTitle?: string;
    isQuizLoading: boolean;
}

const formatDateVN = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

const getPerformanceStyle = (score: number) => {
    if (score >= 80) {
        return {
            color: 'text-emerald-600',
            bgLight: 'bg-emerald-50',
            bgMedium: 'bg-emerald-100',
            bgGradient: 'from-emerald-400 to-teal-500',
            borderColor: 'border-emerald-200',
            label: 'Xuất sắc',
            icon: <CheckCircle className="w-4 h-4" />
        };
    } else if (score >= 60) {
        return {
            color: 'text-blue-600',
            bgLight: 'bg-blue-50',
            bgMedium: 'bg-blue-100',
            bgGradient: 'from-blue-400 to-indigo-500',
            borderColor: 'border-blue-200',
            label: 'Khá tốt',
            icon: <CheckCircle className="w-4 h-4" />
        };
    } else if (score >= 40) {
        return {
            color: 'text-amber-600',
            bgLight: 'bg-amber-50',
            bgMedium: 'bg-amber-100',
            bgGradient: 'from-amber-400 to-orange-500',
            borderColor: 'border-amber-200',
            label: 'Trung bình',
            icon: <Clock className="w-4 h-4" />
        };
    } else {
        return {
            color: 'text-rose-600',
            bgLight: 'bg-rose-50',
            bgMedium: 'bg-rose-100',
            bgGradient: 'from-rose-400 to-red-500',
            borderColor: 'border-rose-200',
            label: 'Cần cố gắng',
            icon: <Clock className="w-4 h-4" />
        };
    }
};

const ScoreCircle: React.FC<{ score: number; size?: 'sm' | 'md' | 'lg', inBestCard?: boolean }> = ({ score, size = 'md', inBestCard = false }) => {
    const perf = getPerformanceStyle(score);
    const sizeClasses = {
        sm: "w-12 h-12 text-sm",
        md: "w-16 h-16 text-base",
        lg: "w-20 h-20 text-lg"
    };

    return (
        <div className={`relative ${sizeClasses[size]} flex-shrink-0`}>
            <svg className="w-full h-full -rotate-90">
                <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    className={inBestCard ? "fill-white stroke-blue-600" : "fill-none stroke-gray-100"}
                    strokeWidth="10%"
                />
                <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    className={inBestCard ? "fill-none stroke-blue-600" : `fill-none stroke-current ${perf.color}`}
                    strokeWidth="10%"
                    strokeDasharray={`${score * 2.83} 283`}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-bold">
                {score}
            </div>
        </div>
    );
};

const EmptyState: React.FC<{ handleStartQuiz: () => void, isQuizLoading: boolean }> = ({ handleStartQuiz, isQuizLoading }) => (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 text-center">
        <div className="mx-auto mb-4 w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-indigo-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa có bài làm nào</h3>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Hãy thực hiện bài kiểm tra đầu tiên để đánh giá kiến thức của bạn và theo dõi tiến độ học tập.
        </p>
        <button
            onClick={handleStartQuiz}
            disabled={isQuizLoading}
            className={`inline-flex items-center px-5 py-3 bg-indigo-600 text-white rounded-lg font-medium shadow-sm transition 
      ${isQuizLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700 hover:shadow'}`}
        >
            Bắt đầu kiểm tra
            <ChevronRight className="w-5 h-5 ml-1" />
        </button>
    </div>
);

const QuizHistoryComponent: React.FC<QuizHistoryProps> = ({
                                                              quizHistory,
                                                              handleStartQuiz,
                                                              currentLessonTitle,
                                                              isQuizLoading
                                                          }) => {
    const bestAttempt = quizHistory.length
        ? quizHistory.reduce((best, current) => (current.score > best.score ? current : best), quizHistory[0])
        : null;

    if (quizHistory.length === 0) {
        return <EmptyState handleStartQuiz={handleStartQuiz} isQuizLoading={isQuizLoading} />;
    }

    return (
        <div className="space-y-6">
            {/* Best performance card */}
            {bestAttempt && (
                <div className="bg-white border-2 border-blue-600 text-gray-800 rounded-2xl shadow-lg overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600 opacity-10 rounded-full -mt-8 -mr-8"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-600 opacity-10 rounded-full -mb-12 -ml-12"></div>

                    <div className="p-5 relative z-10">
                        <div className="flex items-center mb-4">
                            <Award className="w-5 h-5 mr-2 text-blue-600" />
                            <h3 className="font-semibold">Thành tích tốt nhất</h3>
                        </div>

                        <h2 className="text-lg font-bold mb-4">{currentLessonTitle}</h2>

                        <div className="flex flex-col md:flex-row gap-6 items-center">
                            <div className="bg-white border border-blue-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
                                <ScoreCircle score={bestAttempt.score} size="lg" inBestCard={true} />
                                <div>
                                    <div className="text-sm text-gray-500">Điểm số</div>
                                    <div className="text-2xl font-bold">{bestAttempt.score}/100</div>
                                </div>
                            </div>

                            <div className="flex-1">
                                <div className="flex justify-between mb-1 text-sm">
                                    <span>Câu đúng</span>
                                    <span className="font-medium">{bestAttempt.correctAnswers}/{bestAttempt.totalQuestions}</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full mb-4">
                                    <div
                                        className="h-2 bg-blue-600 rounded-full"
                                        style={{ width: `${(bestAttempt.correctAnswers / bestAttempt.totalQuestions) * 100}%` }}
                                    ></div>
                                </div>

                                <button
                                    onClick={handleStartQuiz}
                                    disabled={isQuizLoading}
                                    className={`w-full md:w-auto px-4 py-2 bg-blue-600 text-white font-medium rounded-lg transition shadow-sm
                  ${isQuizLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700 hover:shadow'}`}
                                >
                                    Thử lại bài kiểm tra
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* History list */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-100 p-4 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800 flex items-center">
                        <BarChart2 className="w-5 h-5 text-indigo-500 mr-2" />
                        Lịch sử làm bài ({quizHistory.length})
                    </h3>
                </div>

                <div className="divide-y divide-gray-100">
                    {quizHistory.map((attempt, index) => {
                        const perf = getPerformanceStyle(attempt.score);
                        return (
                            <div key={attempt.id} className="p-4 hover:bg-gray-50 transition">
                                <div className="flex items-center gap-4">
                                    <ScoreCircle score={attempt.score} size="sm" />

                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-800">
                                                    Lần thử {quizHistory.length - index}
                                                </span>
                                                {attempt.score === bestAttempt?.score && (
                                                    <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        <Award className="w-3 h-3" />
                                                        Tốt nhất
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center text-xs text-gray-500">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                {formatDateVN(attempt.date)}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="flex-1 h-2 bg-gray-100 rounded-full">
                                                <div
                                                    className={`h-2 rounded-full bg-gradient-to-r ${perf.bgGradient}`}
                                                    style={{ width: `${(attempt.correctAnswers / attempt.totalQuestions) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-medium text-gray-600 min-w-[48px]">
                                                {attempt.correctAnswers}/{attempt.totalQuestions}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${perf.bgLight} ${perf.color}`}>
                                                {perf.icon}
                                                {perf.label}
                                            </span>
                                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                                                {Math.round((attempt.correctAnswers / attempt.totalQuestions) * 100)}% hoàn thành
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default QuizHistoryComponent;


// // src/components/course/QuizLessonDetail.tsx
// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
// import { requestWithAuth } from '../../utils/request';
// import { ENDPOINTS } from '../../constants/endpoint';
// import { Play } from 'lucide-react';
// import { Lesson } from '../../types/course';
// import { motion } from 'framer-motion';
// import QuizHistoryComponent from "../../components/course/lessons/QuizHistoryComponent";
//
// interface QuizHistory {
//     id: number;
//     studentId: number;
//     lessonId: number;
//     date: string;
//     score: number;
//     correctAnswers: number;
//     totalQuestions: number;
// }
//
// interface QuizHistoryApiData {
//     quiz_history: QuizHistory[];
// }
//
// interface OutletContext {
//     currentLesson: Lesson | null;
//     handleLessonNavigation: (lesson: Lesson, chapterId: number) => void;
// }
//
// const QuizLessonDetail: React.FC = () => {
//     const navigate = useNavigate();
//     const { courseId, chapterId, lessonId } = useParams();
//     const { currentLesson } = useOutletContext<OutletContext>();
//     const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([]);
//     const [isQuizLoading, setIsQuizLoading] = useState(false);
//
//     const fetchQuizHistory = useCallback(async () => {
//         try {
//             setIsQuizLoading(true);
//             const data = await requestWithAuth<QuizHistoryApiData>(ENDPOINTS.QUIZ.GET_QUIZ_HISTORY + `/${lessonId}`);
//             setQuizHistory(data.quiz_history);
//         } catch (error) {
//             console.error('Error fetching quiz history:', error);
//         } finally {
//             setIsQuizLoading(false);
//         }
//     }, [lessonId]);
//
//     useEffect(() => {
//         if (lessonId) fetchQuizHistory();
//     }, [lessonId, fetchQuizHistory]);
//
//     const handleStartQuiz = () => navigate(`/quiz/${courseId}/${chapterId}/${lessonId}`);
//
//     return (
//         <div className="bg-white rounded-lg shadow-sm p-6 transition-opacity duration-300 ease-in-out">
//             {isQuizLoading && (
//                 <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10 rounded-lg">
//                     <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/>
//                 </div>
//             )}
//             <h1 className="text-2xl font-bold text-gray-900 mb-4 transition-opacity duration-300 ease-in-out">
//                 {currentLesson?.title || (isQuizLoading ? 'Đang tải...' : 'Chưa chọn bài học')}
//             </h1>
//
//             <motion.p
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.7, ease: "easeOut" }}
//                 whileHover={{
//                     scale: 1.02,
//                     boxShadow: "0 4px 12px rgba(37, 99, 235, 0.15)"
//                 }}
//                 className="text-lg font-bold text-blue-700 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-6 shadow-md border-l-4 border-blue-500 text-center"
//             >
//                 Chinh phục bài quiz với điểm số trên <span className="text-xl text-blue-600 font-extrabold">80</span> để hoàn thành và <span className="underline decoration-2 decoration-blue-400">ghi dấu ấn kiến thức</span>!
//             </motion.p>
//
//             <QuizHistoryComponent
//                 quizHistory={quizHistory}
//                 handleStartQuiz={handleStartQuiz}
//                 currentLessonTitle={currentLesson?.title}
//                 isQuizLoading={isQuizLoading}
//             />
//         </div>
//     );
// };
//
// export default QuizLessonDetail;