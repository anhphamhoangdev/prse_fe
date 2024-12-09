import {Course} from "../../models/Course";
import React from "react";
import {CourseCard} from "./CourseCard";
import {Pagination} from "../common/Pagination";
import {addToCart} from "../../services/cartService";
import {Link} from "react-router-dom";

interface CourseHomeSectionProps {
    title: string;
    courses: Course[];
    showHotLabel?: boolean;
    displayType: 'home' | 'category' | 'search';
    initialDisplayCount?: number;
    currentPage?: number;
    totalPages?: number;
    onPageChange?: (page: number) => void;
    onAddToCartSuccess?: () => void;
    onAddToCartError?: (message: string) => void;
    hideActions?: boolean;
    totalElements?: number;
    viewAllLink?: string;
    gridCols?: 'three' | 'four';

}

export const CourseHomeSection: React.FC<CourseHomeSectionProps> = ({
                                                                        title,
                                                                        courses,
                                                                        showHotLabel = false,
                                                                        displayType = 'home',
                                                                        initialDisplayCount = 8,
                                                                        currentPage,
                                                                        totalPages,
                                                                        onPageChange,
                                                                        onAddToCartSuccess,
                                                                        onAddToCartError,
                                                                        hideActions = false,
                                                                        totalElements,
                                                                        viewAllLink,
                                                                        gridCols = 'four'
                                                                    }) => {
    const [showAll, setShowAll] = React.useState(false);

    // Chỉ sử dụng cho trang home
    const displayedCourses = displayType === 'home'
        ? (showAll ? courses : courses.slice(0, initialDisplayCount))
        : courses;

    const hasMoreCourses = displayType === 'home' && courses.length > initialDisplayCount;

    const updateHeaderCartCount = () => {
        // Dispatch một custom event để Header component có thể lắng nghe
        const event = new CustomEvent('cartUpdated');
        window.dispatchEvent(event);
    };

    const handleAddToCart = async (course: Course) => {
        try {
            const response = await addToCart(course.id);
            if (response.code === 1) {
                updateHeaderCartCount();
                onAddToCartSuccess?.();
            } else {
                onAddToCartError?.(response.error_message ? response.error_message : 'Có lỗi xảy ra khi thêm vào giỏ hàng');
            }
        } catch (error) {
            console.error('Add to cart error:', error);
            onAddToCartError?.('Có lỗi xảy ra khi thêm vào giỏ hàng');
        }
    };

    function handleBuyNow (course : Course) {
        console.log("Enroll now : " + course.id)
    }

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
                {viewAllLink && totalElements && (
                    <Link
                        to={viewAllLink}
                        className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                    >
                        Xem tất cả ({totalElements})
                    </Link>
                )}
                {/* Nút Thu gọn/Xem thêm cho trang home */}
                {displayType === 'home' && hasMoreCourses && !viewAllLink && (
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                    >
                        {showAll ? 'Thu gọn' : 'Xem thêm'}
                    </button>
                )}
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-2 ${
                gridCols === 'four'
                    ? 'md:grid-cols-3 lg:grid-cols-4'
                    : 'md:grid-cols-3'
            } gap-4 gap-y-5`}>
                {displayedCourses.map((course) => (
                    <CourseCard
                        key={course.id}
                        course={course}
                        onAddToCart={handleAddToCart}
                        onBuyNow={handleBuyNow}
                        hideActions={hideActions}
                    />
                ))}
            </div>

            {displayType === 'home' && hasMoreCourses && !viewAllLink ? (
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
                <Pagination
                    currentPage={currentPage || 1}
                    totalPages={totalPages}
                    onPageChange={onPageChange || (() => {
                    })}
                />
            ) : null}
        </div>
    );
};