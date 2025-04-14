// src/routes/LessonDetailLayout.tsx
import React, { useState, useCallback } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { CurriculumProvider } from '../context/CurriculumContext';
import { SearchHeaderAndFooterLayout } from './UserLayout';
import { ChevronLeft, ChevronRight, Play, X, Menu } from 'lucide-react';
import { Lesson } from '../types/course';
import CurriculumSidebar from '../components/course/course-detail/CurriculumSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurriculum } from '../context/CurriculumContext';

interface LessonContentProps {
    isSidebarVisible: boolean;
    toggleSidebar: () => void;
}

const LessonContent: React.FC<LessonContentProps> = ({ isSidebarVisible, toggleSidebar }) => {
    const { courseId, chapterId, lessonId } = useParams();
    const navigate = useNavigate();
    const { curriculum, isLoading: isCurriculumLoading } = useCurriculum(); // Di chuyển useCurriculum vào đây

    const findNavigationInfo = useCallback(() => {
        if (!curriculum || !lessonId) return { currentLesson: null, nextLesson: null, prevLesson: null };
        let currentLesson: Lesson | null = null;
        let nextLesson: Lesson | null = null;
        let prevLesson: Lesson | null = null;

        for (let i = 0; i < curriculum.length; i++) {
            const chapter = curriculum[i];
            const lessonIndex = chapter.lessons.findIndex((l) => l.id === Number(lessonId));

            if (lessonIndex !== -1) {
                // Tìm thấy bài học hiện tại
                currentLesson = chapter.lessons[lessonIndex];

                // Tìm bài học tiếp theo
                if (lessonIndex < chapter.lessons.length - 1) {
                    // Nếu còn bài học trong chapter hiện tại
                    nextLesson = chapter.lessons[lessonIndex + 1];
                } else {
                    // Duyệt các chapter tiếp theo để tìm bài học đầu tiên
                    for (let j = i + 1; j < curriculum.length; j++) {
                        if (curriculum[j].lessons.length > 0) {
                            nextLesson = curriculum[j].lessons[0];
                            break;
                        }
                    }
                }

                // Tìm bài học trước đó
                if (lessonIndex > 0) {
                    // Nếu có bài học trước trong chapter hiện tại
                    prevLesson = chapter.lessons[lessonIndex - 1];
                } else {
                    // Duyệt các chapter trước đó để tìm bài học cuối cùng
                    for (let j = i - 1; j >= 0; j--) {
                        if (curriculum[j].lessons.length > 0) {
                            prevLesson = curriculum[j].lessons[curriculum[j].lessons.length - 1];
                            break;
                        }
                    }
                }

                break;
            }
        }

        return { currentLesson, nextLesson, prevLesson };
    }, [curriculum, lessonId]);

    const handleLessonNavigation = useCallback(
        (lesson: Lesson, nextChapterId: number) => {
            const baseCoursePath = `/course-detail/${courseId}`;
            const paths = { video: 'video', text: 'reading', code: 'practice', quiz: 'quiz' };
            const newUrl = `${baseCoursePath}/${nextChapterId}/${lesson.id}/${paths[lesson.type] || ''}`;
            navigate(newUrl, { replace: true });
        },
        [courseId, navigate]
    );

    const handleNavigation = useCallback(
        (direction: 'next' | 'prev') => {
            const { nextLesson, prevLesson } = findNavigationInfo();
            const targetLesson = direction === 'next' ? nextLesson : prevLesson;
            if (targetLesson) {
                const chapter = curriculum?.find((ch) => ch.lessons.some((l) => l.id === targetLesson.id));
                if (chapter) handleLessonNavigation(targetLesson, chapter.id);
            }
        },
        [findNavigationInfo, handleLessonNavigation]
    );

    const { currentLesson, nextLesson, prevLesson } = findNavigationInfo();
    const currentChapter = curriculum?.find((ch) => ch.id === Number(chapterId));

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto py-6 px-4 lg:px-6 flex flex-col lg:flex-row gap-6">
                {/* Sidebar bên trái với motion */}
                <AnimatePresence>
                    {isSidebarVisible && (
                        <motion.div
                            initial={{ x: -300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -300, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="lg:w-1/3 w-full"
                        >
                            <CurriculumSidebar
                                courseId={courseId}
                                currentLessonId={lessonId}
                                onLessonSelect={handleLessonNavigation}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Nội dung chính */}
                <div
                    className={`relative flex-grow transition-all duration-300 ${
                        isSidebarVisible ? 'lg:w-2/3' : 'w-full max-w-4xl mx-auto'
                    }`}
                >
                    {/* Nút bật/tắt sidebar */}
                    <button
                        onClick={toggleSidebar}
                        className="absolute top-4 left-4 z-20 p-2.5 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 shadow-lg hover:from-gray-200 hover:to-gray-300 transition-all duration-200 flex items-center justify-center"
                    >
                        {isSidebarVisible ? (
                            <X className="w-6 h-6 text-gray-700 transition-transform duration-200 hover:scale-110" />
                        ) : (
                            <Menu className="w-6 h-6 text-gray-700 transition-transform duration-200 hover:scale-110" />
                        )}
                    </button>

                    {/* Thanh điều hướng */}
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                    <Play className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Chương hiện tại</div>
                                    <div className="font-medium text-gray-900">{currentChapter?.title || 'Đang tải...'}</div>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleNavigation('prev')}
                                    disabled={!prevLesson || isCurriculumLoading}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                                        !prevLesson || isCurriculumLoading
                                            ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                            : 'border-blue-100 text-blue-600 hover:bg-blue-50'
                                    }`}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    <span className="hidden sm:inline">Bài trước</span>
                                </button>
                                <button
                                    onClick={() => handleNavigation('next')}
                                    disabled={!nextLesson || isCurriculumLoading}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                                        !nextLesson || isCurriculumLoading
                                            ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                            : 'border-blue-100 text-blue-600 hover:bg-blue-50'
                                    }`}
                                >
                                    <span className="hidden sm:inline">Bài tiếp</span>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Nội dung đặc thù của VideoLessonDetail hoặc QuizLessonDetail */}
                    {isCurriculumLoading ? (
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center justify-center h-64">
                                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        </div>
                    ) : (
                        <Outlet context={{ currentLesson, handleLessonNavigation }} />
                    )}
                </div>
            </div>
        </div>
    );
};

const LessonDetailLayout: React.FC = () => {
    const { courseId } = useParams();
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);

    const toggleSidebar = () => setIsSidebarVisible((prev) => !prev);

    if (!courseId) {
        return <div>Không tìm thấy courseId</div>;
    }

    return (
        <CurriculumProvider courseId={courseId}>
            <SearchHeaderAndFooterLayout>
                <LessonContent isSidebarVisible={isSidebarVisible} toggleSidebar={toggleSidebar} />
            </SearchHeaderAndFooterLayout>
        </CurriculumProvider>
    );
};

export default LessonDetailLayout;