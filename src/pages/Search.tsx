import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {CourseFilters, CourseResult} from "../types/course";
import { MainLayout } from "../layouts/MainLayout";
import { CourseHomeSection } from "../components/course/CourseHomeSection";
import { searchCourses } from "../services/searchService";
import { Pagination } from "../components/common/Pagination";
import { FilterSection } from "../components/common/Filter";
import {useNotification} from "../components/notification/NotificationProvider";

export function Search() {
    const [searchParams, setSearchParams] = useSearchParams();
    const searchQuery = searchParams.get('q');

    const [searchResults, setSearchResults] = useState<CourseResult>({
        courses: [],
        totalPages: 0,
        totalSize: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Lấy các filter từ URL
    const filters = {
        q: searchQuery || '',
        price: searchParams.get('price') || 'all',
        rating: Number(searchParams.get('rating')) || undefined,
        sortBy: searchParams.get('sort') || 'newest',
    };

    const { showNotification } = useNotification();

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!searchQuery) return;

            try {
                setLoading(true);
                // Gọi API với thêm các filter
                const data = await searchCourses(
                    searchQuery,
                    currentPage,
                    {
                        price: filters.price !== 'all' ? filters.price : undefined,
                        rating: filters.rating,
                        sortBy: filters.sortBy !== 'newest' ? filters.sortBy : undefined
                    }
                );
                setSearchResults(data);
            } catch (err) {
                console.error('Error fetching search results:', err);
                setError('Failed to load search results. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchSearchResults();
    }, [searchQuery, currentPage, searchParams]); // Thêm searchParams vào dependencies

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFilterChange = (newFilters: Partial<CourseFilters>) => {
        const params = new URLSearchParams(searchParams);

        // Cập nhật URL params
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value && value !== 'all' && value !== 'newest') {
                params.set(key, value.toString());
            } else {
                params.delete(key);
            }
        });

        setSearchParams(params);
    };

    const handleClearFilters = () => {
        const params = new URLSearchParams();
        if (searchQuery) {
            params.set('q', searchQuery);
        }
        setSearchParams(params);
    };

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

    if (loading) {
        return (
            <MainLayout>
                <div className="flex justify-center items-center min-h-[200px]">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
                </div>
            </MainLayout>
        );
    }

    if (error) {
        return (
            <MainLayout>
                <div className="flex justify-center items-center min-h-[200px] text-red-500">
                    {error}
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Filter Section */}
                    <div className="lg:w-1/4 order-1 lg:order-1">
                        <div className="sticky top-4 z-10">
                            <FilterSection
                                filters={filters}
                                onFilterChange={handleFilterChange}
                                onClearFilters={handleClearFilters}
                                totalCourses={searchResults.totalSize}
                            />
                        </div>
                    </div>

                    {/* Course List Section */}
                    <div className="w-full lg:w-3/4 order-2 lg:order-2">
                        <CourseHomeSection
                            title={`Danh sách khóa học ${filters.q ? `- Tìm kiếm "${filters.q}"` : ''}`}
                            courses={searchResults.courses}
                            displayType='search'
                            onAddToCartSuccess={handleAddToCartSuccess}
                            onAddToCartError={handleAddToCartError}
                            gridCols='three'
                        />

                        {searchResults.totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={searchResults.totalPages}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}