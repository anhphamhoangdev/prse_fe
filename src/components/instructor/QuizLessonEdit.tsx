import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { requestWithAuth, putWithAuth } from '../../utils/request';
import { ENDPOINTS } from '../../constants/endpoint';
import {AlertCircle, Plus, Trash2, CheckCircle2, Loader2} from 'lucide-react';

interface QuizLesson {
    id?: number;
    lessonId: number;
    questions: Question[];
    createdAt?: string;
    updatedAt?: string;
}

interface Question {
    id?: number;
    text: string;
    answers: Answer[];
}

interface Answer {
    id?: number;
    text: string;
    isCorrect: boolean;
}

interface Lesson {
    id: number;
    title: string;
    type: 'video' | 'text' | 'code' | 'quiz';
    isPublish: boolean;
    chapterId: number;
    orderIndex: number;
    createdAt: string;
    updatedAt: string;
}

interface QuizLessonEditProps {
    lesson: Lesson;
}

const QuizLessonEdit: React.FC<QuizLessonEditProps> = ({ lesson }) => {
    const { courseId, chapterId } = useParams();
    const [quizLesson, setQuizLesson] = useState<QuizLesson | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPublish, setIsPublish] = useState(lesson.isPublish);
    const [isSaving, setIsSaving] = useState(false);


    useEffect(() => {
        fetchQuizLesson();
    }, [lesson.id]);

    const fetchQuizLesson = async () => {
        try {
            setLoading(true);
            const response = await requestWithAuth<{
                quiz: Question[];
                lesson: Lesson;
            }>(`${ENDPOINTS.INSTRUCTOR.COURSES}/${courseId}/chapter/${chapterId}/lesson/${lesson.id}/details`);

            // Nếu quiz rỗng, khởi tạo QuizLesson với questions là mảng rỗng
            const quizData = response.quiz.length > 0
                ? {
                    lessonId: lesson.id,
                    questions: response.quiz,
                    createdAt: lesson.createdAt,
                    updatedAt: lesson.updatedAt,
                }
                : {
                    lessonId: lesson.id,
                    questions: [],
                    createdAt: lesson.createdAt,
                    updatedAt: lesson.updatedAt,
                };

            setQuizLesson(quizData);
            setError(null);
        } catch (err) {
            setError('Không thể tải thông tin quiz');
            console.error('Error fetching quiz lesson:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePublishToggle = async () => {
        try {
            await putWithAuth(
                `${ENDPOINTS.INSTRUCTOR.COURSES}/${courseId}/chapter/${chapterId}/lesson/${lesson.id}`,
                { isPublish: !isPublish }
            );
            setIsPublish(!isPublish);
        } catch (err) {
            console.error('Error updating publish status:', err);
        }
    };

    const addQuestion = () => {
        const newQuestion: Question = {
            text: '',
            answers: [{ text: '', isCorrect: false }],
        };
        setQuizLesson((prev) => ({
            ...prev!,
            questions: [...(prev?.questions || []), newQuestion],
        }));
    };

    const updateQuestion = (index: number, text: string) => {
        const updatedQuestions = [...quizLesson!.questions];
        updatedQuestions[index].text = text;
        setQuizLesson({ ...quizLesson!, questions: updatedQuestions });
    };

    const addAnswer = (questionIndex: number) => {
        const updatedQuestions = [...quizLesson!.questions];
        updatedQuestions[questionIndex].answers.push({ text: '', isCorrect: false });
        setQuizLesson({ ...quizLesson!, questions: updatedQuestions });
    };

    const updateAnswer = (
        questionIndex: number,
        answerIndex: number,
        field: 'text' | 'isCorrect',
        value: string | boolean
    ) => {
        const updatedQuestions = [...quizLesson!.questions];
        updatedQuestions[questionIndex].answers[answerIndex] = {
            ...updatedQuestions[questionIndex].answers[answerIndex],
            [field]: value,
        };
        setQuizLesson({ ...quizLesson!, questions: updatedQuestions });
    };

    const deleteQuestion = (index: number) => {
        const updatedQuestions = quizLesson!.questions.filter((_, i) => i !== index);
        setQuizLesson({ ...quizLesson!, questions: updatedQuestions });
    };

    const deleteAnswer = (questionIndex: number, answerIndex: number) => {
        const updatedQuestions = [...quizLesson!.questions];
        updatedQuestions[questionIndex].answers = updatedQuestions[questionIndex].answers.filter(
            (_, i) => i !== answerIndex
        );
        setQuizLesson({ ...quizLesson!, questions: updatedQuestions });
    };

    const handleSubmit = async () => {
        setIsSaving(true);
        try {
            const payload = {
                questions: quizLesson!.questions.map((q) => ({
                    id: q.id,
                    text: q.text,
                    answers: q.answers.map((a) => ({
                        id: a.id,
                        text: a.text,
                        isCorrect: a.isCorrect,
                    })),
                })),
            };

            const response = await putWithAuth(
                `${ENDPOINTS.INSTRUCTOR.COURSES}/${courseId}/chapter/${chapterId}/lesson/${lesson.id}/quiz`,
                payload
            );

            console.log('API Response:', response);
            setError(null);
            fetchQuizLesson(); // Refresh data after successful submission
        } catch (err) {
            setError('Không thể lưu quiz');
            console.error('Error submitting quiz:', err);
        }finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (isSaving) {
        return (
            <div className="fixed h-full w-full inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center z-50">
                <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500 mb-4"></div>
                <p className="text-white text-lg font-medium">Đang lưu thay đổi...</p>
            </div>
        );
    }



    return (
        <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Quản lý Quiz</h2>
                    <div className="flex items-center gap-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={isPublish}
                                onChange={handlePublishToggle}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            <span className="ml-3 text-sm font-medium text-gray-700">
                                {isPublish ? 'Đã xuất bản' : 'Nháp'}
                            </span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
                {/* Questions Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">Danh sách câu hỏi</h3>
                        <button
                            onClick={addQuestion}
                            className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4 mr-2"/>
                            Thêm câu hỏi
                        </button>
                    </div>

                    {quizLesson?.questions.length === 0 ? (
                        <div className="p-4 rounded-lg bg-blue-50 text-blue-600 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4"/>
                            <span>Chưa có câu hỏi nào cho quiz này</span>
                        </div>
                    ) : (
                        quizLesson?.questions.map((question, qIndex) => (
                            <div key={qIndex} className="p-4 border border-gray-200 rounded-lg space-y-4">
                                <div className="flex items-center justify-between">
                                    <input
                                        type="text"
                                        value={question.text}
                                        onChange={(e) => updateQuestion(qIndex, e.target.value)}
                                        placeholder="Nhập câu hỏi"
                                        className="flex-1 p-2 border border-gray-300 rounded-md"
                                    />
                                    <button
                                        onClick={() => deleteQuestion(qIndex)}
                                        className="ml-2 p-2 text-red-600 hover:text-red-800"
                                    >
                                        <Trash2 className="h-5 w-5"/>
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {question.answers.map((answer, aIndex) => (
                                        <div key={aIndex} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={answer.isCorrect}
                                                onChange={(e) =>
                                                    updateAnswer(qIndex, aIndex, 'isCorrect', e.target.checked)
                                                }
                                            />
                                            <input
                                                type="text"
                                                value={answer.text}
                                                onChange={(e) => updateAnswer(qIndex, aIndex, 'text', e.target.value)}
                                                placeholder="Nhập đáp án"
                                                className="flex-1 p-2 border border-gray-300 rounded-md"
                                            />
                                            <button
                                                onClick={() => deleteAnswer(qIndex, aIndex)}
                                                className="p-1 text-red-600 hover:text-red-800"
                                            >
                                                <Trash2 className="h-4 w-4"/>
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => addAnswer(qIndex)}
                                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                                    >
                                        <Plus className="h-4 w-4 mr-1"/>
                                        Thêm đáp án
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="h-5 w-5 mr-2 animate-spin"/>
                                Đang lưu...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-5 w-5 mr-2"/>
                                Lưu thay đổi
                            </>
                        )}
                    </button>
                </div>

                {error && (
                    <div className="p-4 rounded-lg bg-red-50 text-red-600 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4"/>
                        <span>{error}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizLessonEdit;