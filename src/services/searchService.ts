import {CourseError, CourseResponse, CourseResult} from "../types/course";
import {request} from "../utils/request";
import {Course} from "../models/Course";
import {ENDPOINTS} from "../constants/endpoint";



interface SearchFilters {
    price?: string;
    rating?: number;
    sortBy?: string;
}

export async function searchCourses(
    keyword: string,
    page: number = 0,
    filters?: SearchFilters
): Promise<CourseResult> {
    console.log(`[CourseService] Searching courses with keyword "${keyword}", page ${page}, filters:`, filters);

    try {
        // Xây dựng query params với tất cả filters
        const queryParams = new URLSearchParams({
            q: keyword,
            page: (page - 1).toString()  // Trừ 1 vì backend bắt đầu từ 0
        });

        // Thêm các filters vào query params nếu có
        if (filters) {
            if (filters.price && filters.price !== 'all') {
                queryParams.append('price', filters.price);
            }
            if (filters.rating) {
                queryParams.append('rating', filters.rating.toString());
            }
            if (filters.sortBy && filters.sortBy !== 'newest') {
                queryParams.append('sort', filters.sortBy);
            }
        }

        // Tạo URL với query params
        const url = ENDPOINTS.SEARCH.SEARCH_BY_FILTER + `?${queryParams.toString()}`;
        console.log('[CourseService] Request URL:', url);

        const response = await request<CourseResponse>(url);

        if (response.code === 0) {
            console.error('[CourseService] API returned error code 0:', response.error_message);
            throw new CourseError('Không tìm thấy kết quả phù hợp');
        }

        if (response.code === 1 && response.data.total_courses) {
            const coursesData = response.data.total_courses;

            const courses = coursesData.courses.map((course) => new Course(
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
                course.discountPrice,
            ));

            console.log(`[CourseService] Successfully found ${courses.length} courses matching search criteria`);

            return {
                courses,
                totalPages: coursesData.totalPages,
                totalSize: coursesData.totalSize
            };
        }

        console.warn('[CourseService] Received unexpected response:', response);
        throw new CourseError('Đã xảy ra lỗi trong quá trình tìm kiếm');
    } catch (error) {
        console.error('[CourseService] Error searching courses:', error);
        if (error instanceof CourseError) {
            throw error;
        }
        throw new CourseError('Không thể kết nối đến server');
    }
}

export async function searchCoursesBySubCategory(
    subCategoryId: string | number,
    searchQuery: string,
    page: number = 0,
    filters?: {
        price?: string;
        rating?: number;
        level?: string;
        sortBy?: string;
    }
): Promise<CourseResult> {
    console.log('Searching with filters:', { subCategoryId, searchQuery, page, filters });

    try {
        // Xây dựng query params
        const queryParams = new URLSearchParams();
        if (searchQuery) {
            queryParams.set('q', searchQuery);
        }
        queryParams.set('page', page.toString());

        if (filters) {
            if (filters.price && filters.price !== 'all') {
                queryParams.append('price', filters.price);
            }
            if (filters.rating) {
                queryParams.append('rating', filters.rating.toString());
            }
            if (filters.level && filters.level !== 'all') {
                queryParams.append('level', filters.level);
            }
            if (filters.sortBy && filters.sortBy !== 'newest') {
                queryParams.append('sort', filters.sortBy);
            }
        }

        const response = await request<CourseResponse>(
            ENDPOINTS.CATEGORY.BY_SUBCATEGORY+`/${subCategoryId}/filters?${queryParams}`
        );

        if (response.code === 0) {
            console.error('[SearchService] API returned error code 0:', response.error_message);
            throw new CourseError('Không tìm thấy kết quả phù hợp');
        }

        if (response.code === 1 && response.data.total_courses) {
            const coursesData = response.data.total_courses;
            const courses = coursesData.courses.map((course) => new Course(
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
                course.discountPrice,
            ));

            console.log(`[SearchService] Successfully found ${courses.length} matching courses`);
            return {
                courses,
                totalPages: coursesData.totalPages,
                totalSize: coursesData.totalSize
            };
        }

        console.warn('[SearchService] Received unexpected response:', response);
        throw new CourseError('Đã xảy ra lỗi trong quá trình tìm kiếm');
    } catch (error) {
        console.error('[SearchService] Error searching courses:', error);
        if (error instanceof CourseError) {
            throw error;
        }
        throw new CourseError('Không thể kết nối đến server');
    }
}

