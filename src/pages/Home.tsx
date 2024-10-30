import React, {useEffect} from "react";
import {useState} from "react";
import {Pagination} from "../components/common/Pagination";
import {Course} from "../models/Course";
import {CourseCard} from "../components/course/CourseCard";
import {BannerCarousel} from "../components/banner/BannerCarousel";
import {SearchHeaderAndFooterLayout} from "../layouts/UserLayout";
import {CategoryList} from "../components/category/CategoryList";
import {Category} from "../models/Category";
import {getCategories} from "../services/categoryService";
import {CourseHomeSection} from "../components/course/CourseHomeSection";
import {getHomeFreeCourses} from "../services/courseService";


const discountedCourses: Course[] = [];
const vipCourses: Course[] = [];

const courses: Course[] = [];


const coursesPerPage = 8;

export function Home() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [freeCourses, setFreeCourses] = useState<Course[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string|null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        const fetchCategories = async () => {
            console.log('[Home][fetchCategories] Starting to fetch categories...');

            try {
                setLoading(true);
                const data = await getCategories();
                setCategories(data);
                console.log(`[Home][fetchCategories] Received ${data.length} categories`);
            } catch (err) {
                console.error('[Home][fetchCategories] Error in component while fetching categories:', err);
            } finally {
                setLoading(false);
                console.log('[Home][fetchCategories] Finished category fetching process');
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchFreeCourses = async () => {
            console.log('[Home][fetchFreeCourses] Starting to fetch free courses...');

            try {
                const data = await getHomeFreeCourses();
                setFreeCourses(data);
                console.log(`[Home][fetchFreeCourses] Received ${data.length} free courses`);
            } catch (err) {
                console.error('[Home][fetchFreeCourses] Error in component while fetching free courses:', err);
                setError('Failed to load free courses. Please try again later.');
            } finally {
                setLoading(false);
                console.log('[Home][fetchFreeCourses] Finished free course fetching process');
            }
        };

        fetchFreeCourses();
    }, []);

    // const filteredCourses = selectedCategory
    //     ? courses.filter((course) => course.category === selectedCategory || selectedCategory === "All")
    //     : courses;

    // const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
    // const displayedCourses = filteredCourses.slice(
    //     (currentPage - 1) * coursesPerPage,
    //     currentPage * coursesPerPage
    // );

    const handleSelectSubCategory = (subCategory: string) => {
        setSelectedCategory(subCategory === "All" ? null : subCategory);
        setCurrentPage(1);
    };
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleHomeClick = () => {
        setSelectedCategory(null);
        setCurrentPage(1);
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
        <SearchHeaderAndFooterLayout>
            <main className="flex">
                <aside className="w-1/5 p-4">
                    {/* Thay đổi heading Home thành button */}
                    <div
                        onClick={handleHomeClick}
                        className={`cursor-pointer mb-6 p-3 rounded-lg transition-all duration-200 
                            ${selectedCategory === null
                            ? 'bg-blue-100 text-blue-600'
                            : 'hover:bg-gray-100'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                />
                            </svg>
                            <span className="font-semibold">Home</span>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold mb-4">Categories</h2>
                    {categories.map((category, index) => (
                        <CategoryList
                            key={category.id}
                            category={category}
                            onSelectSubCategory={handleSelectSubCategory}
                            selectedCategory={selectedCategory}
                        />
                    ))}
                </aside>
                <div className="w-4/5 p-4">
                    {!selectedCategory && <BannerCarousel/>}
                    {!selectedCategory ? (
                        <>
                            <CourseHomeSection
                                title="Khóa học đang được discount"
                                courses={discountedCourses}
                                showHotLabel={true}
                            />
                            <CourseHomeSection
                                title="Khóa học VIP"
                                courses={vipCourses}
                            />
                            <CourseHomeSection
                                title="Khóa học Free"
                                courses={freeCourses}
                            />
                        </>
                    ) : (
                        // <CourseHomeSection
                        //     title={`Khóa học: ${selectedCategory}`}
                        //     courses={courses.filter(
                        //         course => course.category === selectedCategory ||
                        //             selectedCategory === "All"
                        //     )}
                        //     initialDisplayCount={8}
                        // />
                        <></>
                    )}
                </div>
            </main>
        </SearchHeaderAndFooterLayout>
    );
}