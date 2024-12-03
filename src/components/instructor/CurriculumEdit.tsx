import React, {useState} from 'react';
import {
    ChevronDown,
    ChevronUp,
    Play,
    FileText,
    Code,
    BookOpen,
    Trash,
    Plus,
    GripVertical,
    Settings
} from 'lucide-react';
import {ChapterInstructorEdit, CourseInstructorEdit, LessonInstructorEdit} from "../../types/course";
import {Link} from "react-router-dom";
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd';


export interface CurriculumEditProps {
    chapters: ChapterInstructorEdit[],
    onChaptersChange: (chapters: ChapterInstructorEdit[]) => void,
    course?: CourseInstructorEdit
}

const CurriculumEdit: React.FC<CurriculumEditProps> = ({chapters, onChaptersChange, course}) => {
    const [expandedChapters, setExpandedChapters] = useState<Record<number, boolean>>({});
    const [editingChapter, setEditingChapter] = useState<number | null>(null);

    const getLessonIcon = (type: LessonInstructorEdit['type']): JSX.Element => {
        switch (type) {
            case 'video':
                return <Play className="w-4 h-4"/>;
            case 'text':
                return <FileText className="w-4 h-4"/>;
            case 'code':
                return <Code className="w-4 h-4"/>;
            case 'quiz':
                return <BookOpen className="w-4 h-4"/>;
            default:
                return <FileText className="w-4 h-4"/>;
        }
    };

    const handleDragEnd = (result: any) => {
        if (!result.destination) return;

        const {source, destination} = result;

        if (result.type === 'chapter') {
            const items = Array.from(chapters);
            const [reorderedItem] = items.splice(source.index, 1);
            items.splice(destination.index, 0, reorderedItem);

            const updatedChapters = items.map((chapter, index) => ({
                ...chapter,
                orderIndex: index
            }));

            onChaptersChange(updatedChapters);
        } else {
            const chapterId = Number(result.type.split('-')[1]); // Extract ID from string
            const chapter = chapters.find(c => c.id === chapterId);
            if (!chapter) return;

            const newLessons = Array.from(chapter.lessons);
            const [reorderedItem] = newLessons.splice(source.index, 1);
            newLessons.splice(destination.index, 0, reorderedItem);

            const updatedLessons = newLessons.map((lesson, index) => ({
                ...lesson,
                orderIndex: index
            }));

            const updatedChapters = chapters.map(c => {
                if (c.id === chapterId) {
                    return {...c, lessons: updatedLessons};
                }
                return c;
            });

            onChaptersChange(updatedChapters);
        }
    };

    const handleAddChapter = (): void => {
        const newChapter: ChapterInstructorEdit = {
            id: Date.now(),
            title: 'Chương mới',
            lessons: [],
            orderIndex: chapters.length
        };
        onChaptersChange([...chapters, newChapter]);
    };

    const handleUpdateChapter = (chapterId: number, updates: Partial<ChapterInstructorEdit>): void => {
        const updatedChapters = chapters.map(chapter => {
            if (chapter.id === chapterId) {
                return {...chapter, ...updates};
            }
            return chapter;
        });
        onChaptersChange(updatedChapters);
    };

    const handleDeleteChapter = (chapterId: number): void => {
        const updatedChapters = chapters.filter(chapter => chapter.id !== chapterId)
            .map((chapter, index) => ({
                ...chapter,
                orderIndex: index
            }));
        onChaptersChange(updatedChapters);
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="space-y-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Nội dung khóa học</h2>
                    <button
                        onClick={handleAddChapter}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4"/>
                        Thêm chương mới
                    </button>
                </div>

                <Droppable droppableId="chapters" type="chapter">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                            {chapters.map((chapter, index) => (
                                <Draggable
                                    key={`chapter-${chapter.id}`}
                                    draggableId={`chapter-${chapter.id}`}  // Thêm prefix để tránh conflict
                                    index={index}
                                >
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className="mb-4"
                                        >
                                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                                                <div className="flex items-center p-4">
                                                    <div {...provided.dragHandleProps}>
                                                        <GripVertical className="w-5 h-5 text-gray-400 cursor-move"/>
                                                    </div>

                                                    {editingChapter === chapter.id ? (
                                                        <input
                                                            type="text"
                                                            value={chapter.title}
                                                            onChange={(e) => handleUpdateChapter(chapter.id, {title: e.target.value})}
                                                            onBlur={() => setEditingChapter(null)}
                                                            className="flex-grow px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ml-2"
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        <div className="flex-grow ml-2">
                                                            <span
                                                                className="font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                                                                onClick={() => setEditingChapter(chapter.id)}
                                                            >
                                                                {chapter.title}
                                                            </span>
                                                            <span className="ml-2 text-sm text-blue-600">
                                                                ({chapter.lessons.length} bài học)
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            to={`/instructor/course/${course?.id}/chapter/${chapter.id}`}
                                                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Quản lý bài học"
                                                        >
                                                            <Settings className="w-4 h-4"/>
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDeleteChapter(chapter.id)}
                                                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Xóa chương"
                                                        >
                                                            <Trash className="w-4 h-4"/>
                                                        </button>
                                                        <button
                                                            onClick={() => setExpandedChapters(prev => ({
                                                                ...prev,
                                                                [chapter.id]: !prev[chapter.id]
                                                            }))}
                                                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                                        >
                                                            {expandedChapters[chapter.id] ? (
                                                                <ChevronUp className="w-5 h-5"/>
                                                            ) : (
                                                                <ChevronDown className="w-5 h-5"/>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>

                                                {expandedChapters[chapter.id] && (
                                                    <Droppable
                                                        droppableId={`chapter-${chapter.id}`}
                                                        type={`chapter-${chapter.id}`}
                                                    >
                                                        {(provided) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.droppableProps}
                                                                className="border-t border-gray-200"
                                                            >
                                                                {chapter.lessons.map((lesson, index) => (
                                                                    <Draggable
                                                                        key={`lesson-${lesson.id}`}
                                                                        draggableId={`lesson-${lesson.id}`}
                                                                        index={index}
                                                                    >
                                                                        {(provided) => (
                                                                            <div
                                                                                ref={provided.innerRef}
                                                                                {...provided.draggableProps}
                                                                                {...provided.dragHandleProps}
                                                                                className="flex items-center p-4 hover:bg-gray-50"
                                                                            >
                                                                                <GripVertical
                                                                                    className="w-5 h-5 text-gray-400 cursor-move mr-2"/>
                                                                                <span
                                                                                    className="p-2 rounded-lg bg-gray-100">
                                                                                    {getLessonIcon(lesson.type)}
                                                                                </span>
                                                                                <div className="flex-grow ml-3">
                                                                                    <span
                                                                                        className="text-gray-700">{lesson.title}</span>
                                                                                    <span
                                                                                        className={`ml-2 text-sm ${lesson.publish ? 'text-green-500' : 'text-gray-500'}`}>
                                                                                        ({lesson.publish ? 'Đã xuất bản' : 'Nháp'})
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </Draggable>
                                                                ))}
                                                                {provided.placeholder}
                                                            </div>
                                                        )}
                                                    </Droppable>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </div>
        </DragDropContext>
    );
};
export default CurriculumEdit;