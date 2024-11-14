import { ChevronDown, ChevronUp, Play, FileText, Code, BookOpen } from 'lucide-react';
import React from "react";
import {Chapter, Lesson} from "../../../types/course";

interface CourseContentProps {
    chapters: Chapter[];
    expandedChapters: Record<number, boolean>;
    setExpandedChapters: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
}

export const CourseContent: React.FC<CourseContentProps> = ({
                                                                chapters,
                                                                expandedChapters,
                                                                setExpandedChapters
                                                            }) => {
    const getLessonIcon = (type: Lesson['type']): JSX.Element => {
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

    return (
        <div className="space-y-4">
            {chapters.map(chapter => (
                <div key={chapter.id} className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <button
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                        onClick={() => setExpandedChapters(prev => ({
                            ...prev,
                            [chapter.id]: !prev[chapter.id]
                        }))}
                    >
                        <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{chapter.title}</span>
                            <span className="text-sm text-blue-600">
                                ({chapter.lessons.length} lessons)
                            </span>
                        </div>
                        {expandedChapters[chapter.id] ?
                            <ChevronUp className="w-5 h-5 text-gray-500" /> :
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                        }
                    </button>

                    {expandedChapters[chapter.id] && (
                        <div className="border-t border-gray-200">
                            {chapter.lessons.map(lesson => (
                                <div
                                    key={lesson.id}
                                    className="flex items-center space-x-3 p-4 hover:bg-gray-50"
                                >
                                    <span className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                        {getLessonIcon(lesson.type)}
                                    </span>
                                    <span className="flex-grow text-gray-700">{lesson.title}</span>
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