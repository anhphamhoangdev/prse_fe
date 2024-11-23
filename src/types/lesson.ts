export interface VideoLesson {
    id: number;
    lesson_id: number;
    video_url: string;
    duration: number;
}

export const getLessonPath = (courseId: string | number, chapterId: number, lessonId: number, type: string): string => {
    const baseCoursePath = `/course-detail/${courseId}`;

    // Điều hướng dựa trên loại bài học
    switch (type) {
        case 'video':
            return `${baseCoursePath}/${chapterId}/${lessonId}/video`;
        case 'text':
            return `${baseCoursePath}/${chapterId}/${lessonId}/reading`;
        case 'code':
            return `${baseCoursePath}/${chapterId}/${lessonId}/practice`;
        case 'quiz':
            return `${baseCoursePath}/${chapterId}/${lessonId}/quiz`;
        default:
            return `${baseCoursePath}/${chapterId}/${lessonId}`;
    }
};