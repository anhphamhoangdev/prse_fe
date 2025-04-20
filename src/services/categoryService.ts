import {Category} from "../models/Category";
import {ENDPOINTS} from "../constants/endpoint";
import {request, requestGetWithOptionalAuth} from "../utils/request";
import {SubCategory} from "../models/SubCategory";
import {Course} from "../models/Course";
import {CourseError, CourseResponse, CourseResult} from "../types/course";

interface CategoryResponse {
    error_message: any;
    code: number;
    data: {
        categories: Category[];
    };
}



export async function getCategories(): Promise<Category[]> {
    console.log('[CategoryService] Fetching categories...');

    try {
        const response = await request<CategoryResponse>(ENDPOINTS.HOME.CATEGORIES);

        if (response.code === 1) {
            const categories = response.data.categories.map((category) => {
                const subCategories = category.subCategories.map((sub) => new SubCategory(
                    sub.id,
                    sub.name,
                    sub.orderIndex,
                    sub.categoryId,
                    sub.createdAt,
                    sub.updatedAt,
                    sub.active
                ));

                return new Category(
                    category.id,
                    category.name,
                    category.orderIndex,
                    subCategories,
                    category.createdAt,
                    category.updatedAt,
                    category.active
                );
            });

            console.log(`[CategoryService] Successfully fetched ${categories.length} categories`);
            return categories;
        }

        console.warn('[CategoryService] Received unexpected response code:', response.code);
        return [];
    } catch (error) {
        console.error('[CategoryService] Error fetching categories:', error);
        return [];
    }
}

export async function getCoursesBySubCategory(subCategoryId: string | number, page: number = 0): Promise<CourseResult> {
    console.log(`[CourseService] Fetching courses for subcategory ${subCategoryId}, page ${page}...`);

    try {
        const response = await requestGetWithOptionalAuth<CourseResponse>(ENDPOINTS.CATEGORY.BY_SUBCATEGORY+'/'+subCategoryId);

        if (response.code === 0) {
            console.error('[CourseService] API returned error code 0:', response.error_message);
            throw new CourseError('Trang bạn yêu cầu không tồn tại hoặc đang bị lỗi');
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

            console.log(`[CourseService] Successfully fetched ${courses.length} courses`);

            return {
                courses,
                totalPages: coursesData.totalPages,
                totalSize: coursesData.totalSize
            };
        }

        console.warn('[CourseService] Received unexpected response:', response);
        throw new CourseError('Đã xảy ra lỗi không mong muốn');
    } catch (error) {
        console.error('[CourseService] Error fetching courses:', error);
        if (error instanceof CourseError) {
            throw error;
        }
        throw new CourseError('Không thể kết nối đến server');
    }
}



