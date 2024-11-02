import {Course} from "../../models/Course";
import React from "react";
import {CourseCard} from "./CourseCard";
import {Pagination} from "../common/Pagination";

interface CourseHomeSectionProps {
    title: string;
    courses: Course[];
    showHotLabel?: boolean;
    displayType: 'home' | 'category' | 'search'; // Thêm prop để phân biệt kiểu hiển thị
    // Props cho trang home
    initialDisplayCount?: number;
    // Props cho trang category
    currentPage?: number;
    totalPages?: number;
    onPageChange?: (page: number) => void;
}

export const CourseHomeSection: React.FC<CourseHomeSectionProps> = ({
                                                                        title,
                                                                        courses,
                                                                        showHotLabel = false,
                                                                        displayType = 'home',
                                                                        initialDisplayCount = 8,
                                                                        currentPage,
                                                                        totalPages,
                                                                        onPageChange
                                                                    }) => {
    const [showAll, setShowAll] = React.useState(false);

    // Chỉ sử dụng cho trang home
    const displayedCourses = displayType === 'home'
        ? (showAll ? courses : courses.slice(0, initialDisplayCount))
        : courses;

    const hasMoreCourses = displayType === 'home' && courses.length > initialDisplayCount;

    return (
        <div className="my-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">
                    {title}
                    {showHotLabel && (
                        <span className="border-1 text-white bg-red-500 rounded text-xs mx-2 px-2 py-2">
                            HOT
                        </span>
                    )}
                </h2>
                {displayType === 'home' && hasMoreCourses && (
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                    >
                        {showAll ? 'Thu gọn' : 'Xem thêm'}
                    </button>
                )}
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-2 ${
                displayType === 'home'
                    ? 'md:grid-cols-3 lg:grid-cols-4'
                    : 'md:grid-cols-3'  // category và search chỉ có 3 cột
            } gap-4 gap-y-5`}
            >
                {displayedCourses.map((course) => (
                    <CourseCard key={course.id} course={course}/>
                ))}
            </div>

            {displayType === 'home' && hasMoreCourses ? (
                // Nút xem thêm cho trang home
                <div className="flex justify-center mt-4">
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className={`px-4 py-2 rounded-lg transition-colors duration-200 
                            ${showAll
                            ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            : 'bg-blue-100 hover:bg-blue-200 text-blue-700'}`}
                    >
                        {showAll ? 'Thu gọn' : `Xem tất cả ${courses.length} khóa học`}
                    </button>
                </div>
            ) : (displayType === 'category' || displayType === 'search') && totalPages && totalPages > 1 ? (
                // Pagination cho trang category
                <Pagination
                    currentPage={currentPage || 1}
                    totalPages={totalPages}
                    onPageChange={onPageChange || (() => {})}
                />
            ) : null}
        </div>
    );
};