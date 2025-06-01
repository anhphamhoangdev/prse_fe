import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { requestPostWithAuth } from '../../utils/request';
import { ENDPOINTS } from '../../constants/endpoint';
import { LessonInstructorEdit } from '../../types/course';
import {
    ChevronLeft,
    Video,
    Code,
    AlertCircle,
    Save,
    Loader2
} from 'lucide-react';
import VideoLessonEditor from "../../components/instructor/VideoLessonEditor";
import CodeLessonEditor from "../../components/instructor/CodeLessonEditor";


interface LessonDraftResponse {
    lesson_draft: LessonInstructorEdit
}

const LessonCreate = () => {
    const { courseId, chapterId } = useParams();
    const navigate = useNavigate();

    // Basic lesson info
    const [title, setTitle] = useState('');
    const [type, setType] = useState<LessonInstructorEdit['type']>('video');

    // General states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getLessonIcon = (lessonType: string) => {
        switch (lessonType) {
            case 'video':
                return <Video className="w-5 h-5" />;
            case 'code':
                return <Code className="w-5 h-5 text-blue-600" />;
            default:
                return <Video className="w-5 h-5" />;
        }
    };

    const handleSubmit = async (lessonData: any) => {
        if (!title.trim()) {
            setError('Vui lòng nhập tiêu đề bài học');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Create lesson with basic info - auto publish = false
            const newLesson: LessonInstructorEdit = {
                id: 0,
                title: title.trim(),
                type,
                publish: true, // Auto set to false
                orderIndex: 0, // Auto set to 0
            };

            const createResponse = await requestPostWithAuth<LessonDraftResponse>(
                `${ENDPOINTS.INSTRUCTOR.COURSES}/${courseId}/chapter/${chapterId}/lesson-draft`,
                { lesson: newLesson }
            );

            const lessonId = createResponse.lesson_draft.id;

            // Handle type-specific content submission
            await lessonData.submitContent(lessonId);

            // Navigate back to chapter page
            navigate(`/instructor/course/${courseId}/chapter/${chapterId}`);

        } catch (err) {
            setError('Không thể tạo bài học');
            console.error('Error creating lesson:', err);
        } finally {
            setLoading(false);
        }
    };

    const renderContentEditor = () => {
        switch (type) {
            case 'video':
                return (
                    <VideoLessonEditor
                        courseId={courseId}
                        chapterId={chapterId}
                        onSubmit={handleSubmit}
                        loading={loading}
                    />
                );

            case 'code':
                return (
                    <CodeLessonEditor
                        courseId={courseId}
                        chapterId={chapterId}
                        onSubmit={handleSubmit}
                        loading={loading}
                    />
                );

            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="fixed h-full w-full inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center z-50">
                <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500 mb-4"></div>
                <p className="text-white text-lg font-medium">Đang tạo bài học...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="mb-6 flex items-center gap-4">
                <Link
                    to={`/instructor/course/${courseId}/chapter/${chapterId}`}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-5 h-5"/>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">
                    Tạo bài học mới
                </h1>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Basic Information */}
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold mb-4">Thông tin cơ bản</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tiêu đề bài học *
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Nhập tiêu đề bài học"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Loại bài học
                            </label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as LessonInstructorEdit['type'])}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="video">Video bài giảng</option>
                                <option value="code">Bài thực hành</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Type-specific Content */}
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        {getLessonIcon(type)}
                        <h3 className="text-lg font-semibold text-gray-900">
                            Nội dung {type === 'video' ? 'video' : 'thực hành'}
                        </h3>
                    </div>

                    {renderContentEditor()}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-4 mx-6 mb-6 rounded-lg bg-red-50 text-red-600 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        <span>{error}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LessonCreate;