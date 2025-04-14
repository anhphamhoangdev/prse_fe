import {
    ChevronDown,
    ChevronUp,
    Play,
    FileText,
    Code,
    BookOpen,
    CheckCircle,
    Sparkles,
    Trophy,
    Brain
} from 'lucide-react';
import React, { useCallback, useState } from "react";
import { CourseCurriculumDTO, Chapter, Lesson } from "../../../types/course";
import { formatDuration } from "../../../utils/formatSecondToHour";
import { useNavigate } from "react-router-dom";

interface CourseContentProps {
    curriculum: CourseCurriculumDTO;
    expandedChapters: Record<number, boolean>;
    setExpandedChapters: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
    isEnrolled: boolean;
    courseId: string | undefined;
    onLessonClick?: (chapterId: number, lessonId: number) => void;
}

export const CourseContent: React.FC<CourseContentProps> = ({
                                                                curriculum,
                                                                expandedChapters,
                                                                setExpandedChapters,
                                                                courseId = "0",
                                                                isEnrolled = false,
                                                                onLessonClick,
                                                            }) => {
    const navigate = useNavigate();
    const [showMotivation, setShowMotivation] = useState(false);

    // Lấy dữ liệu trực tiếp từ curriculum
    const { courseProgress, courseStatus, totalLessons, completedLessons, remainingLessons, chapters } = curriculum;

    const motivationalQuotes = [
        "Học, học nữa, học mãi! 📚",
        "Kiến thức là chìa khóa mở mọi cánh cửa! 🔑",
        "Mỗi ngày học một ít, mỗi ngày tiến một bước! 👣",
        "Đầu tư cho kiến thức, sinh lời cả đời! 💎",
        "Hôm nay chăm chỉ, ngày mai tỏa sáng! ⭐",
        "Không có gì là không thể, chỉ cần bạn dám ước mơ! 🌟",
        "Chỉ cần bạn không bỏ cuộc, thành công sẽ đến! 💪",
        "Học hỏi là hành trình không có điểm dừng! 🚀",
        "Mỗi thất bại là một bài học quý giá! 📖",
        "Nỗ lực hôm nay, thành công ngày mai! ⏳",
        "Kiến thức là sức mạnh, hãy khai phóng nó! ⚡",
        "Bước đầu tiên là điều quan trọng nhất, hãy bắt đầu ngay! 🏁",
        "Thành công không đến từ việc chờ đợi, mà từ việc hành động! 🏆",
        "Hãy tin vào chính mình, bạn có thể làm được! 🌈",
        "Mỗi ngày là một cơ hội mới để học hỏi! 🌅"
    ];

    const getRandomQuote = () => {
        return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    };

    const getLessonIcon = (type: Lesson['type'], status?: string): JSX.Element => {
        if (isEnrolled && status === 'completed') {
            return <CheckCircle className="w-4 h-4 text-green-600" />;
        }

        switch (type) {
            case 'video':
                return <Play className="w-4 h-4" />;
            case 'text':
                return <FileText className="w-4 h-4" />;
            case 'code':
                return <Code className="w-4 h-4" />;
            case 'quiz':
                return <BookOpen className="w-4 h-4" />;
            default:
                return <FileText className="w-4 h-4" />;
        }
    };

    const getProgressColor = (status?: string): string => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-600';
            case 'in_progress':
                return 'bg-blue-100 text-blue-600';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    const CourseSummary = () => {
        return (
            <div className="mb-6 space-y-4">
                <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            Tóm tắt khoá học
                            <Sparkles className="w-5 h-5 text-yellow-500" />
                        </h3>
                        <div className="flex gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1 bg-purple-50 px-3 py-1 rounded-full hover:bg-purple-100 transition-colors">
                                <Trophy className="w-4 h-4 text-purple-500" />
                                {chapters.length} chương học
                            </span>
                            <span className="flex items-center gap-1 bg-orange-50 px-3 py-1 rounded-full hover:bg-orange-100 transition-colors">
                                <Brain className="w-4 h-4 text-orange-500" />
                                {totalLessons} bài học
                            </span>
                            {isEnrolled && (
                                <span className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full hover:bg-green-100 transition-colors">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    Đã học: {completedLessons}/{totalLessons} bài
                                </span>
                            )}
                        </div>
                        {isEnrolled && (
                            <div className="pt-2">
                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                    <span>Tiến độ khóa học</span>
                                    <span className="font-medium">{Math.round(courseProgress)}%</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                                        style={{ width: `${courseProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    {!isEnrolled ? (
                        <div
                            className="relative bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 cursor-pointer hover:shadow-md transition-all duration-300"
                            onMouseEnter={() => setShowMotivation(true)}
                            onMouseLeave={() => setShowMotivation(false)}
                        >
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-yellow-500 animate-spin" />
                                Hãy đăng ký khóa học ngay để "khai thác" kho tàng kiến thức nhé!
                            </div>
                            {showMotivation && (
                                <div className="absolute -top-8 left-0 right-0 text-center bg-white p-2 rounded-lg shadow-lg border border-gray-200 text-purple-600 animate-bounce">
                                    {getRandomQuote()}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-end gap-2">
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3 text-sm">
                                <div className="font-medium text-blue-800 mb-1">
                                    {courseProgress === 0 ? (
                                        "Hãy bắt đầu hành trình học tập của bạn! 🚀"
                                    ) : courseProgress < 30 ? (
                                        "Khởi đầu tuyệt vời! Hãy tiếp tục nhé! 💪"
                                    ) : courseProgress < 60 ? (
                                        "Bạn đang làm rất tốt! Cố lên! ⭐"
                                    ) : courseProgress < 90 ? (
                                        "Sắp hoàn thành rồi! Cố gắng nào! 🎯"
                                    ) : courseProgress < 100 ? (
                                        "Chỉ còn một chút nữa thôi! Chiến thắng trong tầm tay! 🏆"
                                    ) : (
                                        "Chúc mừng bạn đã hoàn thành khóa học! 🎉"
                                    )}
                                </div>
                                {courseProgress > 0 && courseProgress < 100 && (
                                    <div className="text-xs text-blue-600">
                                        Còn {remainingLessons} bài học nữa để hoàn thành
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const handleLessonNavigation = useCallback((lesson: Lesson, chapterId: number) => {
        if (!isEnrolled) return;

        if (onLessonClick) {
            onLessonClick(chapterId, lesson.id);
        }

        const baseCoursePath = `/course-detail/${courseId}`;
        switch (lesson.type) {
            case 'video':
                navigate(`${baseCoursePath}/${chapterId}/${lesson.id}/video`);
                break;
            case 'text':
                navigate(`${baseCoursePath}/${chapterId}/${lesson.id}/reading`);
                break;
            case 'code':
                navigate(`${baseCoursePath}/${chapterId}/${lesson.id}/practice`);
                break;
            case 'quiz':
                navigate(`${baseCoursePath}/${chapterId}/${lesson.id}/quiz`);
                break;
            default:
                navigate(`${baseCoursePath}/${chapterId}/${lesson.id}`);
        }
    }, [isEnrolled, courseId, navigate, onLessonClick]);

    const renderChapterProgress = (chapter: Chapter) => {
        if (!isEnrolled || !chapter.progress) return null;

        const { status, progressPercent } = chapter.progress;

        return (
            <div className="flex items-center space-x-2">
                <div className={`px-2 py-1 rounded-full text-xs ${getProgressColor(status || 'not_started')}`}>
                    {status === 'completed'
                        ? 'Đã hoàn thành'
                        : status === 'in_progress'
                            ? 'Đang tiến hành'
                            : 'Chưa bắt đầu'}
                </div>
                {progressPercent != null && (
                    <span className="text-sm text-gray-500">
                        {Math.round(progressPercent)}%
                    </span>
                )}
            </div>
        );
    };

    const renderLessonStatus = (lesson: Lesson) => {
        if (!isEnrolled || !lesson.progress) return null;

        return (
            <>
                {lesson.progress.lastAccessedAt && (
                    <span className="text-xs text-gray-500">
                        Lần cuối truy cập: {new Date(lesson.progress.lastAccessedAt).toLocaleDateString()}
                    </span>
                )}
            </>
        );
    };

    return (
        <div className="space-y-4">
            <CourseSummary />
            {chapters.map((chapter) => (
                <div key={chapter.id} className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <button
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                        onClick={() => setExpandedChapters((prev) => ({
                            ...prev,
                            [chapter.id]: !prev[chapter.id],
                        }))}
                    >
                        <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{chapter.title}</span>
                            <span className="text-sm text-blue-600">({chapter.lessons.length} bài học)</span>
                            {renderChapterProgress(chapter)}
                        </div>
                        {chapter.lessons.length > 0 ? (
                            expandedChapters[chapter.id] ? (
                                <ChevronUp className="w-5 h-5 text-gray-500" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-500" />
                            )
                        ) : null}
                    </button>

                    {expandedChapters[chapter.id] && (
                        <div className="border-t border-gray-200">
                            {chapter.lessons.map((lesson) => (
                                <div
                                    key={lesson.id}
                                    className={`
                                        flex items-center space-x-3 p-4
                                        ${isEnrolled ? 'cursor-pointer hover:bg-gray-50' : ''}
                                        ${lesson.progress?.status === 'completed' ? 'bg-green-50' : ''}
                                    `}
                                    onClick={() => handleLessonNavigation(lesson, chapter.id)}
                                >
                                    <span className={`p-2 rounded-lg ${getProgressColor(lesson.progress?.status || 'not_started')}`}>
                                        {getLessonIcon(lesson.type, lesson.progress?.status || "not_started")}
                                    </span>
                                    <span className="flex-grow flex items-center gap-3">
                                        <span className="text-gray-700">{lesson.title}</span>
                                        {renderLessonStatus(lesson)}
                                    </span>
                                    {lesson.duration && (
                                        <span className="text-sm text-gray-500">
                                            {formatDuration(lesson.duration ? lesson.duration : 0)}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};