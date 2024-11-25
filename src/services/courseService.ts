import {Course} from "../models/Course";
import {request, requestGetWithOptionalAuth, requestWithParams} from "../utils/request";
import {ENDPOINTS} from "../constants/endpoint";
import {CourseBasicDTO, CourseCurriculumDTO, CourseFeedbacksDTO, FeedbackData, FeedbackResponse} from "../types/course";

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

interface CourseCurriculumResponse {
    error_message: Record<string, unknown>;
    code: number;
    data: {
        chapters: CourseCurriculumDTO | null;
    };
}

interface PageResponse<T> {
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    size: number;
    content: T[];
    number: number;
    numberOfElements: number;
}

interface MyCoursesResponse {
    code: number;
    error_message: any;
    data: {
        courses: PageResponse<Course>
    }
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



export async function getMyCourses(page: number = 0, size: number = 12): Promise<PageResponse<Course>> {
    console.log('[CourseService] Fetching my courses');
    try {
        const response = await requestGetWithOptionalAuth<MyCoursesResponse>(
            `${ENDPOINTS.COURSE.MY_COURSES}?page=${page}&size=${size}`
        );

        if (response.code === 1) {
            const pageData = response.data.courses;
            pageData.content = pageData.content.map((course: Course) => new Course(
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

            console.log(`[CourseService] Successfully fetched ${pageData.content.length} courses (Page ${page + 1} of ${pageData.totalPages})`);
            return pageData;
        }

        console.warn('[CourseService] Received unexpected response code:', response.code);
        return {
            content: [],
            totalElements: 0,
            totalPages: 0,
            first: true,
            last: true,
            size: size,
            number: page,
            numberOfElements: 0
        };
    } catch (error) {
        console.error('[CourseService] Error fetching my courses:', error);
        return {
            content: [],
            totalElements: 0,
            totalPages: 0,
            first: true,
            last: true,
            size: size,
            number: page,
            numberOfElements: 0
        };
    }
}


export async function getHomeDiscountCourse(page: number = 0, size: number = 8): Promise<PageResponse<Course>> {
    console.log('[CourseService] Fetching home discount courses');
    try {
        const response = await requestGetWithOptionalAuth<MyCoursesResponse>(
            `${ENDPOINTS.HOME.DISCOUNT_COURSES}?page=${page}&size=${size}`
        );

        if (response.code === 1) {
            const pageData = response.data.courses;
            pageData.content = pageData.content.map((course: Course) => new Course(
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

            console.log(`[CourseService] Successfully fetched ${pageData.content.length} discount courses (Page ${page + 1} of ${pageData.totalPages})`);
            return pageData;
        }

        console.warn('[CourseService] Received unexpected response code:', response.code);
        return {
            content: [],
            totalElements: 0,
            totalPages: 0,
            first: true,
            last: true,
            size: size,
            number: page,
            numberOfElements: 0
        };
    } catch (error) {
        console.error('[CourseService] Error fetching discount courses:', error);
        return {
            content: [],
            totalElements: 0,
            totalPages: 0,
            first: true,
            last: true,
            size: size,
            number: page,
            numberOfElements: 0
        };
    }
}

export async function getHomeHotCourse(page: number = 0, size: number = 8): Promise<PageResponse<Course>> {
    console.log('[CourseService] Fetching home discount courses');
    try {
        const response = await requestGetWithOptionalAuth<MyCoursesResponse>(
            `${ENDPOINTS.HOME.HOT_COURSES}?page=${page}&size=${size}`
        );

        if (response.code === 1) {
            const pageData = response.data.courses;
            pageData.content = pageData.content.map((course: Course) => new Course(
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

            console.log(`[CourseService] Successfully fetched ${pageData.content.length} hot courses (Page ${page + 1} of ${pageData.totalPages})`);
            return pageData;
        }

        console.warn('[CourseService] Received unexpected response code:', response.code);
        return {
            content: [],
            totalElements: 0,
            totalPages: 0,
            first: true,
            last: true,
            size: size,
            number: page,
            numberOfElements: 0
        };
    } catch (error) {
        console.error('[CourseService] Error fetching hot courses:', error);
        return {
            content: [],
            totalElements: 0,
            totalPages: 0,
            first: true,
            last: true,
            size: size,
            number: page,
            numberOfElements: 0
        };
    }
}


export async function getBasicDetailCourse(courseId: number): Promise<CourseBasicDTO | null> {
    console.log(`[CourseService] Fetching basic detail for course ID: ${courseId}`);

    try {
        const response = await requestGetWithOptionalAuth<BasicCourseResponse>(
            ENDPOINTS.COURSE.BASIC + `/${courseId}`
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

export async function getCourseCurriculum(courseId: number): Promise<CourseCurriculumDTO | null> {
    console.log(`[CourseService] Fetching curriculum for course ID: ${courseId}`);

    try {
        const response = await requestGetWithOptionalAuth<CourseCurriculumResponse>(
            ENDPOINTS.COURSE.BASIC + `/${courseId}/curriculum`
        );

        // Early return for invalid response code
        if (response.code !== 1) {
            console.warn('[CourseService] Received unexpected response code:', response.code);
            return null;
        }

        const chapters = response.data?.chapters?.chapters;

        // Check if chapters exists and is an array
        if (!chapters || !Array.isArray(chapters)) {
            console.warn('[CourseService] No valid chapters data found');
            return null;
        }

        // Check if array is empty
        if (chapters.length === 0) {
            console.warn('[CourseService] Course has no chapters');
            return { chapters: [] };
        }

        console.log(`[CourseService] Successfully fetched curriculum with ${chapters.length} chapters`);
        return { chapters };

    } catch (error) {
        console.error('[CourseService] Error fetching course curriculum:', error);
        if (error instanceof Error) {
            console.error('[CourseService] Error details:', {
                message: error.message,
                stack: error.stack
            });
        }
        return null;
    }
}




export async function getCourseFeedbacks(
    courseId: number,
    page: number = 1
): Promise<CourseFeedbacksDTO | null> {
    console.log(`[FeedbackService] Starting to fetch feedbacks for course ID: ${courseId}, page: ${page}`);

    try {
        const response = await requestWithParams<FeedbackResponse>(
            `${ENDPOINTS.COURSE.BASIC}/${courseId}/feedbacks`,
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





