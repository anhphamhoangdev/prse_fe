// src/components/course/CurriculumSidebar.tsx
import React, { useState, useCallback, useEffect, memo } from 'react';
import { ChevronUp, ChevronDown, CheckCircle, Play, Circle } from 'lucide-react';
import { Chapter, Lesson } from "../../../types/course";
import { useCurriculum } from "../../../context/CurriculumContext";
import { formatDuration } from "../../../utils/formatSecondToHour";

// Component con cho từng lesson
const LessonItem: React.FC<{
    lesson: Lesson;
    chapter: Chapter;
    currentLessonId: string | undefined;
    onLessonSelect: (lesson: Lesson, chapterId: number) => void;
}> = memo(({ lesson, chapter, currentLessonId, onLessonSelect }) => (
    <button
        key={lesson.id}
        onClick={() => onLessonSelect(lesson, chapter.id)}
        className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors duration-200 ${
            Number(currentLessonId) === lesson.id ? 'bg-blue-50' : ''
        }`}
    >
        {lesson.progress?.status === 'completed' ? (
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
        ) : Number(currentLessonId) === lesson.id ? (
            <Play className="w-4 h-4 text-blue-500 flex-shrink-0" />
        ) : (
            <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
        )}
        <span className="text-sm text-left flex-grow text-gray-700">{lesson.title}</span>
        {lesson.duration && (
            <span className="text-xs text-gray-500 whitespace-nowrap">
                {formatDuration(lesson.duration)}
            </span>
        )}
    </button>
), (prevProps, nextProps) => {
    // Chỉ re-render nếu lesson, currentLessonId hoặc chapter thay đổi
    return prevProps.lesson.id === nextProps.lesson.id &&
        prevProps.currentLessonId === nextProps.currentLessonId &&
        prevProps.chapter.id === nextProps.chapter.id;
});

// Component con cho từng chapter
const ChapterItem: React.FC<{
    chapter: Chapter;
    currentLessonId: string | undefined;
    expanded: boolean;
    toggleChapter: (chapterId: number) => void;
    onLessonSelect: (lesson: Lesson, chapterId: number) => void;
    calculateChapterProgress: (chapter: Chapter) => number;
}> = memo(({ chapter, currentLessonId, expanded, toggleChapter, onLessonSelect, calculateChapterProgress }) => (
    <div
        className={`border rounded-lg transition-all duration-200 ${
            chapter.lessons.some((l) => l.id === Number(currentLessonId))
                ? 'border-blue-200 bg-blue-50'
                : 'border-gray-200'
        }`}
    >
        <button
            onClick={() => toggleChapter(chapter.id)}
            className="w-full flex items-center justify-between p-4"
        >
            <div className="flex items-center gap-3">
                <h4 className="font-medium text-left font-bold text-gray-900">{chapter.title}</h4>
                <div className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                    {chapter.lessons.length} bài học
                </div>
            </div>
            <div className="flex items-center gap-3">
                {calculateChapterProgress(chapter) > 0 && (
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        {calculateChapterProgress(chapter)}%
                    </span>
                )}
                {expanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
            </div>
        </button>
        {expanded && (
            <div className="border-t border-gray-200 transition-all duration-300">
                <div className="divide-y divide-gray-200">
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
), (prevProps, nextProps) => {
    // Chỉ re-render nếu chapter, expanded hoặc currentLessonId thay đổi
    return prevProps.chapter.id === nextProps.chapter.id &&
        prevProps.expanded === nextProps.expanded &&
        prevProps.currentLessonId === nextProps.currentLessonId;
});

interface CurriculumSidebarProps {
    courseId: string | undefined;
    currentLessonId: string | undefined;
    onLessonSelect: (lesson: Lesson, chapterId: number) => void;
}

const CurriculumSidebar: React.FC<CurriculumSidebarProps> = memo(({
                                                                      courseId,
                                                                      currentLessonId,
                                                                      onLessonSelect,
                                                                  }) => {
    const { curriculum, isLoading, fetchCurriculum } = useCurriculum();
    const [expandedChapters, setExpandedChapters] = useState<number[]>([]);

    useEffect(() => {
        if (courseId) {
            fetchCurriculum(courseId);
        }
    }, [courseId, fetchCurriculum]);

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

    const calculateChapterProgress = useCallback((chapter: Chapter): number => {
        if (!chapter.lessons.length) return 0;
        const completedLessons = chapter.lessons.filter((l) => l.progress?.status === 'completed').length;
        return Math.round((completedLessons / chapter.lessons.length) * 100);
    }, []);

    if (isLoading || !curriculum) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-center py-12">
                    <Circle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Đang tải nội dung khóa học...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="space-y-6">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Tiến độ chương</h2>
                    {curriculum[0] && (
                        <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${calculateChapterProgress(curriculum[0])}%` }}
                                />
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-medium text-gray-900">
                                    {calculateChapterProgress(curriculum[0])}% hoàn thành
                                </span>
                                <span className="text-gray-500">
                                    {curriculum[0].lessons.filter((l) => l.progress?.status === 'completed').length}/
                                    {curriculum[0].lessons.length} bài học
                                </span>
                            </div>
                        </div>
                    )}
                </div>
                <div className="space-y-1">
                    <h3 className="font-medium text-gray-900">Nội dung khóa học</h3>
                    <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-400px)] pr-2">
                        {curriculum.map((chapter) => (
                            <ChapterItem
                                key={chapter.id}
                                chapter={chapter}
                                currentLessonId={currentLessonId}
                                expanded={expandedChapters.includes(chapter.id)}
                                toggleChapter={toggleChapter}
                                onLessonSelect={onLessonSelect}
                                calculateChapterProgress={calculateChapterProgress}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    // Chỉ re-render nếu courseId hoặc currentLessonId thay đổi
    return prevProps.courseId === nextProps.courseId &&
        prevProps.currentLessonId === nextProps.currentLessonId;
});

export default CurriculumSidebar;