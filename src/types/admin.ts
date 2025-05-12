export interface AdminCourseDetailType {
    id: number;
    title: string;
    shortDescription: string;
    description: string;
    imageUrl: string;
    previewVideoUrl: string;
    previewVideoDuration: number;
    language: string;
    originalPrice: number;
    averageRating: number;
    totalStudents: number;
    totalViews: number;
    isPublish: boolean;
    isHot: boolean;
    isDiscount: boolean;
    createdAt: string;
    updatedAt: string;
    instructorId: number;
    instructorName: string;
    instructorAvatar: string;
    instructorTitle: string;
    totalChapters: number;
    totalLessons: number;
    totalEnrollments: number;
}

export interface ApiResponse {
    courseDetail: AdminCourseDetailType;
}

export interface VideoLesson {
    videoUrl: string;
    duration: number;
}

export interface Answer {
    id: number;
    text: string;
    isCorrect: boolean;
}

export interface Question {
    id: number;
    text: string;
    answers: Answer[];
}

export interface Lesson {
    id: number;
    title: string;
    type: "video" | "quiz";
    orderIndex: number;
    isPublish: boolean;
    videoLesson: VideoLesson | null;
    questions: Question[] | null;
}

export interface Chapter {
    id: number;
    title: string;
    orderIndex: number;
    isPublish: boolean;
    lessons: Lesson[];
}

export interface ChaptersApiResponse {
    chapters: Chapter[];
}

export interface PublishUpdateStatus {
    id: number;
    type: 'chapter' | 'lesson';
    loading: boolean;
}