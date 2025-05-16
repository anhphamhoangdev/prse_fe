import React, { useEffect, useState } from "react";
import { Course } from "../models/Course";
import { BannerCarousel } from "../components/banner/BannerCarousel";
import { SearchHeaderAndFooterLayout } from "../layouts/UserLayout";
import { CourseHomeSection } from "../components/course/CourseHomeSection";
import { getHomeDiscountCourse, getHomeFreeCourses, getHomeHotCourse, getMyCourses, getRecommendationCourses } from "../services/courseService";
import { MainLayout } from "../layouts/MainLayout";
import { useNotification } from "../components/notification/NotificationProvider";
import { EmptyCourseSection } from "../components/course/EmptyCourseSection";
import { useNavigate } from "react-router-dom";
import ThemeSwitcher from "../components/common/ThemeSwitcher";

export function Home() {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    // Kiểm tra đăng nhập thông qua localStorage/sessionStorage
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
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
    const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
    const [recommendedLoading, setRecommendedLoading] = useState(true);
    const [recommendedError, setRecommendedError] = useState<string | null>(null);

    // Kiểm tra trạng thái đăng nhập
    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            setIsAuthenticated(!!token);
        };
        checkAuth();
        // Lắng nghe sự kiện storage thay đổi
        window.addEventListener('storage', checkAuth);
        return () => {
            window.removeEventListener('storage', checkAuth);
        };
    }, []);

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

    const fetchRecommendedCourses = async () => {
        try {
            setRecommendedLoading(true);
            const courses = await getRecommendationCourses();
            setRecommendedCourses(courses);
            setRecommendedError(null);
        } catch (err) {
            console.error('Error fetching recommended courses:', err);
            setRecommendedError('Không thể tải khóa học gợi ý. Vui lòng thử lại sau.');
        } finally {
            setRecommendedLoading(false);
            setLoading(false);
        }
    };

    // Fetch recommended courses only if user is authenticated
    useEffect(() => {
        if (isAuthenticated) {
            fetchRecommendedCourses();
        } else {
            setRecommendedLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchHotCourses(1);
    }, []);

    useEffect(() => {
        const handleAuthLogout = () => {
            fetchHotCourses(1);
            fetchDiscountCourses(1);
            setIsAuthenticated(false);
        };
        const handleAuthLogin = () => {
            setIsAuthenticated(true);
            fetchRecommendedCourses();
        };
        window.addEventListener('auth-logout', handleAuthLogout);
        window.addEventListener('auth-login', handleAuthLogin);
        return () => {
            window.removeEventListener('auth-logout', handleAuthLogout);
            window.removeEventListener('auth-login', handleAuthLogin);
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

    const handleExploreMoreCourses = () => {
        navigate('/courses');
    };

    const handleLogin = () => {
        navigate('/login');
    };

    const handleRegister = () => {
        navigate('/signup');
    };

    if (loading) {
        return (
            <SearchHeaderAndFooterLayout>
                <div className="flex flex-col justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600 font-medium">Đang tải khóa học...</p>
                </div>
            </SearchHeaderAndFooterLayout>
        );
    }

    if (error) {
        return (
            <SearchHeaderAndFooterLayout>
                <div className="flex flex-col justify-center items-center h-screen">
                    <div className="bg-red-50 p-6 rounded-lg shadow-md max-w-md">
                        <h2 className="text-2xl font-bold text-red-600 mb-2">Rất tiếc!</h2>
                        <p className="text-red-500">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition duration-200"
                        >
                            Thử lại
                        </button>
                    </div>
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
            <div className="container mx-auto px-4 space-y-6 my-6">
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
                        {/* Hiển thị phần Khóa học phù hợp */}
                        {isAuthenticated ? (
                            // Người dùng đã đăng nhập
                            <>
                                {recommendedLoading ? (
                                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
                                        <h2 className="text-2xl font-bold text-blue-800 mb-2">✨ Dành riêng cho bạn</h2>
                                        <div className="flex items-center py-3">
                                            <div className="animate-spin rounded-full h-6 w-6 border-3 border-blue-500 border-t-transparent mr-3"></div>
                                            <span className="text-gray-600">Đang cá nhân hóa khóa học phù hợp...</span>
                                        </div>
                                    </div>
                                ) : recommendedError ? (
                                    <div className="bg-red-50 p-3 rounded-lg">
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                            <p className="text-red-700 font-medium">{recommendedError}</p>
                                        </div>
                                        <button
                                            onClick={fetchRecommendedCourses}
                                            className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                                        >
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            Thử lại
                                        </button>
                                    </div>
                                ) : recommendedCourses.length > 0 ? (
                                    <div>
                                        <div className="mb-1">
                                            <h2 className="text-2xl font-bold text-blue-800">✨ Dành riêng cho bạn</h2>
                                            <p className="text-gray-600 text-sm">Được gợi ý dựa trên hoạt động của bạn</p>
                                        </div>
                                        <CourseHomeSection
                                            title=""
                                            courses={recommendedCourses}
                                            displayType='category'
                                            onAddToCartSuccess={handleAddToCartSuccess}
                                            onAddToCartError={handleAddToCartError}
                                        />
                                    </div>
                                ) : (
                                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 flex items-center">
                                        <div className="mr-4 text-3xl">✨</div>
                                        <div>
                                            <h2 className="text-xl font-bold text-blue-800">Dành riêng cho bạn</h2>
                                            <p className="text-gray-600 text-sm">
                                                Xem thêm nhiều khóa học để nhận gợi ý phù hợp với sở thích của bạn.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            // Người dùng chưa đăng nhập
                            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 flex flex-col sm:flex-row items-center">
                                <div className="mr-4 text-3xl hidden sm:block">✨</div>
                                <div className="mb-3 sm:mb-0 text-center sm:text-left">
                                    <h2 className="text-xl font-bold text-blue-800">Khóa học dành riêng cho bạn</h2>
                                    <p className="text-gray-600 text-sm mb-2">
                                        Đăng nhập để nhận gợi ý khóa học phù hợp với sở thích của bạn
                                    </p>
                                </div>
                                <div className="flex gap-2 sm:ml-auto">
                                    <button
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm transition-colors duration-200"
                                        onClick={handleLogin}
                                    >
                                        Đăng nhập
                                    </button>
                                    <button
                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm transition-colors duration-200"
                                        onClick={handleRegister}
                                    >
                                        Đăng ký
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Hiển thị khóa học hot */}
                        {hotLoading ? (
                            <div className="py-4">
                                <div className="flex items-center mb-4">
                                    <h2 className="text-2xl font-bold text-gray-800">Khóa học nổi bật</h2>
                                    <div className="ml-3 px-3 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full">HOT</div>
                                </div>
                                <div className="flex justify-center py-4">
                                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
                                </div>
                            </div>
                        ) : hotError ? (
                            <div className="bg-red-50 p-4 rounded-lg">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-red-700 font-medium">{hotError}</p>
                                </div>
                                <button
                                    onClick={() => fetchHotCourses(1)}
                                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Thử lại
                                </button>
                            </div>
                        ) : hotCourses.length > 0 ? (
                            <CourseHomeSection
                                title="Khóa học nổi bật"
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
                            <div className="py-4">
                                <div className="flex items-center mb-4">
                                    <h2 className="text-2xl font-bold text-gray-800">Khóa học đang được giảm giá</h2>
                                    <div className="ml-3 px-3 py-1 bg-orange-100 text-orange-600 text-xs font-semibold rounded-full">DISCOUNT</div>
                                </div>
                                <div className="flex justify-center py-4">
                                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
                                </div>
                            </div>
                        ) : discountError ? (
                            <div className="bg-red-50 p-4 rounded-lg">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-red-700 font-medium">{discountError}</p>
                                </div>
                                <button
                                    onClick={() => fetchDiscountCourses(1)}
                                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Thử lại
                                </button>
                            </div>
                        ) : discountedCourses.length > 0 ? (
                            <CourseHomeSection
                                title="Khóa học đang được giảm giá"
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
            </div>
        </MainLayout>
    );
}