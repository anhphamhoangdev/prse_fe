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
    Brain,
    Award,
    Share2,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { Helmet } from 'react-helmet';
import { CourseCurriculumDTO, Chapter, Lesson } from '../../../types/course';
import { formatDuration } from '../../../utils/formatSecondToHour';
import { useNavigate } from 'react-router-dom';

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
                                                                courseId = '0',
                                                                isEnrolled = false,
                                                                onLessonClick,
                                                            }) => {
    const navigate = useNavigate();
    const [showMotivation, setShowMotivation] = useState(false);

    // Extract course data for meta tags
    const courseTitle =  'Khóa học tuyệt vời';
    const courseDescription =  'Học và nâng cao kỹ năng của bạn với khóa học này!';
    const courseImage =  'https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D'; // Replace with actual image URL

    // Lấy dữ liệu trực tiếp từ curriculum
    const { courseProgress, courseStatus, totalLessons, completedLessons, remainingLessons, chapters } = curriculum;

    const motivationalQuotes = [
        'Học, học nữa, học mãi! 📚',
        'Kiến thức là chìa khóa mở mọi cánh cửa! 🔑',
        'Mỗi ngày học một ít, mỗi ngày tiến một bước! 👣',
        'Đầu tư cho kiến thức, sinh lời cả đời! 💎',
        'Hôm nay chăm chỉ, ngày mai tỏa sáng! ⭐',
        'Không có gì là không thể, chỉ cần bạn dám ước mơ! 🌟',
        'Chỉ cần bạn không bỏ cuộc, thành công sẽ đến! 💪',
        'Học hỏi là hành trình không có điểm dừng! 🚀',
        'Mỗi thất bại là một bài học quý giá! 📖',
        'Nỗ lực hôm nay, thành công ngày mai! ⏳',
        'Kiến thức là sức mạnh, hãy khai phóng nó! ⚡',
        'Bước đầu tiên là điều quan trọng nhất, hãy bắt đầu ngay! 🏁',
        'Thành công không đến từ việc chờ đợi, mà từ việc hành động! 🏆',
        'Hãy tin vào chính mình, bạn có thể làm được! 🌈',
        'Mỗi ngày là một cơ hội mới để học hỏi! 🌅',
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

    const handleGetCertificate = () => {
        navigate(`/course/${courseId}/certificate`);
    };

    const handleShareLinkedIn = () => {
        const shareUrl = encodeURIComponent(`https://prse-fe.vercel.app/course/${courseId}`);
        const caption = encodeURIComponent(
            `Tôi vừa hoàn thành khóa học "${courseTitle}" trên EasyEDU! 🎉 Một hành trình học tập tuyệt vời! #HọcTập #ThànhTựu`
        );
        const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}&title=${caption}`;
        window.open(linkedInShareUrl, '_blank');
    };

    const CourseSummary = () => {
        return (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800 mb-4">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    Tóm tắt khóa học
                </h3>

                <div className="flex flex-wrap gap-3 mb-4">
          <span className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-lg text-purple-700 font-medium transition-all hover:bg-purple-100">
            <Trophy className="w-4 h-4 text-purple-500" />
              {chapters.length} chương học
          </span>
                    <span className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-lg text-orange-700 font-medium transition-all hover:bg-orange-100">
            <Brain className="w-4 h-4 text-orange-500" />
                        {totalLessons} bài học
          </span>
                    {isEnrolled && (
                        <span className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg text-green-700 font-medium transition-all hover:bg-green-100">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Hoàn thành: {completedLessons}/{totalLessons}
            </span>
                    )}
                </div>

                {isEnrolled && (
                    <div className="pt-2">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium text-gray-700">Tiến độ học tập</span>
                            <span className="font-semibold text-blue-600">{Math.round(courseProgress)}%</span>
                        </div>
                        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                                style={{ width: `${courseProgress}%` }}
                            />
                        </div>
                    </div>
                )}

                {!isEnrolled && (
                    <div
                        className="relative mt-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 text-blue-800 cursor-pointer hover:shadow-md transition-all duration-300"
                        onMouseEnter={() => setShowMotivation(true)}
                        onMouseLeave={() => setShowMotivation(false)}
                    >
                        <div className="flex items-center gap-2 font-medium">
                            <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
                            Đăng ký ngay để "khai thác" kho tàng kiến thức!
                        </div>
                        {showMotivation && (
                            <div className="absolute -top-12 left-0 right-0 text-center bg-white p-3 rounded-lg shadow-lg border border-purple-200 text-purple-700 font-medium animate-bounce">
                                {getRandomQuote()}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const CourseCompletion = () => {
        if (!isEnrolled || courseProgress < 100) return null;

        return (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200 shadow-sm">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-yellow-100 rounded-full">
                            <Trophy className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-green-800">Bạn đã hoàn thành khóa học! 🎉</h3>
                            <p className="text-sm text-green-700">Hãy nhận chứng chỉ và chia sẻ thành tựu của bạn</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleGetCertificate}
                            className="flex items-center justify-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Award className="w-4 h-4" />
                            Lấy chứng chỉ
                        </button>
                        <button
                            onClick={handleShareLinkedIn}
                            className="flex items-center justify-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Share2 className="w-4 h-4" />
                            Chia sẻ LinkedIn
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const CourseProgress = () => {
        if (!isEnrolled || courseProgress >= 100 || courseProgress === 0) return null;

        return (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-5 rounded-xl border border-blue-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                        <Brain className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-grow">
                        <div className="font-medium text-blue-800">
                            {courseProgress < 30
                                ? 'Khởi đầu tuyệt vời! Hãy tiếp tục nhé! 💪'
                                : courseProgress < 60
                                    ? 'Bạn đang làm rất tốt! Cố lên! ⭐'
                                    : courseProgress < 90
                                        ? 'Sắp hoàn thành rồi! Cố gắng nào! 🎯'
                                        : 'Chỉ còn một chút nữa thôi! Chiến thắng trong tầm tay! 🏆'}
                        </div>
                        <div className="text-sm text-blue-700 mt-1">Còn {remainingLessons} bài học nữa để hoàn thành</div>
                    </div>
                </div>
            </div>
        );
    };

    const NewCourseStatus = () => {
        if (!isEnrolled || courseProgress > 0) return null;

        return (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-5 rounded-xl border border-blue-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-full">
                        <Play className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-grow">
                        <div className="font-medium text-blue-800">Hãy bắt đầu hành trình học tập của bạn! 🚀</div>
                        <div className="text-sm text-blue-700 mt-1">Chọn bài học đầu tiên để khởi đầu khóa học</div>
                    </div>
                </div>
            </div>
        );
    };

    const handleLessonNavigation = useCallback(
        (lesson: Lesson, chapterId: number) => {
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
        },
        [isEnrolled, courseId, navigate, onLessonClick]
    );

    const renderChapterProgress = (chapter: Chapter) => {
        if (!isEnrolled || !chapter.progress) return null;

        const { status, progressPercent } = chapter.progress;

        const statusLabels = {
            completed: 'Đã hoàn thành',
            in_progress: 'Đang học',
            not_started: 'Chưa bắt đầu',
        };

        const statusLabel = status ? statusLabels[status as keyof typeof statusLabels] : 'Chưa bắt đầu';

        return (
            <div className="flex items-center space-x-2">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getProgressColor(status || 'not_started')}`}>
                    {statusLabel}
                </div>
                {progressPercent != null && (
                    <span className="text-sm text-gray-500 font-semibold">{Math.round(progressPercent)}%</span>
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
            Truy cập: {new Date(lesson.progress.lastAccessedAt).toLocaleDateString()}
          </span>
                )}
            </>
        );
    };

    const getLessonTypeLabel = (type: string) => {
        switch (type) {
            case 'video':
                return 'Video';
            case 'text':
                return 'Bài đọc';
            case 'code':
                return 'Bài tập code';
            case 'quiz':
                return 'Câu hỏi';
            default:
                return 'Bài học';
        }
    };

    return (
        <div className="space-y-6">
            {/* Add Helmet at the top level */}
            {/*<Helmet>*/}
            {/*    <title>Khóa học tuyệt vời</title>*/}
            {/*    <meta name="title" property="og:title" content="Khóa học tuyệt vời"/>*/}
            {/*    <meta property="og:description" content="Học và nâng cao kỹ năng của bạn với khóa học này!"/>*/}
            {/*    <meta name="image" property="og:image"*/}
            {/*          content="https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D"/>*/}
            {/*    <meta property="og:url" content="https://prse-fe.vercel.app/course/0"/>*/}
            {/*    <meta property="og:type" content="website"/>*/}
            {/*</Helmet>*/}

            {isEnrolled && (
                <div className="space-y-4">
                    <CourseCompletion/>
                </div>
            )}

            <CourseSummary/>

            {isEnrolled && (
                <div className="space-y-4">
                    <CourseProgress/>
                    <NewCourseStatus/>
                </div>
            )}

            <div className="space-y-4">
                {chapters.map((chapter) => (
                    <div key={chapter.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <button
                            className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
                            onClick={() =>
                                setExpandedChapters((prev) => ({
                                    ...prev,
                                    [chapter.id]: !prev[chapter.id],
                                }))
                            }
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-left">
                                <span className="font-semibold text-gray-900 text-lg">{chapter.title}</span>
                                <div className="flex items-center gap-3">
                  <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {chapter.lessons.length} bài học
                  </span>
                                    {renderChapterProgress(chapter)}
                                </div>
                            </div>
                            {chapter.lessons.length > 0 && (
                                <div className="flex-shrink-0 ml-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                                    {expandedChapters[chapter.id] ? (
                                        <ChevronUp className="w-5 h-5 text-gray-700" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-700" />
                                    )}
                                </div>
                            )}
                        </button>

                        {expandedChapters[chapter.id] && chapter.lessons.length > 0 && (
                            <div className="border-t border-gray-200 divide-y divide-gray-100">
                                {chapter.lessons.map((lesson) => {
                                    const isCompleted = lesson.progress?.status === 'completed';
                                    const isInProgress = lesson.progress?.status === 'not_started';

                                    return (
                                        <div
                                            key={lesson.id}
                                            className={`
                        p-4 
                        ${isEnrolled ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}
                        ${isCompleted ? 'bg-green-50 hover:bg-green-100' : ''}
                        ${isInProgress ? 'bg-blue-50 hover:bg-blue-100' : ''}
                      `}
                                            onClick={() => handleLessonNavigation(lesson, chapter.id)}
                                        >
                                            <div className="flex items-start sm:items-center gap-3">
                                                <div className={`p-2 rounded-lg ${getProgressColor(lesson.progress?.status || 'not_started')}`}>
                                                    {getLessonIcon(lesson.type, lesson.progress?.status || 'not_started')}
                                                </div>

                                                <div className="flex-grow">
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                                        <span className="font-medium text-gray-800">{lesson.title}</span>
                                                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                              {getLessonTypeLabel(lesson.type)}
                            </span>
                                                    </div>

                                                    <div className="mt-1 text-xs text-gray-500">{renderLessonStatus(lesson)}</div>
                                                </div>

                                                {lesson.duration && (
                                                    <span className="text-sm text-gray-600 font-medium bg-gray-50 px-3 py-1 rounded-lg border border-gray-200">
                            {formatDuration(lesson.duration ? lesson.duration : 0)}
                          </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};