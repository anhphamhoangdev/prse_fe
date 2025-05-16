import React, {useEffect, useRef, useState, useCallback} from 'react';
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
    Settings,
    RefreshCw,
    Check,
    X
} from 'lucide-react';
import {ChapterInstructorEdit, CourseInstructorEdit, LessonInstructorEdit} from "../../types/course";
import {Link} from "react-router-dom";
import {DragDropContext, Draggable, Droppable, DropResult} from 'react-beautiful-dnd';
import {requestPostWithAuth} from "../../utils/request";
import {ENDPOINTS} from "../../constants/endpoint";


export interface CurriculumEditProps {
    chapters: ChapterInstructorEdit[],
    onChaptersChange: (chapters: ChapterInstructorEdit[]) => void,
    course?: CourseInstructorEdit
}

const CurriculumEdit: React.FC<CurriculumEditProps> = ({chapters, onChaptersChange, course}) => {
    const [expandedChapters, setExpandedChapters] = useState<Record<number, boolean>>({});
    const [shouldScroll, setShouldScroll] = useState(false);
    const lastChapterRef = useRef<HTMLDivElement | null>(null);

    // Function to set the last chapter ref
    const setLastChapterRef = useCallback((node: HTMLDivElement | null) => {
        lastChapterRef.current = node;
    }, []);

    // New states for drag-and-drop functionality
    const [isDragModeEnabled, setIsDragModeEnabled] = useState(false);
    const [hasOrderChanged, setHasOrderChanged] = useState(false);
    const [originalChapters, setOriginalChapters] = useState<ChapterInstructorEdit[]>([]);
    const [savingOrder, setSavingOrder] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null);

    // Initialize original chapters when component mounts or chapters change
    useEffect(() => {
        setOriginalChapters(JSON.parse(JSON.stringify(chapters)));
    }, []);

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

    const handleDragEnd = (result: DropResult) => {
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
            setHasOrderChanged(true);
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
            setHasOrderChanged(true);
        }
    };

    const handleAddChapter = async (): Promise<void> => {
        try {
            const newChapter: ChapterInstructorEdit = {
                id: Date.now(),
                title: 'Chương mới',
                lessons: [],
                orderIndex: chapters.length
            };

            const response = await requestPostWithAuth<{ chapter: ChapterInstructorEdit }>(
                `${ENDPOINTS.INSTRUCTOR.COURSES}/${course?.id}/curriculum/chapters`,
                newChapter
            );

            onChaptersChange([...chapters, response.chapter]);
            setOriginalChapters([...chapters, response.chapter]);
            setShouldScroll(true);

            setStatusMessage({
                type: 'success',
                message: 'Đã thêm chương mới thành công'
            });

            setTimeout(() => {
                setStatusMessage(null);
            }, 3000);
        } catch (error) {
            setStatusMessage({
                type: 'error',
                message: 'Có lỗi xảy ra khi thêm chương mới'
            });
        }
    };

    const handleUpdateChapter = (chapterId: number, updates: Partial<ChapterInstructorEdit>): void => {
        const updatedChapters = chapters.map(chapter => {
            if (chapter.id === chapterId) {
                return {...chapter, ...updates};
            }
            return chapter;
        });
        onChaptersChange(updatedChapters);

        if (isDragModeEnabled) {
            setHasOrderChanged(true);
        }
    };

    const handleDeleteChapter = (chapterId: number): void => {
        const updatedChapters = chapters.filter(chapter => chapter.id !== chapterId)
            .map((chapter, index) => ({
                ...chapter,
                orderIndex: index
            }));
        onChaptersChange(updatedChapters);

        if (isDragModeEnabled) {
            setHasOrderChanged(true);
        }
    };

    // Save the new order
    const saveNewOrder = async () => {
        if (!hasOrderChanged || !course?.id) return;

        setSavingOrder(true);
        try {
            // Prepare data with updated order indices
            const updatedChaptersData = chapters.map((chapter, index) => ({
                ...chapter,
                orderIndex: index
            }));

            // Call the API to update the course chapters
            await requestPostWithAuth(
                `${ENDPOINTS.INSTRUCTOR.COURSES}/${course.id}/curriculum/chapters/update-order`,
                { chapterOrders: updatedChaptersData }
            );

            setStatusMessage({
                type: 'success',
                message: 'Đã cập nhật thứ tự thành công'
            });

            // Save the new state as the original state
            setOriginalChapters(JSON.parse(JSON.stringify(chapters)));
            setHasOrderChanged(false);

            // Turn off drag mode after successful save
            setTimeout(() => {
                setIsDragModeEnabled(false);
                setStatusMessage(null);
            }, 2000);
        } catch (error) {
            setStatusMessage({
                type: 'error',
                message: 'Không thể cập nhật thứ tự'
            });
            // Rollback state if error
            onChaptersChange(JSON.parse(JSON.stringify(originalChapters)));
        } finally {
            setSavingOrder(false);
        }
    };

    // Cancel order changes
    const cancelOrderChanges = () => {
        if (hasOrderChanged) {
            onChaptersChange(JSON.parse(JSON.stringify(originalChapters)));
            setHasOrderChanged(false);
        }
        setIsDragModeEnabled(false);
        setStatusMessage(null);
    };

    useEffect(() => {
        if (shouldScroll && lastChapterRef.current) {
            lastChapterRef.current.scrollIntoView({ behavior: 'smooth' });
            setShouldScroll(false);
        }
    }, [chapters, shouldScroll]);

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="space-y-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Nội dung khóa học</h2>
                    <div className="flex gap-3">
                        {!isDragModeEnabled ? (
                            <>
                                <button
                                    onClick={() => {
                                        setIsDragModeEnabled(true);
                                        setOriginalChapters(JSON.parse(JSON.stringify(chapters)));
                                        setStatusMessage({
                                            type: 'info',
                                            message: 'Chế độ kéo thả đã được kích hoạt. Kéo các chương hoặc bài học để thay đổi thứ tự.'
                                        });
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                                >
                                    <RefreshCw className="w-4 h-4"/>
                                    Thay đổi thứ tự
                                </button>
                                <button
                                    onClick={handleAddChapter}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Plus className="w-4 h-4"/>
                                    Thêm chương mới
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={cancelOrderChanges}
                                    className="flex items-center gap-2 px-4 py-2 bg-white text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    disabled={savingOrder}
                                >
                                    <X className="w-4 h-4"/>
                                    Hủy
                                </button>
                                <button
                                    onClick={saveNewOrder}
                                    className={`flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ${
                                        !hasOrderChanged || savingOrder ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                    disabled={!hasOrderChanged || savingOrder}
                                >
                                    {savingOrder ? (
                                        <RefreshCw className="w-4 h-4 animate-spin"/>
                                    ) : (
                                        <Check className="w-4 h-4"/>
                                    )}
                                    {savingOrder ? 'Đang lưu...' : 'Lưu thứ tự'}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {statusMessage && (
                    <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
                        statusMessage.type === 'success' ? 'bg-green-50 text-green-600' :
                            statusMessage.type === 'error' ? 'bg-red-50 text-red-600' :
                                'bg-blue-50 text-blue-600'
                    }`}>
                        {statusMessage.type === 'success' && <Check className="w-5 h-5" />}
                        {statusMessage.type === 'error' && <X className="w-5 h-5" />}
                        {statusMessage.type === 'info' && <RefreshCw className="w-5 h-5" />}
                        {statusMessage.message}
                    </div>
                )}

                {isDragModeEnabled && (
                    <div className="mb-4 bg-indigo-50 text-indigo-600 p-4 rounded-lg flex items-center gap-2">
                        <span className="text-lg">💡</span>
                        Chế độ thay đổi thứ tự đang được kích hoạt. Kéo và thả các chương hoặc bài học để thay đổi vị trí, sau đó nhấn "Lưu thứ tự" để lưu lại thay đổi.
                    </div>
                )}

                <Droppable droppableId="chapters" type="chapter" isDropDisabled={!isDragModeEnabled}>
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                            {chapters.map((chapter, index) => (
                                <Draggable
                                    key={`chapter-${chapter.id}`}
                                    draggableId={`chapter-${chapter.id}`}
                                    index={index}
                                    isDragDisabled={!isDragModeEnabled}
                                >
                                    {(provided, snapshot) => (
                                        <div
                                            ref={(node) => {
                                                provided.innerRef(node);
                                                // Only set lastChapterRef if this is the last chapter
                                                if (index === chapters.length - 1) {
                                                    setLastChapterRef(node);
                                                }
                                            }}
                                            {...provided.draggableProps}
                                            className={`mb-4 ${snapshot.isDragging ? 'opacity-70' : ''}`}
                                        >
                                            <div className={`bg-white rounded-lg border ${
                                                snapshot.isDragging
                                                    ? 'border-blue-400 shadow-md bg-blue-50'
                                                    : isDragModeEnabled
                                                        ? 'border-gray-200 shadow-sm hover:border-blue-300 cursor-grab'
                                                        : 'border-gray-200 shadow-sm'
                                            }`}>
                                                <div className="flex items-center p-4">
                                                    <div
                                                        {...(isDragModeEnabled ? provided.dragHandleProps : {})}
                                                        className={`${isDragModeEnabled ? 'cursor-grab' : ''}`}
                                                    >
                                                        <GripVertical className={`w-5 h-5 ${
                                                            isDragModeEnabled ? 'text-blue-500' : 'text-gray-400'
                                                        }`}/>
                                                    </div>

                                                    <div className="flex-grow ml-2">
                                                        <Link
                                                            to={`/instructor/course/${course?.id}/chapter/${chapter.id}`}
                                                            className="font-medium text-gray-900 hover:text-blue-600"
                                                        >
                                                            {chapter.title}
                                                            <span className="ml-2 text-sm text-blue-600">
                                                                ({chapter.lessons.length} bài học)
                                                            </span>
                                                        </Link>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {!isDragModeEnabled && (
                                                            <>
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
                                                            </>
                                                        )}
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
                                                        isDropDisabled={!isDragModeEnabled}
                                                    >
                                                        {(provided) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.droppableProps}
                                                                className="border-t border-gray-200"
                                                            >
                                                                {chapter.lessons.length > 0 ? (
                                                                    chapter.lessons.map((lesson, index) => (
                                                                        <Draggable
                                                                            key={`lesson-${lesson.id}`}
                                                                            draggableId={`lesson-${lesson.id}`}
                                                                            index={index}
                                                                            isDragDisabled={!isDragModeEnabled}
                                                                        >
                                                                            {(provided, snapshot) => (
                                                                                <div
                                                                                    ref={provided.innerRef}
                                                                                    {...provided.draggableProps}
                                                                                    {...(isDragModeEnabled ? provided.dragHandleProps : {})}
                                                                                    className={`flex items-center p-4 ${
                                                                                        snapshot.isDragging
                                                                                            ? 'bg-blue-50 border-blue-200'
                                                                                            : isDragModeEnabled
                                                                                                ? 'hover:bg-blue-50 cursor-grab'
                                                                                                : 'hover:bg-gray-50'
                                                                                    }`}
                                                                                >
                                                                                    <GripVertical
                                                                                        className={`w-5 h-5 mr-2 ${
                                                                                            isDragModeEnabled ? 'text-blue-500' : 'text-gray-400'
                                                                                        }`}/>
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
                                                                    ))
                                                                ) : (
                                                                    <div className="p-4 text-center text-gray-500">
                                                                        Chương này chưa có bài học nào
                                                                    </div>
                                                                )}
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