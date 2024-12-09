import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import {CourseError, CourseFilters, CourseResult} from '../types/course';
import { getCoursesBySubCategory } from '../services/categoryService';
import {FilterSection} from "../components/common/Filter";
import {CourseHomeSection} from "../components/course/CourseHomeSection";
import {Pagination} from "../components/common/Pagination";
import {searchCoursesBySubCategory} from "../services/searchService";
import {useNotification} from "../components/notification/NotificationProvider";

export function Category() {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Lấy tất cả các filter từ URL
    const filters: CourseFilters = {
        q: searchParams.get('q') || '',
        price: searchParams.get('price') || 'all',
        rating: Number(searchParams.get('rating')) || undefined,
        level: searchParams.get('level') || 'all',
        sortBy: searchParams.get('sort') || 'newest',
        page: Number(searchParams.get('page')) || 1
    };

    const [courseData, setCourseData] = useState<CourseResult>({
        courses: [],
        totalPages: 0,
        totalSize: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { showNotification } = useNotification();


    // Hàm cập nhật filters
    const updateFilters = (newFilters: Partial<CourseFilters>) => {
        const updatedFilters = { ...filters, ...newFilters };

        // Tạo SearchParams mới
        const params = new URLSearchParams();

        // Chỉ thêm các giá trị không phải default vào URL
        if (updatedFilters.q) params.set('q', updatedFilters.q);
        if (updatedFilters.price && updatedFilters.price !== 'all')
            params.set('price', updatedFilters.price);
        if (updatedFilters.rating)
            params.set('rating', updatedFilters.rating.toString());
        if (updatedFilters.level && updatedFilters.level !== 'all')
            params.set('level', updatedFilters.level);
        if (updatedFilters.sortBy && updatedFilters.sortBy !== 'newest')
            params.set('sort', updatedFilters.sortBy);
        if (updatedFilters.page && updatedFilters.page > 1)
            params.set('page', updatedFilters.page.toString());

        // Cập nhật URL với các params mới
        setSearchParams(params);
    };

    // Xử lý thay đổi page
    const handlePageChange = (page: number) => {
        updateFilters({ page });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Xử lý thay đổi các filter khác
    const handleFilterChange = (filterChanges: Partial<CourseFilters>) => {
        // Reset về page 1 khi thay đổi filter
        updateFilters({ ...filterChanges, page: 1 });
    };



    // Xử lý clear tất cả filter
    const handleClearFilters = () => {
        updateFilters({
            q: '',
            price: 'all',
            rating: undefined,
            level: 'all',
            sortBy: 'newest',
            page: 1
        });
    };

    const handleGoHome = () => {
        navigate('/')
        return;
    }

    const hasActiveFilters = (): boolean => {
        return (
            filters.q !== '' ||
            filters.price !== 'all' ||
            filters.rating !== undefined ||
            filters.level !== 'all' ||
            filters.sortBy !== 'newest'
        );
    };

    // xu li notification
    const handleAddToCartSuccess = () => {
        showNotification(
            'success',
            'Thành công',
            'Khóa học đã được thêm vào giỏ hàng thành công'
        );
    };

    const handleAddToCartError = (message: string) => {
        showNotification(
            'error',
            'Không thành công',
            message
        );
    };



    // Fetch courses với filters
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                setError(null);

                const searchQuery = searchParams.get('q');

                // Lấy page từ URL params hoặc mặc định là 0
                const currentPage = Number(searchParams.get('page') || '1');
                const apiPage = currentPage > 0 ? currentPage - 1 : 0;

                let result;
                if (hasActiveFilters()) {
                    // Nếu có search query, gọi API search
                    result = await searchCoursesBySubCategory(
                        categoryId!,
                        filters.q || '',
                        apiPage,
                        {
                            price: filters.price,
                            rating: filters.rating,
                            level: filters.level,
                            sortBy: filters.sortBy
                        }
                    );
                } else {
                    // Nếu không có search query, gọi API get courses bình thường
                    result = await getCoursesBySubCategory(
                        categoryId!,
                        apiPage
                    );
                }

                setCourseData(result);
            } catch (error) {
                console.error('Error:', error);
                if (error instanceof CourseError) {
                    setError(error.message);
                } else {
                    setError('Đã xảy ra lỗi không mong muốn');
                }
            } finally {
                setLoading(false);
            }
        };

        if (categoryId) {
            fetchCourses();
        }
    }, [categoryId, searchParams]);

    return (
        <MainLayout>
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Filter Section - Always show even when loading/error */}
                    <div className="lg:w-1/4 order-1 lg:order-1">
                        <div className="sticky top-4 z-10">
                            <FilterSection
                                filters={filters}
                                onFilterChange={handleFilterChange}
                                onClearFilters={handleClearFilters}
                                totalCourses={courseData.totalSize}
                            />
                        </div>
                    </div>

                    {/* Course List Section with Loading/Error States */}
                    <div className="w-full lg:w-3/4 order-2 lg:order-2">
                        {loading ? (
                            <div className="flex justify-center items-center min-h-[400px]">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                                <div className="text-red-500 text-xl font-medium text-center">
                                    {error}
                                </div>
                                <button
                                    onClick={handleGoHome}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Về lại trang chủ
                                </button>
                            </div>
                        ) : courseData.courses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                                <div className="text-gray-500 text-xl font-medium text-center">
                                    Không tìm thấy khóa học nào phù hợp
                                </div>
                                <button
                                    onClick={handleClearFilters}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Xóa bộ lọc
                                </button>
                            </div>
                        ) : (
                            <>
                                <CourseHomeSection
                                    title={`Danh sách khóa học ${filters.q ? `- Tìm kiếm "${filters.q}"` : ''}`}
                                    courses={courseData.courses}
                                    displayType='category'
                                    onAddToCartSuccess={handleAddToCartSuccess}
                                    onAddToCartError={handleAddToCartError}
                                    gridCols='three'
                                />
                                {courseData.totalPages > 1 && (
                                    <Pagination
                                        currentPage={filters.page || 1}
                                        totalPages={courseData.totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}