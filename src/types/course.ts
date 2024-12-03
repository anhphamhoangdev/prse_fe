import {Course} from "../models/Course";
import React from "react";

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

export interface LessonProgress {
    status: 'not_started' | 'completed' | null;
    completedAt?: string | null;
    lastAccessedAt?: string | null;
}

export interface ChapterProgress {
    status: 'not_started' | 'in_progress' | 'completed' | null;
    completedAt?: string | null;
    progressPercent: number | null;
}


export interface Lesson {
    id: number;
    title: string;
    type: 'video' | 'text' | 'code' | 'quiz';
    duration?: number | null;
    progress?: LessonProgress | null;
}

export interface Chapter {
    id: number;
    title: string;
    lessons: Lesson[];
    progress?: ChapterProgress;
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
    name: string;
}



export interface CourseBasicDTO {
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
    totalDuration: number;
    lastUpdated: string;
    previewVideoUrl?: string;
    previewVideoDuration?: number;
    enrolled: boolean;

    instructor: Instructor;
    subcategories: SubCategory[];
    learningPoints: LearningPoint[];
    prerequisites: Prerequisite[];
}

export interface CourseCurriculumDTO {
    chapters: Chapter[];
}

export interface CourseFeedbacksDTO {
    items: FeedbackData[];
    total: number;
    currentPage: number;
    hasMore: boolean;
}

export interface FeedbackResponse {
    error_message: Record<string, any>;
    code: number;
    data: {
        totalItems: number;
        totalPages: number;
        feedbacks: {
            id: number;
            studentId: number;
            studentName: string;
            studentAvatarUrl: string;
            rating: number;
            comment: string;
            createdAt: string;
        }[];
        hasNext: boolean;
        currentPage: number;
    };
}


// lesson detail
export interface VideoLessonData {
    id: number;
    lessonId: number;
    videoUrl: string;
    duration: number;
    createdAt?: string;
    updatedAt?: string;
}


// instructor course
export interface InstructorCourse {
    id: number;
    title: string;
    description: string;
    shortDescription: string;
    imageUrl: string;
    language: string;
    originalPrice: number;
    isDiscount: boolean;
    isHot: boolean;
    isPublish: boolean;
    totalStudents: number;
    totalViews: number;
    averageRating: number;
    previewVideoUrl: string;
    previewVideoDuration: string;
    createdAt: string;
    updatedAt: string;
}


export interface CourseInstructorEdit {
    id: number;
    title: string;
    description: string;
    shortDescription: string;
    imageUrl: string;
    language: string;
    originalPrice: number;
    isDiscount: boolean;
    isHot: boolean;
    isPublish: boolean;
    previewVideoUrl: string;
    previewVideoDuration: number;
}

export interface CourseInfoEditProps {
    course: CourseInstructorEdit;
    chapters: ChapterInstructorEdit[];
    errorMessage: string;
    onInfoChange: (field: keyof CourseInstructorEdit, value: any) => void;
    onChaptersChange: (chapters: ChapterInstructorEdit[]) => void;
    onInfoSubmit: (e: React.FormEvent) => void;
    onCurriculumSubmit: (e: React.FormEvent) => void;
    infoLoading: boolean;
    curriculumLoading: boolean;
}


export interface LessonInstructorEdit {
    id: number;
    title: string;
    type: 'video' | 'text' | 'code' | 'quiz';
    publish: boolean;
    orderIndex: number;
}

export interface ChapterInstructorEdit {
    id: number;
    title: string;
    lessons: LessonInstructorEdit[];
    orderIndex: number;
}


