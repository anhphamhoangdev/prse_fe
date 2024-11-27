import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, GripVertical, Video, Edit2, Trash2, AlertCircle } from 'lucide-react';
import {UploadChapter} from "../../types/upload-courses";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

import {requestWithAuth} from "../../utils/request";

const CourseEdit: () => void = () => {
    // const CourseEdit: React.FC = () => {

        // const { courseId } = useParams();
    // const [chapters, setChapters] = useState<UploadChapter[]>([]);
    // const [isAddingChapter, setIsAddingChapter] = useState(false);
    // const [newChapterTitle, setNewChapterTitle] = useState('');
    // const [expandedChapters, setExpandedChapters] = useState<number[]>([]);
    //
    // const handleAddChapter = async () => {
    //     if (!newChapterTitle.trim()) return;
    //
    //     try {
    //         const response = await requestWithAuth(`${ENDPOINTS.INSTRUCTOR.COURSES}/${courseId}/chapters`, {
    //             method: 'POST',
    //             body: JSON.stringify({
    //                 title: newChapterTitle,
    //                 orderIndex: chapters.length
    //             })
    //         });
    //
    //         setChapters([...chapters, response.data]);
    //         setIsAddingChapter(false);
    //         setNewChapterTitle('');
    //     } catch (error) {
    //         console.error('Error adding chapter:', error);
    //     }
    // };
    //
    // const handleAddLesson = async (chapterId: number) => {
    //     const fileInput = document.createElement('input');
    //     fileInput.type = 'file';
    //     fileInput.accept = 'video/*';
    //
    //     fileInput.onchange = async (e) => {
    //         const file = (e.target as HTMLInputElement).files?.[0];
    //         if (!file) return;
    //
    //         try {
    //             // First, upload the video
    //             const formData = new FormData();
    //             formData.append('video', file);
    //
    //             const uploadResponse = await requestWithAuth(
    //                 `${ENDPOINTS.INSTRUCTOR.UPLOAD}/video`,
    //                 {
    //                     method: 'POST',
    //                     body: formData
    //                 }
    //             );
    //
    //             // Then create the lesson
    //             const lessonResponse = await requestWithAuth(
    //                 `${ENDPOINTS.INSTRUCTOR.COURSES}/${courseId}/chapters/${chapterId}/lessons`,
    //                 {
    //                     method: 'POST',
    //                     body: JSON.stringify({
    //                         title: 'Bài học mới',
    //                         type: 'VIDEO',
    //                         orderIndex: chapters.find(c => c.id === chapterId)?.lessons.length || 0,
    //                         videoUrl: uploadResponse.data.url,
    //                         duration: uploadResponse.data.duration
    //                     })
    //                 }
    //             );
    //
    //             // Update state
    //             setChapters(chapters.map(chapter =>
    //                 chapter.id === chapterId
    //                     ? { ...chapter, lessons: [...chapter.lessons, lessonResponse.data] }
    //                     : chapter
    //             ));
    //         } catch (error) {
    //             console.error('Error adding lesson:', error);
    //         }
    //     };
    //
    //     fileInput.click();
    // };
    //
    // const handleDragEnd = async (result: any) => {
    //     // Implement drag and drop reordering logic
    // };
    //
    // return (
    //     <div className="max-w-4xl mx-auto p-6">
    //         <h1 className="text-2xl font-bold mb-6">Quản lý nội dung khóa học</h1>
    //
    //         <DragDropContext onDragEnd={handleDragEnd}>
    //             <Droppable droppableId="chapters">
    //                 {(provided) => (
    //                     <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
    //                         {chapters.map((chapter, index) => (
    //                             <Draggable key={chapter.id} draggableId={`chapter-${chapter.id}`} index={index}>
    //                                 {(provided) => (
    //                                     <div
    //                                         ref={provided.innerRef}
    //                                         {...provided.draggableProps}
    //                                         className="bg-white rounded-lg shadow-sm border border-gray-200"
    //                                     >
    //                                         {/* Chapter Header */}
    //                                         <div className="p-4 flex items-center gap-4">
    //                                             <div {...provided.dragHandleProps}>
    //                                                 <GripVertical className="w-5 h-5 text-gray-400" />
    //                                             </div>
    //                                             <div className="flex-1">
    //                                                 <h3 className="font-medium">{chapter.title}</h3>
    //                                                 <p className="text-sm text-gray-500">
    //                                                     {chapter.lessons.length} bài học
    //                                                 </p>
    //                                             </div>
    //                                             <button
    //                                                 onClick={() => handleAddLesson(chapter.id)}
    //                                                 className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
    //                                             >
    //                                                 <Plus className="w-4 h-4" />
    //                                                 Thêm bài học
    //                                             </button>
    //                                         </div>
    //
    //                                         {/* Lessons */}
    //                                         <div className="border-t border-gray-200">
    //                                             <Droppable droppableId={`chapter-${chapter.id}-lessons`}>
    //                                                 {(provided) => (
    //                                                     <div
    //                                                         {...provided.droppableProps}
    //                                                         ref={provided.innerRef}
    //                                                         className="divide-y divide-gray-200"
    //                                                     >
    //                                                         {chapter.lessons.map((lesson, lessonIndex) => (
    //                                                             <Draggable
    //                                                                 key={lesson.id}
    //                                                                 draggableId={`lesson-${lesson.id}`}
    //                                                                 index={lessonIndex}
    //                                                             >
    //                                                                 {(provided) => (
    //                                                                     <div
    //                                                                         ref={provided.innerRef}
    //                                                                         {...provided.draggableProps}
    //                                                                         {...provided.dragHandleProps}
    //                                                                         className="p-4 flex items-center gap-4 hover:bg-gray-50"
    //                                                                     >
    //                                                                         <Video className="w-4 h-4 text-gray-400" />
    //                                                                         <span className="flex-1">{lesson.title}</span>
    //                                                                         <div className="flex items-center gap-2">
    //                                                                             <button className="p-1.5 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50">
    //                                                                                 <Edit2 className="w-4 h-4" />
    //                                                                             </button>
    //                                                                             <button className="p-1.5 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50">
    //                                                                                 <Trash2 className="w-4 h-4" />
    //                                                                             </button>
    //                                                                         </div>
    //                                                                     </div>
    //                                                                 )}
    //                                                             </Draggable>
    //                                                         ))}
    //                                                         {provided.placeholder}
    //                                                     </div>
    //                                                 )}
    //                                             </Droppable>
    //                                         </div>
    //                                     </div>
    //                                 )}
    //                             </Draggable>
    //                         ))}
    //                         {provided.placeholder}
    //                     </div>
    //                 )}
    //             </Droppable>
    //         </DragDropContext>
    //
    //         {/* Add Chapter Button/Form */}
    //         {isAddingChapter ? (
    //             <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
    //                 <input
    //                     type="text"
    //                     value={newChapterTitle}
    //                     onChange={(e) => setNewChapterTitle(e.target.value)}
    //                     placeholder="Nhập tên chương..."
    //                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    //                 />
    //                 <div className="mt-3 flex justify-end gap-2">
    //                     <button
    //                         onClick={() => setIsAddingChapter(false)}
    //                         className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
    //                     >
    //                         Hủy
    //                     </button>
    //                     <button
    //                         onClick={handleAddChapter}
    //                         className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
    //                     >
    //                         Thêm chương
    //                     </button>
    //                 </div>
    //             </div>
    //         ) : (
    //             <button
    //                 onClick={() => setIsAddingChapter(true)}
    //                 className="mt-4 w-full p-4 text-gray-500 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:text-gray-600 transition-colors"
    //             >
    //                 <Plus className="w-5 h-5 mx-auto" />
    //                 <span className="mt-1 block text-sm">Thêm chương mới</span>
    //             </button>
    //         )}
    //     </div>
    // );
};

export default CourseEdit;