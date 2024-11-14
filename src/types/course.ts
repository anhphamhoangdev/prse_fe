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
    name: string;
    avatar: string;
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

export interface CourseData {
    id: number;
    title: string;
    description: string;
    instructor: Instructor;
    isEnrolled: boolean;
    totalStudents: number;
    language: string;
    rating: number;
    price: number;
    thumbnail: string;
    totalDuration: string;
    lastUpdated: string;
    chapters: Chapter[];
    learningPoints: LearningPoint[];
    prerequisites: Prerequisite[];
    previewVideoUrl?: string;
}
