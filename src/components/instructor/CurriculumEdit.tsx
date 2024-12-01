import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Play, FileText, Code, BookOpen, Trash, Plus, GripVertical } from 'lucide-react';
import {formatDuration} from "../../utils/formatSecondToHour";

export interface Lesson {
    id: number;
    title: string;
    type: 'video' | 'text' | 'code' | 'quiz';
    duration?: number;
    description?: string;
    videoUrl?: string;
    content?: string;
}

export interface Chapter {
    id: number;
    title: string;
    description?: string;
    lessons: Lesson[];
}

export interface CurriculumEditProps {
    chapters: Chapter[];
    onChaptersChange: (chapters: Chapter[]) => void;
}

const CurriculumEdit: React.FC<CurriculumEditProps> = ({ chapters, onChaptersChange }) => {
    const [expandedChapters, setExpandedChapters] = useState<Record<number, boolean>>({});
    const [editingChapter, setEditingChapter] = useState<number | null>(null);
    const [editingLesson, setEditingLesson] = useState<number | null>(null);

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

    const handleAddChapter = (): void => {
        const newChapter: Chapter = {
            id: Date.now(),
            title: 'Chương mới',
            lessons: []
        };
        onChaptersChange([...chapters, newChapter]);
    };

    const handleAddLesson = (chapterId: number): void => {
        const newLesson: Lesson = {
            id: Date.now(),
            title: 'Bài học mới',
            type: 'video',
            duration: 0
        };

        const updatedChapters = chapters.map(chapter => {
            if (chapter.id === chapterId) {
                return {
                    ...chapter,
                    lessons: [...chapter.lessons, newLesson]
                };
            }
            return chapter;
        });

        onChaptersChange(updatedChapters);
    };

    const handleDeleteChapter = (chapterId: number): void => {
        const updatedChapters = chapters.filter(chapter => chapter.id !== chapterId);
        onChaptersChange(updatedChapters);
    };

    const handleDeleteLesson = (chapterId: number, lessonId: number): void => {
        const updatedChapters = chapters.map(chapter => {
            if (chapter.id === chapterId) {
                return {
                    ...chapter,
                    lessons: chapter.lessons.filter(lesson => lesson.id !== lessonId)
                };
            }
            return chapter;
        });
        onChaptersChange(updatedChapters);
    };

    const handleUpdateChapter = (chapterId: number, updates: Partial<Chapter>): void => {
        const updatedChapters = chapters.map(chapter => {
            if (chapter.id === chapterId) {
                return { ...chapter, ...updates };
            }
            return chapter;
        });
        onChaptersChange(updatedChapters);
    };

    const handleUpdateLesson = (chapterId: number, lessonId: number, updates: Partial<Lesson>): void => {
        const updatedChapters = chapters.map(chapter => {
            if (chapter.id === chapterId) {
                return {
                    ...chapter,
                    lessons: chapter.lessons.map(lesson => {
                        if (lesson.id === lessonId) {
                            return { ...lesson, ...updates };
                        }
                        return lesson;
                    })
                };
            }
            return chapter;
        });
        onChaptersChange(updatedChapters);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Nội dung khóa học</h2>
                <button
                    onClick={handleAddChapter}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4" />
                    Thêm chương mới
                </button>
            </div>

            {chapters.map((chapter) => (
                <div key={chapter.id} className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center p-4 hover:bg-gray-50">
                        <GripVertical className="w-5 h-5 text-gray-400 cursor-move mr-2" />
                        {editingChapter === chapter.id ? (
                            <input
                                type="text"
                                value={chapter.title}
                                onChange={(e) => handleUpdateChapter(chapter.id, { title: e.target.value })}
                                onBlur={() => setEditingChapter(null)}
                                className="flex-grow px-2 py-1 border rounded"
                                autoFocus
                            />
                        ) : (
                            <div
                                className="flex-grow cursor-pointer"
                                onClick={() => setEditingChapter(chapter.id)}
                            >
                                <span className="font-medium text-gray-900">{chapter.title}</span>
                                <span className="ml-2 text-sm text-blue-600">({chapter.lessons.length} bài học)</span>
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleAddLesson(chapter.id)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                title="Thêm bài học"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDeleteChapter(chapter.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                title="Xóa chương"
                            >
                                <Trash className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setExpandedChapters(prev => ({
                                    ...prev,
                                    [chapter.id]: !prev[chapter.id]
                                }))}
                                title={expandedChapters[chapter.id] ? "Thu gọn" : "Mở rộng"}
                            >
                                {expandedChapters[chapter.id] ? (
                                    <ChevronUp className="w-5 h-5 text-gray-500" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-500" />
                                )}
                            </button>
                        </div>
                    </div>

                    {expandedChapters[chapter.id] && (
                        <div className="border-t border-gray-200">
                            {chapter.lessons.map((lesson) => (
                                <div
                                    key={lesson.id}
                                    className="flex items-center p-4 hover:bg-gray-50"
                                >
                                    <GripVertical className="w-5 h-5 text-gray-400 cursor-move mr-2" />
                                    <span className="p-2 rounded-lg bg-gray-100">
                                        {getLessonIcon(lesson.type)}
                                    </span>

                                    {editingLesson === lesson.id ? (
                                        <div className="flex-grow ml-3 space-x-4">
                                            <input
                                                type="text"
                                                value={lesson.title}
                                                onChange={(e) => handleUpdateLesson(chapter.id, lesson.id, { title: e.target.value })}
                                                onBlur={() => setEditingLesson(null)}
                                                className="flex-grow px-2 py-1 border rounded"
                                                autoFocus
                                            />
                                            <select
                                                value={lesson.type}
                                                onChange={(e) => handleUpdateLesson(chapter.id, lesson.id, { type: e.target.value as Lesson['type'] })}
                                                className="px-2 py-1 border rounded"
                                            >
                                                <option value="video">Video</option>
                                                <option value="text">Bài đọc</option>
                                                <option value="code">Thực hành</option>
                                                <option value="quiz">Bài tập</option>
                                            </select>
                                            {lesson.type === 'video' && (
                                                <input
                                                    type="number"
                                                    value={lesson.duration || 0}
                                                    onChange={(e) => handleUpdateLesson(chapter.id, lesson.id, { duration: parseInt(e.target.value) })}
                                                    className="w-24 px-2 py-1 border rounded"
                                                    placeholder="Thời lượng (giây)"
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <div
                                            className="flex-grow ml-3 cursor-pointer"
                                            onClick={() => setEditingLesson(lesson.id)}
                                        >
                                            <span className="text-gray-700">{lesson.title}</span>
                                            {lesson.duration && (
                                                <span className="ml-2 text-sm text-gray-500">
                                                    {formatDuration(lesson.duration)}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <button
                                        onClick={() => handleDeleteLesson(chapter.id, lesson.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                        title="Xóa bài học"
                                    >
                                        <Trash className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default CurriculumEdit;