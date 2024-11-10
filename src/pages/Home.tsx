import React, { useEffect, useState } from "react";
import { Course } from "../models/Course";
import { BannerCarousel } from "../components/banner/BannerCarousel";
import { SearchHeaderAndFooterLayout } from "../layouts/UserLayout";
import { CourseHomeSection } from "../components/course/CourseHomeSection";
import { getHomeDiscountCourse, getHomeFreeCourses } from "../services/courseService";
import { MainLayout } from "../layouts/MainLayout";


export function Home() {

    const [freeCourses, setFreeCourses] = useState<Course[]>([]);
    const [discountedCourses, setDiscountedCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch discount courses
    useEffect(() => {
        const fetchDiscountCourses = async () => {
            try {
                const data = await getHomeDiscountCourse();
                setDiscountedCourses(data);
            } catch (err) {
                console.error('Error fetching discount courses:', err);
                setError('Failed to load discount courses. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchDiscountCourses();
    }, []);

    // Fetch free courses
    useEffect(() => {
        const fetchFreeCourses = async () => {

            try {
                const data = await getHomeFreeCourses();
                setFreeCourses(data);
            } catch (err) {
                console.error('Error fetching free courses:', err);
                setError('Failed to load free courses. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchFreeCourses();
    }, []);


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
                {discountedCourses.length > 0 && (
                    <CourseHomeSection
                        title="Khóa học đang được discount"
                        courses={discountedCourses}
                        showHotLabel={true}
                        displayType='home'
                    />
                )}
                {freeCourses.length > 0 && (
                    <CourseHomeSection
                        title="Khóa học Free"
                        courses={freeCourses}
                        displayType='home'
                    />
                )}
            </>

        </MainLayout>
    );
}