import {Course} from "../models/Course";
import {request} from "../utils/request";
import {ENDPOINTS} from "../constants/endpoint";

interface HomeFreeCourseResponse {
    error_message: any;
    code: number;
    data: {
        free_courses: Course[];
    };
}

export async function getHomeFreeCourses(): Promise<Course[]> {
    console.log('[CourseService] Fetching home free courses');
    try {
        const response = await request<HomeFreeCourseResponse>(
            ENDPOINTS.HOME.FREE_COURSES
        );

        if (response.code === 1) {
            const freeCourses = response.data.free_courses.map((course: Course) => new Course(
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
                course.updatedAt
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




