import React from 'react';
import { useNavigate } from 'react-router-dom';
import "./style.css";
import { Course } from "../../models/Course";
import { formatCurrency } from "../../utils/formatCurrency";

interface CourseCardProps {
    course: Course;
    onAddToCart?: (course: Course) => void;
    onAddToWishlist?: (course: Course) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
                                                          course,
                                                          onAddToCart = () => alert('Added to cart'),
                                                          onAddToWishlist = () => alert('Added to wishlist')
                                                      }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(`/course-detail/${course.id}`);
    };

    return (
        <div
            className="border flex flex-col justify-between relative h-full bg-white rounded-lg transform transition duration-500 hover:scale-105 hover:shadow-xl cursor-pointer"
            onClick={handleCardClick}
        >
            <img src={course.imageUrl} alt={course.title} className="w-full h-40 object-cover rounded-t-lg" />
            <div className="p-4">
                <h2 className="text-lg font-bold mb-2 h-20 overflow-hidden course-title">
                    {course.title}
                </h2>
                <div className="flex items-center mb-2">
                    <i className="fas fa-user mr-2"></i>
                    <span>{course.totalStudents}</span>
                    <i className="fas fa-eye ml-4 mr-2"></i>
                    <span>{course.totalViews}</span>
                </div>
                <div className="flex items-center mb-2">
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => {
                            const starClass = i < Math.floor(course.averageRating) ? 'fas fa-star text-yellow-400' :
                                i < course.averageRating ? 'fas fa-star-half-alt text-yellow-400' : 'far fa-star text-gray-400';
                            return <i key={i} className={starClass}></i>;
                        })}
                    </div>
                    <span className="ml-2">{course.averageRating.toFixed(1)}</span>
                </div>
                <div className="font-bold mb-2 flex justify-between items-center">
                    <div>
                        {course.isDiscount ? (
                            <>
                                <span className="line-through text-gray-500 mr-1">
                                    {formatCurrency(course.originalPrice)}
                                </span>
                                <span className="text-red-600 font-bold">
                                    {formatCurrency(course.discountPrice)}
                                </span>
                            </>
                        ) : (
                            <span className={course.originalPrice <= 0 ? "text-orange-600" : ""}>
                                {formatCurrency(course.originalPrice)}
                            </span>
                        )}
                    </div>

                    <div className="flex space-x-2">
                        <button
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation(); // Ngăn chặn sự kiện click lan truyền
                                onAddToCart(course);
                            }}
                            title="Add to Cart"
                        >
                            <i className="fas fa-shopping-cart text-sm"></i>
                        </button>
                        <button
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation(); // Ngăn chặn sự kiện click lan truyền
                                onAddToWishlist(course);
                            }}
                            title="Add to Wishlist"
                        >
                            <i className="fas fa-heart text-sm"></i>
                        </button>
                    </div>
                </div>
            </div>

            {course.isHot && (
                <div className="absolute top-0 right-0 bg-red-500 text-white px-2 py-1 text-xs rounded-tr-lg">
                    Hot
                </div>
            )}
        </div>
    );
};