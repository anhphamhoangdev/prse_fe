import React, { useEffect, useState } from "react";
import {Course} from "../models/Course";
import {useNotification} from "../components/notification/NotificationProvider";
import {getHomeHotCourse} from "../services/courseService";
import {MainLayout} from "../layouts/MainLayout";
import {CourseHomeSection} from "../components/course/CourseHomeSection";

export function AllHotCoursesPage() {
    const { showNotification } = useNotification();
    const [courses, setCourses] = useState<Course[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Tạo một state mới để track việc loading
    const [isPageChanging, setIsPageChanging] = useState(false);

    const fetchCourses = async (page: number) => {
        try {
            // Chỉ set loading full page khi load lần đầu
            if (!isPageChanging) {
                setLoading(true);
            }
            const pageData = await getHomeHotCourse(page - 1);
            setCourses(pageData.content);
            setTotalPages(pageData.totalPages);
            // Không lấy page từ API response nữa
            setCurrentPage(page);
        } catch (err) {
            console.error('Error fetching hot courses:', err);
            setError('Không thể tải danh sách khóa học. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
            setIsPageChanging(false);
        }
    };

    useEffect(() => {
        fetchCourses(1);
    }, []);

    const handlePageChange = (page: number) => {
        setIsPageChanging(true);
        setCurrentPage(page); // Set page ngay lập tức để UI cập nhật
        fetchCourses(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
                </div>
            </MainLayout>
        );
    }

    if (error) {
        return (
            <MainLayout>
                <div className="flex justify-center items-center h-screen text-red-500">
                    {error}
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                    Tất cả khóa học hot nhất
                </h2>
                <CourseHomeSection
                    title=""
                    courses={courses}
                    displayType="category"
                    currentPage={currentPage} // currentPage sẽ được giữ nguyên
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    onAddToCartSuccess={handleAddToCartSuccess}
                    onAddToCartError={handleAddToCartError}
                />
                {isPageChanging && (
                    <div className="flex justify-center mt-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}