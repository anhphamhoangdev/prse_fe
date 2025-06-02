import React, { useState, useEffect } from "react";
import {
    BookOpen,
    ChevronLeft,
    Code,
    FileText,
    Play,
    Plus,
    GripVertical,
    RefreshCw,
    Check,
    X
} from "lucide-react";
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { putWithAuth, requestWithAuth } from "../../utils/request";
import { ENDPOINTS } from "../../constants/endpoint";
import { Link } from "react-router-dom";
import AddLessonModal from "./AddLessonModal";
import { ChapterInstructorEdit, LessonInstructorEdit } from "../../types/course";

interface ChapterLessonsProps {
    chapter: ChapterInstructorEdit,
    lessons: LessonInstructorEdit[],
    errorMessage: string,
    onLessonsChange: (lessons: LessonInstructorEdit[]) => void,
    courseId: string,
    onChapterUpdate?: any
}

const ChapterLessons: React.FC<ChapterLessonsProps> = ({
                                                           chapter,
                                                           lessons,
                                                           errorMessage,
                                                           onLessonsChange,
                                                           courseId,
                                                           onChapterUpdate
                                                       }) => {
    const [editingLesson, setEditingLesson] = useState<number | null>(null);
    const [isAddLessonModalOpen, setIsAddLessonModalOpen] = useState(false);
    const [isEditingChapter, setIsEditingChapter] = useState(false);
    const [editedChapter, setEditedChapter] = useState(chapter);

    // Drag and drop states
    const [isDragModeEnabled, setIsDragModeEnabled] = useState(false);
    const [hasOrderChanged, setHasOrderChanged] = useState(false);
    const [originalLessons, setOriginalLessons] = useState<LessonInstructorEdit[]>([]);
    const [savingOrder, setSavingOrder] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null);


    const navigate = useNavigate();
    const location = useLocation();

    // Initialize original lessons when component mounts or lessons change
    useEffect(() => {
        setOriginalLessons(JSON.parse(JSON.stringify(lessons)));
    }, []);

    const handleUpdateChapterInfo = async (updates: Partial<ChapterInstructorEdit>) => {
        try {
            await putWithAuth(
                `${ENDPOINTS.INSTRUCTOR.COURSES}/${courseId}/chapter/${chapter.id}`,
                {chapter: updates}
            );

            await fetchLessons();
            setIsEditingChapter(false);
            onChapterUpdate(courseId, chapter.id);
        } catch (error) {
            console.error('Error updating chapter:', error);
        }
    };

    // Add handler for input changes
    const handleInputChange = (field: keyof ChapterInstructorEdit, value: any) => {
        setEditedChapter(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Add handler for save button
    const handleSaveChanges = () => {
        handleUpdateChapterInfo(editedChapter);
    };

    // When entering edit mode, initialize editedChapter with current chapter data
    const startEditing = () => {
        setEditedChapter(chapter);
        setIsEditingChapter(true);
    };

    // Reset changes when canceling
    const cancelEditing = () => {
        setEditedChapter(chapter);
        setIsEditingChapter(false);
    };

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

    const fetchLessons = async () => {
        try {
            const response = await requestWithAuth<{
                chapter: ChapterInstructorEdit
            }>(`${ENDPOINTS.INSTRUCTOR.COURSES}/${courseId}/chapter/${chapter.id}`);
            console.log(response.chapter.lessons);
            onLessonsChange(response.chapter.lessons);
        } catch (error) {
            console.error('Error fetching lessons:', error);
        }
    };

    const handleUpdateLesson = async (lessonId: number, updates: Partial<LessonInstructorEdit>) => {
        try {
            await putWithAuth(
                `${ENDPOINTS.INSTRUCTOR.COURSES}/${courseId}/chapters/${chapter.id}/lessons/${lessonId}`,
                {lesson: updates}
            );

            const updatedLessons = lessons.map(lesson =>
                lesson.id === lessonId
                    ? {...lesson, ...updates}
                    : lesson
            );

            onLessonsChange(updatedLessons);

            if (editingLesson === lessonId) {
                setEditingLesson(null);
            }
        } catch (error) {
            console.error('Error updating lesson:', error);
        }
    };

    // Handle drag end for lessons
    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const { source, destination } = result;
        const items = Array.from(lessons);
        const [reorderedItem] = items.splice(source.index, 1);
        items.splice(destination.index, 0, reorderedItem);

        // Update the order index of all lessons
        const updatedLessons = items.map((lesson, index) => ({
            ...lesson,
            orderIndex: index
        }));

        onLessonsChange(updatedLessons);
        setHasOrderChanged(true);
    };

    // Save the new lesson order
    const saveNewOrder = async () => {
        if (!hasOrderChanged) return;

        setSavingOrder(true);
        try {
            // Prepare data with updated order indices
            const updatedLessonsData = lessons.map((lesson, index) => ({
                ...lesson,
                orderIndex: index
            }));

            // Call the API to update lesson order
            await putWithAuth(
                `${ENDPOINTS.INSTRUCTOR.COURSES}/${courseId}/chapters/${chapter.id}/lessons/update-order`,
                { lessonOrders: updatedLessonsData }
            );

            setStatusMessage({
                type: 'success',
                message: 'Đã cập nhật thứ tự bài học thành công'
            });

            // Save the new state as the original state
            setOriginalLessons(JSON.parse(JSON.stringify(lessons)));
            setHasOrderChanged(false);

            // Turn off drag mode after successful save
            setTimeout(() => {
                setIsDragModeEnabled(false);
                setStatusMessage(null);
            }, 2000);
        } catch (error) {
            setStatusMessage({
                type: 'error',
                message: 'Không thể cập nhật thứ tự bài học'
            });
            // Rollback state if error
            onLessonsChange(JSON.parse(JSON.stringify(originalLessons)));
        } finally {
            setSavingOrder(false);
        }
    };

    // Cancel order changes
    const cancelOrderChanges = () => {
        if (hasOrderChanged) {
            onLessonsChange(JSON.parse(JSON.stringify(originalLessons)));
            setHasOrderChanged(false);
        }
        setIsDragModeEnabled(false);
        setStatusMessage(null);
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Add Chapter Information Section */}
            <div className="mb-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Thông tin chương</h2>

                    {isEditingChapter ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tiêu đề
                                </label>
                                <input
                                    type="text"
                                    value={editedChapter.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Thứ tự
                                </label>
                                <input
                                    type="number"
                                    value={editedChapter.orderIndex}
                                    onChange={(e) => handleInputChange('orderIndex', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={cancelEditing}
                                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleSaveChanges}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Lưu thay đổi
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="text-sm text-gray-500">Tiêu đề</div>
                                    <div className="font-medium">{chapter.title}</div>
                                </div>
                                {/*<div>*/}
                                {/*    <div className="text-sm text-gray-500">Thứ tự</div>*/}
                                {/*    <div className="font-medium">{chapter.orderIndex}</div>*/}
                                {/*</div>*/}
                                <button
                                    onClick={startEditing}
                                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                >
                                    Chỉnh sửa
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        to={`/instructor/course/${courseId}/edit`}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5"/>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {chapter.title}
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    {!isDragModeEnabled ? (
                        <>
                            <button
                                onClick={() => {
                                    setIsDragModeEnabled(true);
                                    setOriginalLessons(JSON.parse(JSON.stringify(lessons)));
                                    setStatusMessage({
                                        type: 'info',
                                        message: 'Chế độ kéo thả đã được kích hoạt. Kéo các bài học để thay đổi thứ tự.'
                                    });
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                                <RefreshCw className="w-4 h-4"/>
                                Thay đổi thứ tự
                            </button>
                            <button
                                onClick={() => navigate(`${location.pathname}/add`)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <Plus className="w-4 h-4"/>
                                Thêm Bài Học
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

            {errorMessage && (
                <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
                    {errorMessage}
                </div>
            )}

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
                    Chế độ thay đổi thứ tự đang được kích hoạt. Kéo và thả các bài học để thay đổi vị trí, sau đó nhấn "Lưu thứ tự" để lưu lại thay đổi.
                </div>
            )}

            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <Droppable droppableId="lessons" isDropDisabled={!isDragModeEnabled}>
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="divide-y divide-gray-200"
                            >
                                {lessons.map((lesson, index) => (
                                    <Draggable
                                        key={`lesson-${lesson.id}`}
                                        draggableId={`lesson-${lesson.id}`}
                                        index={index}
                                        isDragDisabled={!isDragModeEnabled || editingLesson === lesson.id}
                                    >
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={`p-4 ${
                                                    snapshot.isDragging
                                                        ? 'bg-blue-50'
                                                        : isDragModeEnabled
                                                            ? 'hover:bg-blue-50'
                                                            : 'hover:bg-gray-50'
                                                }`}
                                            >
                                                {editingLesson === lesson.id ? (
                                                    <div className="flex items-center gap-4">
                                                        <span className="p-2 rounded-lg bg-gray-100">
                                                            {getLessonIcon(lesson.type)}
                                                        </span>
                                                        <input
                                                            type="text"
                                                            value={lesson.title}
                                                            onChange={(e) => handleUpdateLesson(lesson.id, {title: e.target.value})}
                                                            className="flex-grow px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                            autoFocus
                                                        />
                                                        <select
                                                            value={lesson.type}
                                                            onChange={(e) => handleUpdateLesson(lesson.id, {
                                                                type: e.target.value as LessonInstructorEdit['type']
                                                            })}
                                                            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                                        >
                                                            <option value="video">Video bài giảng</option>
                                                            <option value="text">Bài đọc</option>
                                                            <option value="code">Bài thực hành</option>
                                                            <option value="quiz">Bài tập trắc nghiệm</option>
                                                        </select>
                                                        <label className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                                                            <input
                                                                type="checkbox"
                                                                checked={lesson.publish}
                                                                onChange={(e) => handleUpdateLesson(lesson.id, {
                                                                    publish: e.target.checked
                                                                })}
                                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                            />
                                                            <span className="text-sm text-gray-700">Xuất bản</span>
                                                        </label>
                                                        <button
                                                            onClick={() => setEditingLesson(null)}
                                                            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                                                        >
                                                            Xong
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            {isDragModeEnabled && (
                                                                <div {...provided.dragHandleProps}>
                                                                    <GripVertical className="w-5 h-5 text-blue-500 cursor-grab" />
                                                                </div>
                                                            )}
                                                            <span className="p-2 rounded-lg bg-gray-100">
                                                                {getLessonIcon(lesson.type)}
                                                            </span>
                                                            <span className="text-gray-900 font-medium">
                                                                {lesson.title}
                                                            </span>
                                                            <span
                                                                className={`text-sm ${lesson.publish ? 'text-green-500' : 'text-gray-500'}`}>
                                                                ({lesson.publish ? 'Đã xuất bản' : 'Nháp'})
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {!isDragModeEnabled && (
                                                                <>
                                                                    <button
                                                                        onClick={() => setEditingLesson(lesson.id)}
                                                                        className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                                    >
                                                                        Chỉnh sửa nhanh
                                                                    </button>
                                                                    <Link
                                                                        to={`/instructor/course/${courseId}/chapter/${chapter.id}/lesson/${lesson.id}`}
                                                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                                                    >
                                                                        Chi tiết
                                                                    </Link>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                                {lessons.length === 0 && (
                                    <div className="p-8 text-center text-gray-500">
                                        Chương này chưa có bài học nào. Bấm "Thêm bài học" để bắt đầu.
                                    </div>
                                )}
                            </div>
                        )}
                    </Droppable>
                </div>
            </DragDropContext>

            <AddLessonModal
                isOpen={isAddLessonModalOpen}
                onClose={() => setIsAddLessonModalOpen(false)}
                onAddLesson={fetchLessons}
                courseId={courseId}
                chapter={chapter}
            />
        </div>
    );
};

export default ChapterLessons;