import {Course} from "../models/Course";

export interface CourseResponse {
    error_message: any;
    code: number;
    data: {
        total_courses: {
            courses: Course[];
            totalPages: number;
            totalSize: number;
        }
    }
}

export interface CourseResult {
    courses: Course[];
    totalPages: number;
    totalSize: number;
}

export class CourseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CourseError';
    }
}

export interface CourseFilters {
    q?: string;              // search query
    price?: string;          // all/free/paid/under_50/50_200/over_200
    rating?: number;         // 1-5
    level?: string;          // beginner/intermediate/advanced
    sortBy?: string;         // newest/oldest/price_asc/price_desc/rating/popular
    page?: number;
}



// course detail
export interface Lesson {
    id: number;
    title: string;
    type: 'video' | 'text' | 'code' | 'quiz';
    duration?: string;
}

export interface Chapter {
    id: number;
    title: string;
    lessons: Lesson[];
}

export interface Instructor {
    id: number;
    fullName: string;
    avatarUrl: string;
    title: string;
    totalCourses?: number;
    totalStudents?: number;
}

interface LearningPoint {
    id: number;
    content: string;
}

interface Prerequisite {
    id: number;
    content: string;
}

export interface FeedbackData {
    id: number;
    studentId: number;
    studentName: string;
    studentAvatarUrl: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export interface SubCategory {
    id: number;
    subcategoryName: string;
}


export interface CourseDetailData {
    id: number;
    title: string;
    description: string;
    totalStudents: number;
    totalViews: number;
    language: string;
    averageRating: number;
    originalPrice: number;
    discountPrice: number;
    imageUrl: string;
    totalDuration: string;
    lastUpdated: string;
    previewVideoUrl?: string;
    previewVideoDuration?: number;


    isEnrolled: boolean;

    instructor: Instructor;
    subcategories: SubCategory[];
    chapters: Chapter[];
    learningPoints: LearningPoint[];
    prerequisites: Prerequisite[];
    feedbacks: FeedbackData[];
}
