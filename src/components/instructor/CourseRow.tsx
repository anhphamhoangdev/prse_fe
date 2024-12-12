import { InstructorCourse } from "../../types/course";
import { useNavigate } from "react-router-dom";
import React from "react";
import { ArrowUpRight, BookOpen, Edit, Eye, Star, Users } from "lucide-react";
import {formatNumber} from "../../utils/formatNumber";

export const CourseRow: React.FC<{ course: InstructorCourse }> = ({ course }) => {
    const navigate = useNavigate();

    return (
        <div className="group bg-white rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center gap-3 hover:shadow-lg transition-all duration-200 border border-gray-100">
            {/* Thumbnail */}
            <div className="relative w-full sm:w-40 h-48 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden">
                {course.imageUrl ? (
                    <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-gray-400" />
                    </div>
                )}
                {course.isHot && (
                    <span className="absolute top-1 right-1 px-1.5 py-0.5 bg-red-500 text-white text-xs font-medium rounded">
                        HOT
                    </span>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 w-full">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
                    <h3 className="font-semibold text-gray-900 truncate">
                        {course.title}
                    </h3>
                    <span className="text-blue-600 font-semibold whitespace-nowrap">
                        {course.originalPrice.toLocaleString('vi-VN')} VND
                    </span>
                </div>

                <div className="relative group/tooltip">
                    <p className="mt-1 text-sm text-gray-500 line-clamp-1">
                        {course.shortDescription}
                    </p>
                    <div className="absolute left-0 top-full mt-2 p-2 bg-gray-900 text-white text-sm rounded-lg w-80
                    invisible opacity-0 group-hover/tooltip:visible group-hover/tooltip:opacity-100
                    transition-all duration-200 z-50 shadow-lg">
                        {course.shortDescription}
                    </div>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center">
                        <Users className="w-3.5 h-3.5 mr-1"/>
                        {formatNumber(course.totalStudents) || 0}
                    </span>
                    <span className="flex items-center">
                        <Eye className="w-3.5 h-3.5 mr-1"/>
                        {formatNumber(course.totalViews) || 0}
                    </span>
                    <span className="flex items-center">
                        <Star className="w-3.5 h-3.5 mr-1"/>
                        {course.averageRating?.toFixed(1) || '---'}
                    </span>
                </div>

                {/* Actions - Moved inside info section for mobile */}
                <div className="flex items-center gap-2 mt-3 sm:mt-2">
                    <button
                        onClick={() => navigate(`/instructor/course/${course.id}/edit`)}
                        className="inline-flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <Edit className="w-4 h-4"/>
                        <span className="text-sm">Chỉnh sửa</span>
                    </button>
                    <button
                        onClick={() => window.open(`/course-detail/${course.id}`, '_blank')}
                        className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        <ArrowUpRight className="w-4 h-4"/>
                        <span className="text-sm">Xem trang</span>
                    </button>
                </div>
            </div>
        </div>
    );
};