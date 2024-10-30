import {Category} from "../models/Category";
import {ENDPOINTS} from "../constants/endpoint";
import {request} from "../utils/request";
import {SubCategory} from "../models/SubCategory";

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