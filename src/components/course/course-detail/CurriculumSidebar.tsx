// src/components/course/CurriculumSidebar.tsx
import React, { useState, useCallback, useEffect, memo } from 'react';
import { ChevronUp, ChevronDown, CheckCircle, Play, Circle } from 'lucide-react';
import { Chapter, Lesson } from '../../../types/course';
import { useCurriculum } from '../../../context/CurriculumContext';
import { formatDuration } from '../../../utils/formatSecondToHour';

const LessonItem: React.FC<{
    lesson: Lesson;
    chapter: Chapter;
    currentLessonId: string | undefined;
    onLessonSelect: (lesson: Lesson, chapterId: number) => void;
}> = memo(({ lesson, chapter, currentLessonId, onLessonSelect }) => {
    const isCurrent = Number(currentLessonId) === lesson.id;
    const isCompleted = lesson.progress?.status === 'completed';

    return (
        <button
            key={lesson.id}
            onClick={() => onLessonSelect(lesson, chapter.id)}
            title={lesson.title} // Tooltip hiển thị full tên
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm hover:bg-gray-100 transition-all duration-200 group ${
                isCurrent ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
            }`}
        >
            <span className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                ) : isCurrent ? (
                    <Play className="w-5 h-5 text-blue-500" />
                ) : (
                    <Circle className="w-5 h-5 text-gray-300" />
                )}
            </span>
            <span className="text-sm flex-grow text-left font-medium truncate">{lesson.title}</span>
            {lesson.duration && (
                <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md transition-colors duration-200 group-hover:bg-gray-200">
                    {formatDuration(lesson.duration)}
                </span>
            )}
        </button>
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.lesson.id === nextProps.lesson.id &&
        prevProps.currentLessonId === nextProps.currentLessonId &&
        prevProps.chapter.id === nextProps.chapter.id
    );
});

// Component con cho từng chapter
const ChapterItem: React.FC<{
    chapter: Chapter;
    currentLessonId: string | undefined;
    expanded: boolean;
    toggleChapter: (chapterId: number) => void;
    onLessonSelect: (lesson: Lesson, chapterId: number) => void;
}> = memo(({ chapter, currentLessonId, expanded, toggleChapter, onLessonSelect }) => {
    const isActive = chapter.lessons.some((l) => l.id === Number(currentLessonId));

    return (
        <div
            className={`border rounded-md transition-all duration-300 ${
                isActive ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'
            }`}
        >
            <button
                onClick={() => toggleChapter(chapter.id)}
                title={chapter.title} // Tooltip hiển thị full tên
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100 transition-all duration-200 group"
            >
                <div className="flex items-center gap-3">
                    <h4 className="text-base font-semibold text-gray-900 truncate">{chapter.title}</h4>
                    <span className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded-md transition-colors duration-200 group-hover:bg-gray-300">
                        {chapter.lessons.length} bài học
                    </span>
                </div>
                <span className="text-gray-400 transition-transform duration-300 group-hover:scale-110">
                    {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </span>
            </button>
            {expanded && (
                <div className="border-t border-gray-200 px-4 py-2 bg-gray-50 transition-all duration-300">
                    <div className="space-y-1">
                        {chapter.lessons.map((lesson) => (
                            <LessonItem
                                key={lesson.id}
                                lesson={lesson}
                                chapter={chapter}
                                currentLessonId={currentLessonId}
                                onLessonSelect={onLessonSelect}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.chapter.id === nextProps.chapter.id &&
        prevProps.expanded === nextProps.expanded &&
        prevProps.currentLessonId === nextProps.currentLessonId
    );
});

interface CurriculumSidebarProps {
    courseId: string | undefined;
    currentLessonId: string | undefined;
    onLessonSelect: (lesson: Lesson, chapterId: number) => void;
}

const CurriculumSidebar: React.FC<CurriculumSidebarProps> = memo(
    ({ courseId, currentLessonId, onLessonSelect }) => {
        const { curriculum, isLoading, totalLessons, completedLessons } = useCurriculum();
        const [expandedChapters, setExpandedChapters] = useState<number[]>([]);

        // useEffect(() => {
        //     if (courseId) {
        //         fetchCurriculum(courseId);
        //     }
        // }, [courseId, fetchCurriculum]);

        useEffect(() => {
            if (!curriculum || !currentLessonId) return;

            const currentChapter = curriculum.find((chapter) =>
                chapter.lessons.some((lesson) => lesson.id === Number(currentLessonId))
            );

            if (currentChapter && !expandedChapters.includes(currentChapter.id)) {
                setExpandedChapters((prev) => [...prev, currentChapter.id]);
            }
        }, [currentLessonId, curriculum]);

        const toggleChapter = useCallback((chapterId: number) => {
            setExpandedChapters((prev) =>
                prev.includes(chapterId) ? prev.filter((id) => id !== chapterId) : [...prev, chapterId]
            );
        }, []);

        const calculateCourseProgress = useCallback((): number => {
            if (!totalLessons) return 0;
            return Math.round((completedLessons / totalLessons) * 100);
        }, [totalLessons, completedLessons]);

        if (isLoading || !curriculum) {
            return (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="text-center py-12">
                        <Circle className="w-12 h-12 text-gray-200 mx-auto mb-4 animate-spin" />
                        <p className="text-gray-500 font-medium">Đang tải nội dung khóa học...</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-white rounded-lg shadow-md p-6 max-h-[80vh] overflow-hidden">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Tiến độ khóa học</h2>
                        <div className="p-4 bg-gray-50 rounded-md space-y-3">
                            <div className="relative w-full bg-gray-200 rounded-md h-3 overflow-hidden">
                                <div
                                    className="absolute top-0 left-0 h-3 bg-blue-600 rounded-md transition-all duration-500 ease-out"
                                    style={{ width: `${calculateCourseProgress()}%` }}
                                />
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-semibold text-gray-800">
                                    {calculateCourseProgress()}% hoàn thành
                                </span>
                                <span className="text-gray-600">
                                    {completedLessons}/{totalLessons} bài học
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-900">Nội dung khóa học</h3>
                        <div className="space-y-2 overflow-y-auto max-h-[calc(80vh-250px)] pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                            {curriculum.map((chapter) => (
                                <ChapterItem
                                    key={chapter.id}
                                    chapter={chapter}
                                    currentLessonId={currentLessonId}
                                    expanded={expandedChapters.includes(chapter.id)}
                                    toggleChapter={toggleChapter}
                                    onLessonSelect={onLessonSelect}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    },
    (prevProps, nextProps) => {
        return prevProps.courseId === nextProps.courseId && prevProps.currentLessonId === nextProps.currentLessonId;
    }
);

export default CurriculumSidebar;