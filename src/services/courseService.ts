import {Course} from "../models/Course";
import {request, requestGetWithOptionalAuth, requestWithParams} from "../utils/request";
import {ENDPOINTS} from "../constants/endpoint";
import {CourseBasicDTO, CourseFeedbacksDTO, FeedbackData} from "../types/course";

interface HomeCourseResponse {
    error_message: any;
    code: number;
    data: {
        courses: Course[];
    };
}

interface BasicCourseResponse {
    error_message: Record<string, unknown>;
    code: number;
    data: {
        course: CourseBasicDTO | null;
    };
}

interface FeedbackResponse {
    error_message: Record<string, any>;
    code: number;
    data: {
        totalItems: number;
        totalPages: number;
        feedbacks: FeedbackData[];
        hasNext: boolean;
        currentPage: number;
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


export async function getBasicDetailCourse(courseId: number): Promise<CourseBasicDTO | null> {
    console.log(`[CourseService] Fetching basic detail for course ID: ${courseId}`);

    try {
        const response = await requestGetWithOptionalAuth<BasicCourseResponse>(
            ENDPOINTS.COURSE.BASIC_DETAIL + `/${courseId}`
        );

        if (response.code === 1 && response.data.course) {
            console.log(response)
            const courseDetail = response.data.course;
            console.log(`[CourseService] Successfully fetched details for course: ${courseDetail.enrolled}`);
            return courseDetail;
        }

        if (response.code === 1 && !response.data.course) {
            console.warn('[CourseService] Course not found');
            return null;
        }

        console.warn('[CourseService] Received unexpected response code:', response.code);
        return null;
    } catch (error) {
        console.error('[CourseService] Error fetching course details:', error);
        if (error instanceof Error) {
            console.error('[CourseService] Error message:', error.message);
        }
        return null;
    }
}


// types/api.ts
interface FeedbackResponse {
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


export async function getCourseFeedbacks(
    courseId: number,
    page: number = 1
): Promise<CourseFeedbacksDTO | null> {
    console.log(`[FeedbackService] Starting to fetch feedbacks for course ID: ${courseId}, page: ${page}`);

    try {
        const response = await requestWithParams<FeedbackResponse>(
            `${ENDPOINTS.COURSE.BASIC_DETAIL}/${courseId}/feedbacks`,
            {
                    page: page-1,
                    size: 3
            }
        );


        console.log('[FeedbackService] Raw response:', response);

        if (response.code === 1 && response.data.feedbacks) {
            console.log(`[FeedbackService] Successfully fetched feedbacks. Found ${response.data.feedbacks.length} items`);

            const result: CourseFeedbacksDTO = {
                items: response.data.feedbacks,
                total: response.data.totalItems,
                currentPage: response.data.currentPage + 1,
                hasMore: response.data.hasNext
            };

            console.log('[FeedbackService] Processed feedback data:', result);
            return result;
        }

        if (response.code === 1 && !response.data.feedbacks) {
            console.warn('[FeedbackService] No feedbacks found for course:', courseId);
            return null;
        }

        console.warn('[FeedbackService] Unexpected response code:', response.code);
        return null;

    } catch (err) {
        console.error('[FeedbackService] Error fetching course feedbacks:', err);
        if (err instanceof Error) {
            console.error('[FeedbackService] Error details:', err.message);
        }
        return null;
    }
}





