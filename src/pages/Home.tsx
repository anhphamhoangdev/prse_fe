import React, { useEffect, useState } from "react";
import { Course } from "../models/Course";
import { BannerCarousel } from "../components/banner/BannerCarousel";
import { SearchHeaderAndFooterLayout } from "../layouts/UserLayout";
import { CourseHomeSection } from "../components/course/CourseHomeSection";
import { getHomeDiscountCourse, getHomeFreeCourses, getHomeHotCourse, getMyCourses } from "../services/courseService";
import { MainLayout } from "../layouts/MainLayout";
import { useNotification } from "../components/notification/NotificationProvider";
import { EmptyCourseSection } from "../components/course/EmptyCourseSection";
import { useNavigate } from "react-router-dom";
import ThemeSwitcher from "../components/common/ThemeSwitcher";

export function Home() {
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const [freeCourses, setFreeCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [discountedCourses, setDiscountedCourses] = useState<Course[]>([]);
    const [discountCurrentPage, setDiscountCurrentPage] = useState(1);
    const [discountTotalPages, setDiscountTotalPages] = useState(1);
    const [discountTotalElements, setDiscountTotalElements] = useState(0);
    const [discountLoading, setDiscountLoading] = useState(true);
    const [discountError, setDiscountError] = useState<string | null>(null);

    const [hotCourses, setHotCourses] = useState<Course[]>([]);
    const [hotCurrentPage, setHotCurrentPage] = useState(1);
    const [hotTotalPages, setHotTotalPages] = useState(1);
    const [hotTotalElements, setHotTotalElements] = useState(0);
    const [hotLoading, setHotLoading] = useState(true);
    const [hotError, setHotError] = useState<string | null>(null);

    // Fetch discount courses
    const fetchDiscountCourses = async (page: number) => {
        try {
            setDiscountLoading(true);
            const pageData = await getHomeDiscountCourse(page - 1);
            setDiscountedCourses(pageData.content);
            setDiscountTotalPages(pageData.totalPages);
            setDiscountTotalElements(pageData.totalElements);
            setDiscountCurrentPage(pageData.number + 1);
            setDiscountError(null);
        } catch (err) {
            console.error('Error fetching discount courses:', err);
            setDiscountError('Không thể tải khóa học giảm giá. Vui lòng thử lại sau.');
        } finally {
            setDiscountLoading(false);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDiscountCourses(1);
    }, []);

    const fetchHotCourses = async (page: number) => {
        try {
            setHotLoading(true);
            const pageData = await getHomeHotCourse(page - 1);
            setHotCourses(pageData.content);
            setHotTotalPages(pageData.totalPages);
            setHotTotalElements(pageData.totalElements);
            setHotCurrentPage(pageData.number + 1);
            setHotError(null);
        } catch (err) {
            console.error('Error fetching hot courses:', err);
            setHotError('Không thể tải khóa học hot. Vui lòng thử lại sau.');
        } finally {
            setHotLoading(false);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHotCourses(1);
    }, []);

    useEffect(() => {
        const handleAuthLogout = () => {
            fetchHotCourses(1);
            fetchDiscountCourses(1);
        };

        window.addEventListener('auth-logout', handleAuthLogout);

        return () => {
            window.removeEventListener('auth-logout', handleAuthLogout);
        };
    }, []);

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

    const handleBrowseAllCourses = () => {
        navigate('/courses');
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

    // Kiểm tra nếu không có khóa học nào được tải
    const noCoursesAvailable = (!hotLoading && hotCourses.length === 0 && !hotError) &&
        (!discountLoading && discountedCourses.length === 0 && !discountError);

    return (
        <MainLayout>
            <BannerCarousel/>
            {noCoursesAvailable ? (
                <div className="container">
                    <EmptyCourseSection
                        message="Không có khóa học nào hiển thị"
                        subMessage="Bạn có thể đã đăng ký tất cả các khóa học hiện có hoặc chưa có khóa học nào được cung cấp vào lúc này."
                        actionText="Xem tất cả khóa học"
                        onAction={handleBrowseAllCourses}
                    />
                </div>
            ) : (
                <>
                    {/* Hiển thị khóa học hot */}
                    {hotLoading ? (
                        <div className="py-8 flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : hotError ? (
                        <div className="bg-red-100 text-red-700 p-4 rounded-md my-4">
                            {hotError}
                        </div>
                    ) : hotCourses.length > 0 ? (
                        <CourseHomeSection
                            title="Khóa học"
                            courses={hotCourses}
                            showHotLabel={true}
                            displayType='home'
                            onAddToCartSuccess={handleAddToCartSuccess}
                            onAddToCartError={handleAddToCartError}
                            totalElements={hotTotalElements}
                            viewAllLink="/courses/hot"
                        />
                    ) : null}

                    {/* Hiển thị khóa học giảm giá */}
                    {discountLoading ? (
                        <div className="py-8 flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : discountError ? (
                        <div className="bg-red-100 text-red-700 p-4 rounded-md my-4">
                            {discountError}
                        </div>
                    ) : discountedCourses.length > 0 ? (
                        <CourseHomeSection
                            title="Khóa học đang được discount"
                            courses={discountedCourses}
                            displayType='home'
                            onAddToCartSuccess={handleAddToCartSuccess}
                            onAddToCartError={handleAddToCartError}
                            totalElements={discountTotalElements}
                            viewAllLink="/courses/discount"
                        />
                    ) : null}
                </>
            )}
        </MainLayout>
    );
}