import React, { useEffect, useState } from "react";
import { Course } from "../../models/Course";
import { getMyCourses } from "../../services/courseService";
import { SearchHeaderAndFooterLayout } from "../../layouts/UserLayout";
import { MainLayout } from "../../layouts/MainLayout";
import { CourseHomeSection } from "../../components/course/CourseHomeSection";
import { Link } from "react-router-dom"; // Thêm Link từ react-router-dom

export function MyCoursesPage() {
    const [myCourses, setMyCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchMyCourses = async (page: number) => {
        try {
            setLoading(true);
            const pageData = await getMyCourses(page - 1);

            if (pageData.content) {
                setMyCourses(pageData.content);
                setTotalPages(pageData.totalPages);
                setCurrentPage(page);
            }
        } catch (err) {
            console.error('Error fetching my courses:', err);
            setError('Không thể tải danh sách khóa học. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyCourses(1);
    }, []);

    const handlePageChange = (page: number) => {
        fetchMyCourses(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <SearchHeaderAndFooterLayout>
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
                </div>
            </SearchHeaderAndFooterLayout>
        );
    }

    if (error) {
        return (
            <SearchHeaderAndFooterLayout>
                <div className="flex justify-center items-center h-screen text-red-500">
                    {error}
                </div>
            </SearchHeaderAndFooterLayout>
        );
    }

    if (myCourses.length === 0) {
        return (
            <SearchHeaderAndFooterLayout>
                <div className="min-h-screen">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <h1 className="text-3xl font-bold text-gray-900 mb-8">Khóa học của tôi</h1>
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📚</div>
                            <h3 className="text-xl font-medium text-gray-900 mb-2">
                                Bạn chưa đăng ký khóa học nào
                            </h3>
                            <p className="text-gray-500 mb-6">
                                Hãy khám phá các khóa học hấp dẫn của chúng tôi
                            </p>
                            <Link
                                to="/"
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                            >
                                Khám phá ngay
                            </Link>
                        </div>
                    </div>
                </div>
            </SearchHeaderAndFooterLayout>
        );
    }

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Khóa học của tôi</h1>
                <CourseHomeSection
                    title=""
                    courses={myCourses}
                    displayType='category'  // Sử dụng 'category' để hiển thị pagination
                    hideActions={true}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    showHotLabel={false}
                    initialDisplayCount={12}
                />
            </div>
        </MainLayout>
    );
}