import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle, XCircle, AlertCircle, Award, ArrowRight, ArrowLeft } from 'lucide-react';
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

    // Fetch quiz content
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

    // Handle answer selection
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

    // Handle quiz submission
    const handleSubmitQuiz = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        // Calculate score
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
            Number(lessonId),
            Number(courseId),
            Number(chapterId),
        );

        try {
            await requestPostWithAuth('/quiz/submit', quizResult.toJSON());
            setScore(calculatedScore);
            setSubmitted(true);
        } catch (error) {
            console.error('Error submitting quiz:', error);
            alert('Có lỗi khi nộp bài. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Go back to the previous page
    const handleBack = () => {
        navigate(`/course-detail/${courseId}/${chapterId}/${lessonId}/quiz`);
    };

    // Navigate between questions
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

    // Calculate progress percentage
    const progressPercentage = quizData.length > 0
        ? Math.round((Object.keys(selectedAnswers).length / quizData.length) * 100)
        : 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4 animate-spin" />
                    <p className="text-lg text-blue-700 font-medium">Đang tải bài quiz...</p>
                </div>
            </div>
        );
    }

    const currentQuestion = quizData[currentQuestionIndex];
    const correctAnswersCount = submitted ? quizData.reduce((count, q) => {
        const correctIds = q.answers.filter(a => a.isCorrect).map(a => a.id);
        const selected = selectedAnswers[q.id] || [];
        return count + (correctIds.length === selected.length && correctIds.every(id => selected.includes(id)) ? 1 : 0);
    }, 0) : 0;

    // Render result view
    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 md:p-6">
                <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-5 text-white relative">
                        <button
                            onClick={handleBack}
                            className="absolute top-5 left-5 text-white hover:text-blue-100 flex items-center transition-all"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" /> Quay lại
                        </button>
                        <h1 className="text-2xl font-bold text-center">
                            Kết quả Bài Quiz
                        </h1>
                    </div>

                    {/* Result layout */}
                    <div className="flex flex-col md:flex-row">
                        {/* Result summary */}
                        <div className="md:w-1/3 p-6 border-r">
                            <div className={`p-6 rounded-xl ${
                                score! >= 70 ? 'bg-green-50' : score! >= 50 ? 'bg-yellow-50' : 'bg-red-50'
                            }`}>
                                <h2 className="text-2xl font-bold text-center mb-4">
                                    {score! >= 70 ? 'Xuất sắc!' : score! >= 50 ? 'Khá tốt!' : 'Cần cố gắng hơn!'}
                                </h2>
                                <div className="flex justify-center mb-6">
                                    <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
                                        score! >= 70 ? 'bg-green-100 text-green-600' :
                                            score! >= 50 ? 'bg-yellow-100 text-yellow-600' :
                                                'bg-red-100 text-red-600'
                                    }`}>
                                        <span className="text-3xl font-bold">
                                            {score}%
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div className="bg-white p-3 rounded-lg shadow-sm">
                                        <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                                        <p className="font-medium">{correctAnswersCount} đúng</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg shadow-sm">
                                        <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                                        <p className="font-medium">{quizData.length - correctAnswersCount} sai</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg shadow-sm">
                                        <Award className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                                        <p className="font-medium">{quizData.length} tổng</p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleBack}
                                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-3 rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-colors shadow-md flex items-center justify-center gap-2 mt-6"
                                >
                                    <Award className="w-5 h-5" /> Hoàn thành bài học
                                </button>
                            </div>
                        </div>

                        {/* Detailed results */}
                        <div className="md:w-2/3 p-6 max-h-screen overflow-y-auto">
                            <h2 className="text-xl font-bold mb-4">Chi tiết bài làm:</h2>
                            <div className="space-y-4">
                                {quizData.map((question, index) => {
                                    const userAnswers = selectedAnswers[question.id] || [];
                                    const correctAnswerIds = question.answers.filter(a => a.isCorrect).map(a => a.id);
                                    const isQuestionCorrect = correctAnswerIds.length === userAnswers.length &&
                                        correctAnswerIds.every(id => userAnswers.includes(id));

                                    return (
                                        <div
                                            key={question.id}
                                            className={`p-4 rounded-lg ${
                                                isQuestionCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3 mb-3">
                                                {isQuestionCorrect ? (
                                                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                                ) : (
                                                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                                )}
                                                <div>
                                                    <p className="font-medium text-base">Câu {index + 1}: {question.text}</p>
                                                    {!isQuestionCorrect && (
                                                        <p className="text-xs text-red-600 mt-1 flex items-center">
                                                            <AlertCircle className="w-3.5 h-3.5 mr-1" /> Đáp án chưa chính xác
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="ml-8 space-y-2">
                                                {question.answers.map(answer => {
                                                    const isSelected = userAnswers.includes(answer.id);
                                                    const isCorrect = answer.isCorrect;

                                                    let answerClass = 'border';
                                                    if (isSelected && isCorrect) answerClass = 'border-green-500 bg-green-50';
                                                    else if (isSelected && !isCorrect) answerClass = 'border-red-500 bg-red-50';
                                                    else if (!isSelected && isCorrect) answerClass = 'border-green-500 bg-green-50';
                                                    else answerClass = 'border-gray-200';

                                                    return (
                                                        <div
                                                            key={answer.id}
                                                            className={`flex items-center gap-2 p-3 rounded-md text-sm ${answerClass}`}
                                                        >
                                                            {isSelected && isCorrect && <CheckCircle className="w-4 h-4 text-green-600" />}
                                                            {isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-600" />}
                                                            {!isSelected && isCorrect && <CheckCircle className="w-4 h-4 text-green-600" />}
                                                            {!isSelected && !isCorrect && <div className="w-4 h-4"></div>}

                                                            <p className={`${isCorrect ? 'font-medium' : ''}`}>
                                                                {answer.text}
                                                            </p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Render quiz view
    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-5 text-white relative">
                    <button
                        onClick={handleBack}
                        className="absolute top-5 left-5 text-white hover:text-blue-100 flex items-center transition-all"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" /> Quay lại
                    </button>
                    <h1 className="text-2xl font-bold text-center">
                        Bài Quiz
                    </h1>
                    <div className="mt-3 max-w-md mx-auto flex items-center gap-3">
                        <div className="bg-blue-100 bg-opacity-30 h-2 rounded-full flex-grow">
                            <div
                                className="bg-white h-2 rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                        <div className="text-xs text-blue-50 font-medium whitespace-nowrap">
                            <span>{Object.keys(selectedAnswers).length}/{quizData.length}</span>
                        </div>
                    </div>
                </div>

                {/* Horizontal layout */}
                <div className="flex flex-col md:flex-row">
                    {/* Question navigation sidebar */}
                    <div className="md:w-1/4 p-4 bg-gray-50 border-r">
                        <div className="sticky top-4">
                            <h3 className="font-medium text-base mb-4 text-gray-700">Câu hỏi:</h3>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                {quizData.map((question, idx) => {
                                    const isAnswered = selectedAnswers[question.id]?.length > 0;

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentQuestionIndex(idx)}
                                            className={`h-10 rounded-lg flex items-center justify-center transition-colors ${
                                                idx === currentQuestionIndex
                                                    ? 'bg-blue-600 text-white font-medium'
                                                    : isAnswered
                                                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                                        : 'bg-white text-gray-500 border border-gray-200 hover:border-blue-300'
                                            }`}
                                        >
                                            {idx + 1}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-6 border-t pt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Tiến độ:</span>
                                    <span className="text-sm text-blue-600 font-medium">
                                        {Object.keys(selectedAnswers).length}/{quizData.length}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="h-2.5 rounded-full bg-blue-600 transition-all"
                                        style={{ width: `${progressPercentage}%` }}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSubmitQuiz}
                                className={`w-full mt-6 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                                    Object.keys(selectedAnswers).length === 0
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-md'
                                }`}
                                disabled={isSubmitting || Object.keys(selectedAnswers).length === 0}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Đang nộp bài...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" /> Nộp bài kiểm tra
                                    </>
                                )}
                            </button>

                            {Object.keys(selectedAnswers).length < quizData.length && (
                                <p className="text-center text-amber-600 text-xs flex items-center justify-center mt-2">
                                    <AlertCircle className="w-3.5 h-3.5 mr-1" />
                                    Bạn chưa trả lời hết các câu hỏi!
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Main content */}
                    <div className="md:w-3/4 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <span className="bg-blue-100 text-blue-800 font-medium px-3 py-1 rounded-full text-sm">
                                Câu hỏi {currentQuestionIndex + 1}/{quizData.length}
                            </span>
                            <div className="flex items-center text-red-500 text-sm">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                <span>Câu trả lời không được lưu tự động</span>
                            </div>
                        </div>

                        <div className="p-5 bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
                            <p className="text-lg font-medium text-gray-800 mb-6">
                                {currentQuestion.text}
                            </p>
                            <div className="space-y-3">
                                {currentQuestion.answers.map(answer => {
                                    const isSelected = (selectedAnswers[currentQuestion.id] || []).includes(answer.id);

                                    return (
                                        <div
                                            key={answer.id}
                                            className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-blue-50 ${
                                                isSelected
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-blue-300'
                                            }`}
                                            onClick={() => handleAnswerChange(currentQuestion.id, answer.id)}
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
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <button
                                onClick={goToPrevQuestion}
                                className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors ${
                                    currentQuestionIndex > 0
                                        ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                                disabled={currentQuestionIndex === 0}
                            >
                                <ArrowLeft className="w-4 h-4" /> Câu trước
                            </button>

                            <button
                                onClick={goToNextQuestion}
                                className={`bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 text-sm transition-colors ${
                                    currentQuestionIndex < quizData.length - 1 ? 'visible' : 'invisible'
                                }`}
                            >
                                Câu tiếp theo <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizPage;