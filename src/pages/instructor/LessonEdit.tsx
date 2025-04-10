import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { requestWithAuth } from '../../utils/request';
import { ENDPOINTS } from '../../constants/endpoint';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import VideoLessonEdit from "../../components/instructor/VideoLessonEdit";
import QuizLessonEdit from "../../components/instructor/QuizLessonEdit";

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

const LessonEdit = () => {
    const { courseId, chapterId, lessonId } = useParams();
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchLesson();
    }, [lessonId]);

    const fetchLesson = async () => {
        try {
            setLoading(true);
            const response = await requestWithAuth<{lesson : Lesson}>(
                `${ENDPOINTS.INSTRUCTOR.COURSES}/${courseId}/chapter/${chapterId}/lesson/${lessonId}`
            );
            setLesson(response.lesson);
            setError(null);
        } catch (err) {
            setError('Không thể tải thông tin bài học');
            console.error('Error fetching lesson:', err);
        } finally {
            setLoading(false);
        }
    };

    const renderLessonEditor = () => {
        if (!lesson) return null;

        switch (lesson.type) {
            case 'video':
                return <VideoLessonEdit lesson={lesson} />;
            case 'text':
                return <div>Text Editor Component (Coming Soon)</div>;
            case 'code':
                return <div>Code Editor Component (Coming Soon)</div>;
            case 'quiz':
                return <QuizLessonEdit lesson={lesson} />;
            default:
                return <div>Unsupported lesson type</div>;
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center">Đang tải...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-red-600">{error}</div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6 flex items-center gap-4">
                <Link
                    to={`/instructor/course/${courseId}/chapter/${chapterId}`}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-5 h-5"/>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">
                    Chỉnh sửa bài học - {lesson?.title}
                </h1>
            </div>
            {renderLessonEditor()}
        </div>
    );
};

export default LessonEdit;