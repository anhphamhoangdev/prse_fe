import React, { useEffect, useState } from "react";
import { Course } from "../models/Course";
import { BannerCarousel } from "../components/banner/BannerCarousel";
import { SearchHeaderAndFooterLayout } from "../layouts/UserLayout";
import { CourseHomeSection } from "../components/course/CourseHomeSection";
import {getHomeDiscountCourse, getHomeFreeCourses, getHomeHotCourse, getMyCourses} from "../services/courseService";
import { MainLayout } from "../layouts/MainLayout";
import {useNotification} from "../components/notification/NotificationProvider";


export function Home() {

    const { showNotification } = useNotification();

    const [freeCourses, setFreeCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [discountedCourses, setDiscountedCourses] = useState<Course[]>([]);
    const [discountCurrentPage, setDiscountCurrentPage] = useState(1);
    const [discountTotalPages, setDiscountTotalPages] = useState(1);
    const [discountTotalElements, setDiscountTotalElements] = useState(0);


    const [hotCourses, setHotCourses] = useState<Course[]>([]);
    const [hotCurrentPage, setHotCurrentPage] = useState(1);
    const [hotTotalPages, setHotTotalPages] = useState(1);
    const [hotTotalElements, setHotTotalElements] = useState(0);

    // Fetch discount courses
    const fetchDiscountCourses = async (page: number) => {
        try {
            setLoading(true);
            const pageData = await getHomeDiscountCourse(page - 1);
            setDiscountedCourses(pageData.content);
            setDiscountTotalPages(pageData.totalPages);
            setDiscountTotalElements(pageData.totalElements);
            setDiscountCurrentPage(pageData.number + 1);
        } catch (err) {
            console.error('Error fetching discount courses:', err);
            setError('Failed to load discount courses. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDiscountCourses(1);
    }, []);

    const fetchHotCourses = async (page: number) => {
        try {
            setLoading(true);
            const pageData = await getHomeHotCourse(page - 1);
            setHotCourses(pageData.content);
            setHotTotalPages(pageData.totalPages);
            setHotTotalElements(pageData.totalElements);
            setHotCurrentPage(pageData.number + 1);
        } catch (err) {
            console.error('Error fetching discount courses:', err);
            setError('Failed to load discount courses. Please try again later.');
        } finally {
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


    // Fetch free courses
    // useEffect(() => {
    //     const fetchFreeCourses = async () => {
    //
    //         try {
    //             const data = await getHomeFreeCourses();
    //             setFreeCourses(data);
    //         } catch (err) {
    //             console.error('Error fetching free courses:', err);
    //             setError('Failed to load free courses. Please try again later.');
    //         } finally {
    //             setLoading(false);
    //         }
    //     };
    //
    //     fetchFreeCourses();
    // }, []);

    // }, []);


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



    return (
        <MainLayout>
            <BannerCarousel />
            <>

                {/* Khóa học đang hot */}
                {hotCourses.length > 0 && (
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
                )}

                {discountedCourses.length > 0 && (
                    <CourseHomeSection
                        title="Khóa học đang được discount"
                        courses={discountedCourses}
                        displayType='home'
                        onAddToCartSuccess={handleAddToCartSuccess}
                        onAddToCartError={handleAddToCartError}
                        totalElements={discountTotalElements}
                        viewAllLink="/courses/discount"
                    />
                )}
                {/*{freeCourses.length > 0 && (*/}
                {/*    <CourseHomeSection*/}
                {/*        title="Khóa học Free"*/}
                {/*        courses={freeCourses}*/}
                {/*        displayType='home'*/}
                {/*        onAddToCartSuccess={handleAddToCartSuccess}*/}
                {/*        onAddToCartError={handleAddToCartError}*/}
                {/*    />*/}
                {/*)}*/}
            </>

        </MainLayout>
    );
}