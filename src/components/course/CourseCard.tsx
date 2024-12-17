import React from 'react';
import {useNavigate} from 'react-router-dom';
import "./style.css";
import {Course} from "../../models/Course";
import {formatCurrency} from "../../utils/formatCurrency";
import {formatNumber} from "../../utils/formatNumber";

interface CourseCardProps {
    course: Course;
    onAddToCart: (course: Course) => void;
    onBuyNow: (course: Course) => void;
    hideActions?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({
                                                          course,
                                                          onAddToCart,
                                                          onBuyNow,
                                                          hideActions = false
                                                      }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(`/course-detail/${course.id}`);
    };


    return (
        <div
            className="border border-gray-200/70 flex flex-col justify-between relative h-full bg-white rounded-xl transform transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-blue-200 cursor-pointer group"
            onClick={handleCardClick}
        >
            <div className="relative overflow-hidden rounded-t-xl">
                <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="w-full h-40 object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"/>
            </div>

            <div className="p-5">
                <h4 className="text-gray-900 font-bold mb-3 h-20 overflow-hidden course-title group-hover:text-blue-600 transition-colors duration-300 leading-snug">
                    {course.title}
                </h4>

                <div className="flex items-center justify-between mb-3 text-gray-500 bg-gray-50/80 p-2 rounded-lg">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1.5">
                            <i className="fas fa-user-graduate text-blue-600/80"></i>
                            <span className="text-sm font-medium">{formatNumber(course.totalStudents)}</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                            <i className="fas fa-eye text-blue-600/80"></i>
                            <span className="text-sm font-medium">{formatNumber(course.totalViews)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center mb-3 bg-blue-50/50 p-2.5 rounded-lg group-hover:bg-blue-50 transition-colors duration-300">
                    <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => {
                            const starClass = i < Math.floor(course.averageRating) ? 'fas fa-star text-yellow-400' :
                                i < course.averageRating ? 'fas fa-star-half-alt text-yellow-400' : 'far fa-star text-gray-300';
                            return <i key={i} className={`${starClass} text-base transition-transform duration-300 hover:scale-110`}></i>;
                        })}
                        <span className="ml-2 text-blue-700 font-semibold bg-blue-100/50 px-2 py-0.5 rounded">
                            {course.averageRating.toFixed(1)}
                        </span>
                    </div>
                </div>

                {!hideActions ? (
                    <div className="font-bold flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            {course.discountPrice && course.discountPrice < course.originalPrice ? (
                                <>
                    <span
                        className="relative bg-gradient-to-r from-red-500 via-rose-500 to-red-500 text-white font-bold px-4 py-1.5 rounded-lg shadow-md group-hover:shadow-lg transition-all duration-300">
                        <span className="relative">
                            {formatCurrency(course.discountPrice)}
                        </span>
                        <div
                            className="absolute -right-1 -top-2 bg-yellow-400 text-[10px] text-red-600 font-black py-0.5 px-1.5 rounded-full shadow-sm">
                            -{Math.round(((course.originalPrice - course.discountPrice) / course.originalPrice) * 100)}%
                        </div>
                    </span>
                                    <span className="text-gray-400 text-sm line-through opacity-70">
                        {formatCurrency(course.originalPrice)}
                    </span>
                                </>
                            ) : (
                                <span className={`px-3 py-1 rounded-lg shadow-sm group-hover:shadow-md transition-all duration-300 
                    ${course.originalPrice <= 0
                                    ? "bg-blue-50 text-blue-600"
                                    : "bg-gray-50 text-gray-700"}`}>
                    {formatCurrency(course.originalPrice)}
                </span>
                            )}
                        </div>

                        <div className="flex space-x-2">
                            <button
                                className="relative group/btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAddToCart(course);
                                }}
                            >
                                <div
                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-all duration-300 hover:shadow-md relative hover:scale-105 overflow-visible">
                                    <i className="fas fa-shopping-cart text-sm group-hover/btn:scale-110 transition-transform duration-300"></i>
                                </div>

                                {/* Tooltip được điều chỉnh vị trí mới */}
                                <div className="absolute bottom-[calc(100%+10px)] right-0">
                                    <div
                                        className="relative opacity-0 group-hover/btn:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover/btn:translate-y-0 pointer-events-none z-[1]">
                                        <div
                                            className="bg-blue-600 text-white text-xs py-1.5 px-3 rounded-lg shadow-lg whitespace-nowrap">
                                            Thêm vào giỏ hàng
                                        </div>
                                        {/* Điều chỉnh mũi tên chỉ xuống */}
                                        <div
                                            className="absolute right-4 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-blue-600"></div>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-end">
                        <button
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-all duration-300 hover:shadow-md group/btn relative hover:scale-105"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/course-detail/${course.id}`);
                            }}
                        >
                            <i className="fas fa-play text-sm group-hover/btn:scale-110 transition-transform duration-300"></i>
                            <span
                                className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs py-1.5 px-3 rounded-lg shadow-lg opacity-0 group-hover/btn:opacity-100 transition-all duration-300 whitespace-nowrap">
                                Vào học
                            </span>
                        </button>
                    </div>
                )}
            </div>

            {course.isHot && (
                <div
                    className="absolute top-3 right-3 bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 text-white px-3 py-1.5 text-xs font-semibold rounded-full shadow-lg backdrop-blur-sm animate-pulse">
                    <span className="flex items-center gap-1.5">
                        Hot
                        <i className="fas fa-fire-flame-curved animate-bounce"></i>
                    </span>
                </div>
            )}
        </div>
    );
};