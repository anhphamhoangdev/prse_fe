import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle, XCircle, Clock, Award, AlertCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getWithAuth, requestPostWithAuth } from '../../utils/request';
import { QuizHistory } from '../../types/QuizHistory';

interface Answer {
    id: number;
    text: string;
    isCorrect: boolean;
}

interface QuizQuestion {
    id: number;
    text: string;
    answers: Answer[];
}

interface QuizResponse {
    quiz: QuizQuestion[];
}

const QuizPage: React.FC = () => {
    const { courseId, chapterId, lessonId } = useParams();
    const navigate = useNavigate();
    const [quizData, setQuizData] = useState<QuizQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number[] }>({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);

    // Fetch quiz content từ API
    useEffect(() => {
        const fetchQuizContent = async () => {
            try {
                setLoading(true);
                const endpoint = `/quiz/content/${courseId}/${chapterId}/${lessonId}`;
                const data = await getWithAuth<QuizResponse>(endpoint);
                setQuizData(data.quiz);
            } catch (error) {
                console.error('Error fetching quiz content:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuizContent();
    }, [courseId, chapterId, lessonId]);

    // Xử lý chọn đáp án (checkbox)
    const handleAnswerChange = (questionId: number, answerId: number) => {
        setSelectedAnswers(prev => {
            const current = prev[questionId] || [];
            if (current.includes(answerId)) {
                return { ...prev, [questionId]: current.filter(id => id !== answerId) };
            } else {
                return { ...prev, [questionId]: [...current, answerId] };
            }
        });
    };

    // Xử lý nộp bài
    const handleSubmitQuiz = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        // Tính điểm
        let correctCount = 0;
        quizData.forEach(question => {
            const correctAnswerIds = question.answers.filter(a => a.isCorrect).map(a => a.id);
            const selected = selectedAnswers[question.id] || [];
            const isCorrect = correctAnswerIds.length === selected.length &&
                correctAnswerIds.every(id => selected.includes(id));
            if (isCorrect) correctCount++;
        });

        const totalQuestions = quizData.length;
        const calculatedScore = Math.round((correctCount / totalQuestions) * 100);

        const quizResult = new QuizHistory(
            calculatedScore,
            correctCount,
            totalQuestions,
            Number(lessonId)
        );

        try {
            await requestPostWithAuth('/quiz/submit', quizResult.toJSON());
            setScore(calculatedScore);
            setSubmitted(true);

            // Hiệu ứng confetti nếu điểm cao
            if (calculatedScore >= 70) {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 5000);
            }
        } catch (error) {
            console.error('Error submitting quiz:', error);
            alert('Có lỗi khi nộp bài. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Quay lại trang trước
    const handleBack = () => {
        navigate(`/course-detail/${courseId}/${chapterId}/${lessonId}/quiz`);
    };

    // Chuyển câu hỏi
    const goToNextQuestion = () => {
        if (currentQuestionIndex < quizData.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const goToPrevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    // Tiến độ hoàn thành
    const progressPercentage = quizData.length > 0
        ? Math.round((Object.keys(selectedAnswers).length / quizData.length) * 100)
        : 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.div
                        className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <p className="text-lg text-blue-800 font-medium">Đang tải bài quiz...</p>
                </motion.div>
            </div>
        );
    }

    const currentQuestion = quizData[currentQuestionIndex];
    const correctAnswersCount = submitted ? quizData.reduce((count, q) => {
        const correctIds = q.answers.filter(a => a.isCorrect).map(a => a.id);
        const selected = selectedAnswers[q.id] || [];
        return count + (correctIds.length === selected.length && correctIds.every(id => selected.includes(id)) ? 1 : 0);
    }, 0) : 0;

    // Variant cho các animation
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        },
        exit: { opacity: 0 }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
    };

    // Confetti element
    const Confetti = () => {
        const confettiColors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
        const confettiCount = 100;

        return (
            <div className="fixed inset-0 pointer-events-none">
                {Array.from({ length: confettiCount }).map((_, i) => {
                    const colorClass = confettiColors[Math.floor(Math.random() * confettiColors.length)];
                    const left = `${Math.random() * 100}%`;
                    const size = `${Math.random() * 0.5 + 0.5}rem`;
                    const duration = `${Math.random() * 3 + 2}s`;
                    const delay = `${Math.random() * 3}s`;

                    return (
                        <motion.div
                            key={i}
                            className={`absolute ${colorClass} rounded-full`}
                            style={{ left }}
                            initial={{ top: -20, width: size, height: size }}
                            animate={{
                                top: "100vh",
                                rotate: 360 * Math.round(Math.random() * 5)
                            }}
                            transition={{
                                duration: Number(duration.replace('s', '')),
                                delay: Number(delay.replace('s', '')),
                                ease: "linear"
                            }}
                        />
                    );
                })}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            {showConfetti && <Confetti />}

            <motion.div
                className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 text-white relative">
                    <motion.button
                        onClick={handleBack}
                        className="absolute top-5 left-5 text-white hover:text-blue-200 flex items-center transition-all"
                        disabled={!submitted && Object.keys(selectedAnswers).length > 0}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" /> Quay lại
                    </motion.button>
                    <motion.h1
                        className="text-2xl font-bold text-center mt-2"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        Bài Quiz
                    </motion.h1>
                    {!submitted && (
                        <motion.div
                            className="mt-3 max-w-md mx-auto flex items-center gap-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="bg-blue-200 bg-opacity-30 h-2 rounded-full flex-grow">
                                <motion.div
                                    className="bg-white h-2 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercentage}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                />
                            </div>
                            <div className="text-xs text-blue-50 font-medium whitespace-nowrap">
                                <span>{Object.keys(selectedAnswers).length}/{quizData.length}</span>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Result card */}
                {submitted && (
                    <motion.div
                        className="p-6 border-b"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <motion.div
                            className={`p-6 rounded-xl ${
                                score! >= 70 ? 'bg-green-50' : score! >= 50 ? 'bg-yellow-50' : 'bg-red-50'
                            }`}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <motion.h2
                                className="text-2xl font-bold text-center mb-2"
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                {score! >= 70 ? 'Xuất sắc!' : score! >= 50 ? 'Khá tốt!' : 'Cần cố gắng hơn!'}
                            </motion.h2>
                            <motion.div
                                className="flex justify-center mb-4"
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.4, type: "spring" }}
                            >
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                                    score! >= 70 ? 'bg-green-100 text-green-600' :
                                        score! >= 50 ? 'bg-yellow-100 text-yellow-600' :
                                            'bg-red-100 text-red-600'
                                }`}>
                                    <motion.span
                                        className="text-2xl font-bold"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.6 }}
                                    >
                                        {score}%
                                    </motion.span>
                                </div>
                            </motion.div>
                            <motion.div
                                className="grid grid-cols-3 gap-3 text-center"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                <motion.div
                                    className="bg-white p-2 rounded-lg shadow-sm"
                                    variants={itemVariants}
                                >
                                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
                                    <p className="font-medium text-sm">{correctAnswersCount} đúng</p>
                                </motion.div>
                                <motion.div
                                    className="bg-white p-2 rounded-lg shadow-sm"
                                    variants={itemVariants}
                                >
                                    <XCircle className="w-5 h-5 text-red-500 mx-auto mb-1" />
                                    <p className="font-medium text-sm">{quizData.length - correctAnswersCount} sai</p>
                                </motion.div>
                                <motion.div
                                    className="bg-white p-2 rounded-lg shadow-sm"
                                    variants={itemVariants}
                                >
                                    <Award className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                                    <p className="font-medium text-sm">{quizData.length} tổng</p>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Quiz content */}
                <div className="p-5">
                    {!submitted ? (
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-3">
                                <span className="bg-blue-100 text-blue-800 font-medium px-2.5 py-0.5 rounded-full text-xs">
                                    Câu hỏi {currentQuestionIndex + 1}/{quizData.length}
                                </span>
                                <div className="flex items-center text-red-500 text-xs">
                                    <AlertCircle className="w-3.5 h-3.5 mr-1" />
                                    <span>Câu trả lời không được lưu tự động</span>
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentQuestionIndex}
                                    className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 mb-5"
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <p className="text-lg font-medium text-gray-800 mb-4">
                                        {currentQuestion.text}
                                    </p>
                                    <motion.div
                                        className="space-y-3"
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        {currentQuestion.answers.map(answer => {
                                            const isSelected = (selectedAnswers[currentQuestion.id] || []).includes(answer.id);

                                            return (
                                                <motion.div
                                                    key={answer.id}
                                                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                                                        isSelected
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                                    }`}
                                                    onClick={() => handleAnswerChange(currentQuestion.id, answer.id)}
                                                    variants={itemVariants}
                                                    whileHover={{ scale: 1.01 }}
                                                    whileTap={{ scale: 0.99 }}
                                                >
                                                    <div className={`w-5 h-5 flex-shrink-0 rounded-md border-2 ${
                                                        isSelected
                                                            ? 'border-blue-500 bg-blue-500'
                                                            : 'border-gray-300'
                                                    } flex items-center justify-center`}>
                                                        {isSelected && <div className="w-2 h-2 bg-white rounded-sm"></div>}
                                                    </div>
                                                    <label className="flex-1 cursor-pointer text-base">
                                                        {answer.text}
                                                    </label>
                                                </motion.div>
                                            );
                                        })}
                                    </motion.div>
                                </motion.div>
                            </AnimatePresence>

                            <div className="flex justify-between">
                                <motion.button
                                    onClick={goToPrevQuestion}
                                    className={`px-4 py-2 rounded-lg flex items-center gap-1.5 text-sm ${
                                        currentQuestionIndex > 0
                                            ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                                    disabled={currentQuestionIndex === 0}
                                    whileHover={currentQuestionIndex > 0 ? { scale: 1.05 } : {}}
                                    whileTap={currentQuestionIndex > 0 ? { scale: 0.95 } : {}}
                                >
                                    <ChevronLeft className="w-4 h-4" /> Câu trước
                                </motion.button>

                                <motion.button
                                    onClick={goToNextQuestion}
                                    className={`bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-1.5 hover:bg-blue-700 text-sm ${
                                        currentQuestionIndex < quizData.length - 1 ? 'visible' : 'invisible'
                                    }`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Câu tiếp theo <ArrowRight className="w-4 h-4" />
                                </motion.button>
                            </div>
                        </div>
                    ) : (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <h2 className="text-lg font-bold mb-3">Chi tiết bài làm:</h2>
                            <div className="space-y-4">
                                {quizData.map((question, index) => {
                                    const userAnswers = selectedAnswers[question.id] || [];
                                    const correctAnswerIds = question.answers.filter(a => a.isCorrect).map(a => a.id);
                                    const isQuestionCorrect = correctAnswerIds.length === userAnswers.length &&
                                        correctAnswerIds.every(id => userAnswers.includes(id));

                                    return (
                                        <motion.div
                                            key={question.id}
                                            className={`p-3 rounded-lg ${
                                                isQuestionCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                                            }`}
                                            variants={itemVariants}
                                        >
                                            <div className="flex items-start gap-2 mb-2">
                                                {isQuestionCorrect ? (
                                                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                                ) : (
                                                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                                )}
                                                <div>
                                                    <p className="font-medium text-base">Câu {index + 1}: {question.text}</p>
                                                    {!isQuestionCorrect && (
                                                        <p className="text-xs text-red-600 mt-0.5 flex items-center">
                                                            <AlertCircle className="w-3.5 h-3.5 mr-1" /> Đáp án chưa chính xác
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <motion.div
                                                className="ml-7 space-y-2"
                                                variants={containerVariants}
                                            >
                                                {question.answers.map(answer => {
                                                    const isSelected = userAnswers.includes(answer.id);
                                                    const isCorrect = answer.isCorrect;

                                                    let answerClass = 'border';
                                                    if (isSelected && isCorrect) answerClass = 'border-green-500 bg-green-50';
                                                    else if (isSelected && !isCorrect) answerClass = 'border-red-500 bg-red-50';
                                                    else if (!isSelected && isCorrect) answerClass = 'border-green-500 bg-green-50';
                                                    else answerClass = 'border-gray-200';

                                                    return (
                                                        <motion.div
                                                            key={answer.id}
                                                            className={`flex items-center gap-2 p-2 rounded-md text-sm ${answerClass}`}
                                                            variants={itemVariants}
                                                        >
                                                            {isSelected && isCorrect && <CheckCircle className="w-4 h-4 text-green-600" />}
                                                            {isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-600" />}
                                                            {!isSelected && isCorrect && <CheckCircle className="w-4 h-4 text-green-600" />}
                                                            {!isSelected && !isCorrect && <div className="w-4 h-4"></div>}

                                                            <p className={`${isCorrect ? 'font-medium' : ''}`}>
                                                                {answer.text}
                                                            </p>
                                                        </motion.div>
                                                    );
                                                })}
                                            </motion.div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Footer actions */}
                <div className="bg-gray-50 p-4 border-t">
                    {submitted ? (
                        <motion.button
                            onClick={handleBack}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 py-3 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg flex items-center justify-center gap-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Award className="w-5 h-5" /> Hoàn thành bài học
                        </motion.button>
                    ) : (
                        <motion.button
                            onClick={handleSubmitQuiz}
                            className={`w-full px-5 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                                Object.keys(selectedAnswers).length === 0
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg'
                            }`}
                            disabled={isSubmitting || Object.keys(selectedAnswers).length === 0}
                            whileHover={Object.keys(selectedAnswers).length > 0 ? { scale: 1.02 } : {}}
                            whileTap={Object.keys(selectedAnswers).length > 0 ? { scale: 0.98 } : {}}
                        >
                            {isSubmitting ? (
                                <>
                                    <motion.div
                                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                    Đang nộp bài...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" /> Nộp bài kiểm tra
                                </>
                            )}
                        </motion.button>
                    )}

                    {!submitted && Object.keys(selectedAnswers).length < quizData.length && (
                        <motion.p
                            className="text-center text-amber-600 text-xs flex items-center justify-center mt-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <AlertCircle className="w-3.5 h-3.5 mr-1" />
                            Bạn chưa trả lời hết các câu hỏi!
                            ({Object.keys(selectedAnswers).length}/{quizData.length})
                        </motion.p>
                    )}
                </div>
            </motion.div>

            {/* Navigation dots */}
            {!submitted && (
                <motion.div
                    className="max-w-4xl mx-auto mt-4 flex justify-center gap-1.5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    {quizData.map((_, idx) => (
                        <motion.button
                            key={idx}
                            onClick={() => setCurrentQuestionIndex(idx)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all text-xs ${
                                idx === currentQuestionIndex
                                    ? 'bg-blue-600 text-white'
                                    : selectedAnswers[quizData[idx].id]
                                        ? 'bg-blue-200 text-blue-800'
                                        : 'bg-white text-gray-400'
                            }`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            {idx + 1}
                        </motion.button>
                    ))}
                </motion.div>
            )}
        </div>
    );
};

export default QuizPage;