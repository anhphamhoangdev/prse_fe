import {Course} from "../models/Course";
import {request} from "../utils/request";
import {ENDPOINTS} from "../constants/endpoint";

interface HomeCourseResponse {
    error_message: any;
    code: number;
    data: {
        courses: Course[];
    };
}

export async function getHomeFreeCourses(): Promise<Course[]> {
    console.log('[CourseService] Fetching home free courses');
    try {
        const response = await request<HomeCourseResponse>(
            ENDPOINTS.HOME.FREE_COURSES
        );

        if (response.code === 1) {
            const freeCourses = response.data.courses.map((course: Course) => new Course(
                course.id,
                course.instructorId,
                course.title,
                course.shortDescription,
                course.description,
                course.imageUrl,
                course.language,
                course.originalPrice,
                course.averageRating,
                course.totalStudents,
                course.totalViews,
                course.isPublish,
                course.isHot,
                course.isDiscount,
                course.createdAt,
                course.updatedAt,
                course.originalPrice
            ));
            console.log(`[CourseService] Successfully fetched ${freeCourses.length} free courses`);
            return freeCourses;
        }
        console.warn('[CourseService] Received unexpected response code:', response.code);
        return [];
    } catch (error) {
        console.error('[CourseService] Error fetching free courses:', error);
        return [];
    }
}

export async function getHomeDiscountCourse(): Promise<Course[]> {
    console.log('[CourseService] Fetching home discount courses');
    try {
        const response = await request<HomeCourseResponse>(
            ENDPOINTS.HOME.DISCOUNT_COURSES
        );

        if (response.code === 1) {
            const discountCourses = response.data.courses.map((course: Course) => new Course(
                course.id,
                course.instructorId,
                course.title,
                course.shortDescription,
                course.description,
                course.imageUrl,
                course.language,
                course.originalPrice,
                course.averageRating,
                course.totalStudents,
                course.totalViews,
                course.isPublish,
                course.isHot,
                course.isDiscount,
                course.createdAt,
                course.updatedAt,
                course.discountPrice
            ));
            console.log(`[CourseService] Successfully fetched ${discountCourses.length} discount courses`);
            return discountCourses;
        }
        console.warn('[CourseService] Received unexpected response code:', response.code);
        return [];
    } catch (error) {
        console.error('[CourseService] Error fetching discount courses:', error);
        return [];
    }
}







