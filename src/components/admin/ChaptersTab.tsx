// tabs/ChaptersTab.tsx
import React, { useState, useEffect } from 'react';
import {
    RefreshCw,
    Book,
    CheckCircle,
    XCircle,
    ChevronDown,
    ChevronRight,
    Play,
    HelpCircle,
    Clock
} from 'lucide-react';
import {Chapter, ChaptersApiResponse, Lesson, PublishUpdateStatus, Question} from "../../types/admin";
import {putAdminWithAuth, requestAdminWithAuth} from "../../utils/request";
import {ENDPOINTS} from "../../constants/endpoint";


interface ChaptersTabProps {
    courseId: string;
    setSuccessMessage: (message: string | null) => void;
    setError: (error: string | null) => void;
}

const ChaptersTab = ({ courseId, setSuccessMessage, setError }: ChaptersTabProps) => {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loadingChapters, setLoadingChapters] = useState(false);
    const [errorChapters, setErrorChapters] = useState<string | null>(null);
    const [expandedChapters, setExpandedChapters] = useState<Record<number, boolean>>({});
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [showLessonModal, setShowLessonModal] = useState(false);
    const [updatingPublishStatus, setUpdatingPublishStatus] = useState<PublishUpdateStatus | undefined>(undefined);

    useEffect(() => {
        fetchChapters();
    }, [courseId]);

    const fetchChapters = async () => {
        if (!courseId) return;

        setLoadingChapters(true);
        setErrorChapters(null);

        try {
            const response = await requestAdminWithAuth<ChaptersApiResponse>(`${ENDPOINTS.ADMIN.COURSES}/${courseId}/content`);

            if (response && response.chapters) {
                setChapters(response.chapters);

                // Mở tất cả chương theo mặc định
                const initialExpandedState: Record<number, boolean> = {};
                response.chapters.forEach(chapter => {
                    initialExpandedState[chapter.id] = true;
                });
                setExpandedChapters(initialExpandedState);
            } else {
                setErrorChapters('Không thể tải thông tin chương và bài học');
            }
        } catch (err) {
            setErrorChapters(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải thông tin chương và bài học');
        } finally {
            setLoadingChapters(false);
        }
    };

    const toggleChapter = (chapterId: number) => {
        setExpandedChapters(prev => ({
            ...prev,
            [chapterId]: !prev[chapterId]
        }));
    };

    const toggleChapterPublish = async (chapter: Chapter, e: React.MouseEvent) => {
        e.stopPropagation(); // Ngăn không cho event lan truyền lên thẻ cha (không mở/đóng chapter)

        if (updatingPublishStatus) return; // Nếu đang có action publish/unpublish khác thì không làm gì

        setUpdatingPublishStatus({id: chapter.id, type: 'chapter', loading: true});

        try {
            // API call để toggle publish status của chapter
            await putAdminWithAuth(`${ENDPOINTS.ADMIN.COURSES}/${courseId}/chapters/${chapter.id}/updatePublish`, {});

            // Cập nhật state local
            const updatedChapters = chapters.map(c => {
                if (c.id === chapter.id) {
                    return { ...c, isPublish: !c.isPublish };
                }
                return c;
            });

            setChapters(updatedChapters);
            setSuccessMessage(`Chương "${chapter.title}" đã được ${chapter.isPublish ? 'hủy xuất bản' : 'xuất bản'} thành công`);
        } catch (err) {
            setError(err instanceof Error ? err.message : `Đã xảy ra lỗi khi cập nhật trạng thái xuất bản của chương "${chapter.title}"`);
        } finally {
            setUpdatingPublishStatus(undefined);
        }
    };

    const toggleLessonPublish = async (lesson: Lesson, chapterId: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Ngăn không cho event lan truyền lên thẻ cha

        if (updatingPublishStatus) return; // Nếu đang có action publish/unpublish khác thì không làm gì

        setUpdatingPublishStatus({id: lesson.id, type: 'lesson', loading: true});

        try {
            // API call để toggle publish status của lesson
            await putAdminWithAuth(`${ENDPOINTS.ADMIN.COURSES}/${courseId}/chapters/${chapterId}/lessons/${lesson.id}/updatePublish`, {});

            // Cập nhật state local
            const updatedChapters = chapters.map(c => {
                if (c.id === chapterId) {
                    const updatedLessons = c.lessons.map(l => {
                        if (l.id === lesson.id) {
                            return { ...l, isPublish: !l.isPublish };
                        }
                        return l;
                    });
                    return { ...c, lessons: updatedLessons };
                }
                return c;
            });

            setChapters(updatedChapters);
            setSuccessMessage(`Bài học "${lesson.title}" đã được ${lesson.isPublish ? 'hủy xuất bản' : 'xuất bản'} thành công`);
        } catch (err) {
            setError(err instanceof Error ? err.message : `Đã xảy ra lỗi khi cập nhật trạng thái xuất bản của bài học "${lesson.title}"`);
        } finally {
            setUpdatingPublishStatus(undefined);
        }
    };

    const openLessonModal = (lesson: Lesson) => {
        setSelectedLesson(lesson);
        setShowLessonModal(true);
    };

    const closeLessonModal = () => {
        setShowLessonModal(false);
        setSelectedLesson(null);
    };

    const formatDuration = (duration: number) => {
        if (duration < 60) {
            return `${Math.round(duration)} giây`;
        }

        const minutes = Math.floor(duration / 60);
        const seconds = Math.round(duration % 60);

        return `${minutes} phút${seconds > 0 ? ` ${seconds} giây` : ''}`;
    };

    return (
        <div className="bg-gray-50 rounded-lg">
            {loadingChapters ? (
                <div className="flex justify-center items-center h-64">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            ) : errorChapters ? (
                <div className="p-6">
                    <div className="text-red-600 text-center py-8">{errorChapters}</div>
                    <div className="flex justify-center">
                        <button
                            onClick={fetchChapters}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Thử lại
                        </button>
                    </div>
                </div>
            ) : chapters.length === 0 ? (
                <div className="p-6 text-center py-8 text-gray-500">
                    <p>Chưa có chương và bài học nào.</p>
                </div>
            ) : (
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Nội dung khóa học ({chapters.length} chương)
                        </h2>
                    </div>

                    {/* Chapter list */}
                    <div className="space-y-4">
                        {chapters.map((chapter) => (
                            <ChapterItem
                                key={chapter.id}
                                chapter={chapter}
                                expandedChapters={expandedChapters}
                                toggleChapter={toggleChapter}
                                toggleChapterPublish={toggleChapterPublish}
                                toggleLessonPublish={toggleLessonPublish}
                                openLessonModal={openLessonModal}
                                formatDuration={formatDuration}
                                updatingPublishStatus={updatingPublishStatus}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Lesson detail modal */}
            {showLessonModal && (
                <LessonDetailModal
                    lesson={selectedLesson}
                    closeLessonModal={closeLessonModal}
                    formatDuration={formatDuration}
                />
            )}
        </div>
    );
};

interface ChapterItemProps {
    chapter: Chapter;
    expandedChapters: Record<number, boolean>;
    toggleChapter: (chapterId: number) => void;
    toggleChapterPublish: (chapter: Chapter, e: React.MouseEvent) => Promise<void>;
    toggleLessonPublish: (lesson: Lesson, chapterId: number, e: React.MouseEvent) => Promise<void>;
    openLessonModal: (lesson: Lesson) => void;
    formatDuration: (duration: number) => string;
    updatingPublishStatus: PublishUpdateStatus | undefined;
}

const ChapterItem = ({
                         chapter,
                         expandedChapters,
                         toggleChapter,
                         toggleChapterPublish,
                         toggleLessonPublish,
                         openLessonModal,
                         formatDuration,
                         updatingPublishStatus
                     }: ChapterItemProps) => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Chapter header */}
            <div
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                onClick={() => toggleChapter(chapter.id)}
            >
                <div className="flex items-center gap-2">
                    <Book className="w-5 h-5 text-blue-500" />
                    <h3 className="font-medium text-gray-900">
                        {chapter.orderIndex + 1}. {chapter.title}
                    </h3>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                        {chapter.lessons.length} bài học
                    </span>

                    {/* Toggle publish button */}
                    <button
                        onClick={(e) => toggleChapterPublish(chapter, e)}
                        disabled={updatingPublishStatus !== undefined && updatingPublishStatus.id === chapter.id}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                            chapter.isPublish
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        } transition-colors`}
                    >
                        {updatingPublishStatus !== undefined && updatingPublishStatus.id === chapter.id ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : chapter.isPublish ? (
                            <CheckCircle className="w-3 h-3" />
                        ) : (
                            <XCircle className="w-3 h-3" />
                        )}
                        {chapter.isPublish ? 'Đã xuất bản' : 'Chưa xuất bản'}
                    </button>

                    {/* Expand/collapse icon */}
                    {expandedChapters[chapter.id] ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                </div>
            </div>

            {/* Lesson list */}
            {expandedChapters[chapter.id] && (
                <div className="border-t border-gray-200">
                    {chapter.lessons.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {chapter.lessons.map((lesson) => (
                                <LessonItem
                                    key={lesson.id}
                                    lesson={lesson}
                                    chapterId={chapter.id}
                                    openLessonModal={openLessonModal}
                                    toggleLessonPublish={toggleLessonPublish}
                                    formatDuration={formatDuration}
                                    updatingPublishStatus={updatingPublishStatus}
                                />
                            ))}
                        </ul>
                    ) : (
                        <div className="py-4 px-6 text-center text-gray-500">
                            <p>Chưa có bài học nào trong chương này.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

interface LessonItemProps {
    lesson: Lesson;
    chapterId: number;
    openLessonModal: (lesson: Lesson) => void;
    toggleLessonPublish: (lesson: Lesson, chapterId: number, e: React.MouseEvent) => Promise<void>;
    formatDuration: (duration: number) => string;
    updatingPublishStatus: PublishUpdateStatus | undefined;
}

const LessonItem = ({
                        lesson,
                        chapterId,
                        openLessonModal,
                        toggleLessonPublish,
                        formatDuration,
                        updatingPublishStatus
                    }: LessonItemProps) => {
    return (
        <li
            className="p-4 pl-10 hover:bg-gray-50 cursor-pointer"
            onClick={() => openLessonModal(lesson)}
        >
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    {lesson.type === 'video' ? (
                        <Play className="w-4 h-4 text-blue-500" />
                    ) : (
                        <HelpCircle className="w-4 h-4 text-orange-500" />
                    )}
                    <div>
                        <h4 className="font-medium text-gray-800">
                            {lesson.orderIndex}. {lesson.title}
                        </h4>
                        {lesson.type === 'video' && lesson.videoLesson && (
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3" />
                                {formatDuration(lesson.videoLesson.duration)}
                            </p>
                        )}
                        {lesson.type === 'quiz' && lesson.questions && (
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                {lesson.questions.length} câu hỏi
                            </p>
                        )}
                    </div>
                </div>

                {/* Toggle publish button */}
                <button
                    onClick={(e) => toggleLessonPublish(lesson, chapterId, e)}
                    disabled={updatingPublishStatus !== undefined && updatingPublishStatus.id === lesson.id}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        lesson.isPublish
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    } transition-colors`}
                >
                    {updatingPublishStatus !== undefined && updatingPublishStatus.id === lesson.id ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : lesson.isPublish ? (
                        <CheckCircle className="w-3 h-3" />
                    ) : (
                        <XCircle className="w-3 h-3" />
                    )}
                    {lesson.isPublish ? 'Đã xuất bản' : 'Chưa xuất bản'}
                </button>
            </div>
        </li>
    );
};

interface LessonDetailModalProps {
    lesson: Lesson | null;
    closeLessonModal: () => void;
    formatDuration: (duration: number) => string;
}

const LessonDetailModal = ({ lesson, closeLessonModal, formatDuration }: LessonDetailModalProps) => {
    if (!lesson) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-auto">
                {/* Modal header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h3 className="text-lg font-medium text-gray-900">
                        Chi tiết bài học: {lesson.title}
                    </h3>
                    <button
                        onClick={closeLessonModal}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Modal body */}
                <div className="px-6 py-4">
                    {/* Lesson info */}
                    <div className="mb-6">
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <h4 className="font-medium mb-2">Thông tin cơ bản</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <p className="text-sm text-gray-500">Loại bài học:</p>
                                    <p className="font-medium">{lesson.type === 'video' ? 'Video' : 'Bài kiểm tra'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Thứ tự:</p>
                                    <p className="font-medium">{lesson.orderIndex}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Trạng thái:</p>
                                    <p className="font-medium">{lesson.isPublish ? 'Đã xuất bản' : 'Chưa xuất bản'}</p>
                                </div>
                                {lesson.type === 'video' && lesson.videoLesson && (
                                    <div>
                                        <p className="text-sm text-gray-500">Thời lượng:</p>
                                        <p className="font-medium">{formatDuration(lesson.videoLesson.duration)}</p>
                                    </div>
                                )}
                                {lesson.type === 'quiz' && lesson.questions && (
                                    <div>
                                        <p className="text-sm text-gray-500">Số câu hỏi:</p>
                                        <p className="font-medium">{lesson.questions.length}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Video content */}
                    {lesson.type === 'video' && lesson.videoLesson && (
                        <VideoLessonContent videoUrl={lesson.videoLesson.videoUrl} />
                    )}

                    {/* Quiz content */}
                    {lesson.type === 'quiz' && lesson.questions && (
                        <QuizLessonContent questions={lesson.questions} />
                    )}
                </div>

                {/* Modal footer */}
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                    <button
                        onClick={closeLessonModal}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

interface VideoLessonContentProps {
    videoUrl: string;
}

const VideoLessonContent = ({ videoUrl }: VideoLessonContentProps) => {
    return (
        <div className="mb-6">
            <h4 className="font-medium mb-2">Video bài học</h4>
            <div className="relative pt-[56.25%] rounded-lg overflow-hidden bg-gray-100">
                <iframe
                    src={videoUrl}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                ></iframe>
            </div>
        </div>
    );
};

interface QuizLessonContentProps {
    questions: Question[] | null;
}

const QuizLessonContent = ({ questions }: QuizLessonContentProps) => {
    if (!questions) return null;

    return (
        <div className="mb-6">
            <h4 className="font-medium mb-4">Nội dung bài kiểm tra</h4>

            <div className="space-y-6">
                {questions.map((question, qIndex) => (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start gap-2 mb-3">
                            <span className="bg-blue-100 text-blue-800 font-medium px-2 py-1 rounded text-xs">Câu {qIndex + 1}</span>
                            <h5 className="font-medium text-gray-900">{question.text}</h5>
                        </div>

                        {question.answers && question.answers.length > 0 ? (
                            <div className="pl-4 space-y-2">
                                {question.answers.map((answer) => (
                                    <div key={answer.id} className={`p-3 rounded-lg border ${
                                        answer.isCorrect ? 'border-green-200 bg-green-50' : 'border-gray-200'
                                    }`}>
                                        <div className="flex items-center gap-2">
                                            {answer.isCorrect && (
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                            )}
                                            <span>{answer.text}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic pl-4">Chưa có câu trả lời cho câu hỏi này.</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChaptersTab;