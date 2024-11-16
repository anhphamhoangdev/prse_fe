import {ChevronDown, ChevronUp, Play, FileText, Code, BookOpen, CheckCircle} from 'lucide-react';
import React from "react";
import {Chapter, Lesson} from "../../../types/course";


interface CourseContentProps {
    chapters: Chapter[];
    expandedChapters: Record<number, boolean>;
    setExpandedChapters: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
    isEnrolled: boolean;
    onLessonClick?: (chapterId: number, lessonId: number) => void;
}

export const CourseContent: React.FC<CourseContentProps> = ({
                                                                chapters,
                                                                expandedChapters,
                                                                setExpandedChapters,
                                                                isEnrolled = false,
                                                                onLessonClick,
                                                            }) => {
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

    const handleLessonClick = (chapterId: number, lesson: Lesson) => {
        if (!isEnrolled || !onLessonClick) return;
        onLessonClick(chapterId, lesson.id);
    };

    const renderChapterProgress = (chapter: Chapter) => {
        if (!isEnrolled || !chapter.progress) return null;

        return (
            <div className="flex items-center space-x-2">
                <div className={`px-2 py-1 rounded-full text-xs ${getProgressColor(chapter.progress.status)}`}>
                    {chapter.progress.status === 'completed'
                        ? 'Completed'
                        : chapter.progress.status === 'in_progress'
                            ? 'In Progress'
                            : 'Not Started'}
                </div>
                <span className="text-sm text-gray-500">
         {chapter.progress.progressPercent}%
       </span>
            </div>
        );
    };

    const renderLessonStatus = (lesson: Lesson) => {
        if (!isEnrolled || !lesson.progress) return null;

        return (
            <>
         {/*       {lesson.progress.status === 'in_progress' && (*/}
         {/*           <span className="ml-2 text-xs text-blue-600">*/}
         {/*  Continue Learning*/}
         {/*</span>*/}
         {/*       )}*/}
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
                            <span className="text-sm text-blue-600">
               ({chapter.lessons.length} lessons)
             </span>
                            {renderChapterProgress(chapter)}
                        </div>
                        {expandedChapters[chapter.id] ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
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
                                    onClick={() => handleLessonClick(chapter.id, lesson)}
                                >
                 <span className={`p-2 rounded-lg ${getProgressColor(lesson.progress?.status)}`}>
                   {getLessonIcon(lesson.type, lesson.progress?.status)}
                 </span>
                                    <span className="flex-grow flex items-center gap-3">
                                        <span className="text-gray-700">{lesson.title}</span>
                                        {renderLessonStatus(lesson)}
                                    </span>
                                    {lesson.duration && (
                                        <span className="text-sm text-gray-500">
                     {lesson.duration}
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