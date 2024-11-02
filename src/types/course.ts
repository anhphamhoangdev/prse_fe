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