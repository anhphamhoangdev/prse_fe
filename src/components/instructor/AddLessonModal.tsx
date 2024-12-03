import React, {useState} from "react";
import {ChapterInstructorEdit, LessonInstructorEdit} from "../../types/course";
import {requestPost, requestPostWithAuth} from "../../utils/request";
import {ENDPOINTS} from "../../constants/endpoint";

interface AddLessonModalProps {
    isOpen: boolean,
    onClose: () => void,
    onAddLesson: () => void,
    courseId?: string,
    chapter?: ChapterInstructorEdit
}

const AddLessonModal: React.FC<AddLessonModalProps> = ({isOpen, onClose, onAddLesson, courseId, chapter}) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState<LessonInstructorEdit['type']>('video');
    const [isPublish, setIsPublish] = useState(false);

    const handleSubmit = async () => {
        const newLesson: LessonInstructorEdit = {
            id: 0,
            title,
            type,
            publish: isPublish,
            orderIndex: 0,
        };

        try {
            await requestPostWithAuth(
                `${ENDPOINTS.INSTRUCTOR.COURSES}/${courseId}/chapter/${chapter?.id}/lessons`,
                { lesson: newLesson }
            );
            onAddLesson();
            onClose();
        } catch (error) {
            console.error('Error adding lesson:', error);
        }
    };

    return (
        <div className={`fixed inset-0 z-50 ${isOpen ? '' : 'hidden'}`}>
            <div className="flex items-center justify-center min-h-screen">
                <div className="fixed inset-0 bg-gray-900 opacity-50"></div>
                <div className="bg-white rounded-lg shadow-lg z-10 w-1/2">
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-4">Thêm bài học mới</h2>
                        <div className="mb-4">
                            <label htmlFor="title" className="block mb-2">Tiêu đề:</label>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="type" className="block mb-2">Loại bài học:</label>
                            <select
                                id="type"
                                value={type}
                                onChange={(e) => setType(e.target.value as LessonInstructorEdit['type'])}
                                className="w-full px-3 py-2 border rounded-lg"
                            >
                                <option value="video">Video bài giảng</option>
                                <option value="text">Bài đọc</option>
                                <option value="code">Bài thực hành</option>
                                <option value="quiz">Bài tập trắc nghiệm</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    checked={isPublish}
                                    onChange={(e) => setIsPublish(e.target.checked)}
                                    className="form-checkbox"
                                />
                                <span className="ml-2">Xuất bản</span>
                            </label>
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 mr-2 text-gray-600 rounded-lg hover:bg-gray-100"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddLessonModal;