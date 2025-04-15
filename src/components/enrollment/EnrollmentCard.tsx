// components/EnrollmentCard.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Enrollment } from "../../services/courseService";

interface EnrollmentCardProps {
    enrollment: Enrollment;
}

export const EnrollmentCard: React.FC<EnrollmentCardProps> = ({ enrollment }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(`/course-detail/${enrollment.course.id}`);
    };

    // Xác định các thông tin trạng thái
    const statusConfig = {
        completed: {
            label: "Hoàn thành",
            color: "bg-green-100 text-green-700 border-green-200",
            icon: "fa-check-circle",
            progressColor: "from-green-400 to-green-600", // Giữ màu xanh lá
            timeIcon: "fa-trophy",
            timeColor: "text-green-600"
        },
        in_progress: {
            label: "Đang học",
            color: "bg-cyan-100 text-cyan-700 border-cyan-200", // Thay từ blue sang cyan
            icon: "fa-book-open",
            progressColor: "from-cyan-400 to-cyan-600", // Thay từ blue sang cyan
            timeIcon: "fa-clock",
            timeColor: "text-cyan-600" // Thay từ blue sang cyan
        },
        not_started: {
            label: "Chưa bắt đầu",
            color: "bg-gray-100 text-gray-700 border-gray-200",
            icon: "fa-hourglass-start",
            progressColor: "from-gray-400 to-gray-600", // Giữ màu xám
            timeIcon: "fa-calendar-plus",
            timeColor: "text-gray-600"
        }
    };

    const status = enrollment.status as keyof typeof statusConfig;
    const { label, color, icon, progressColor, timeIcon, timeColor } = statusConfig[status] || statusConfig.not_started;

    // Format date function
    const formatDate = (dateString: string | undefined): string => {
        if (!dateString) return "Chưa có";
        return new Date(dateString).toLocaleDateString("vi-VN");
    };

    // Làm tròn số phần trăm progress
    const roundedProgress = Math.round(enrollment.progressPercent);

    return (
        <div
            className="relative border border-gray-200 bg-white rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-xl group cursor-pointer"
            onClick={handleCardClick}
        >
            {/* Hot Badge */}
            {enrollment.course.isHot && (
                <div className="absolute top-3 left-0 z-10 bg-red-500 text-white py-1 px-3 rounded-r-full shadow-md">
                    <span className="flex items-center">
                        <i className="fas fa-fire mr-1"></i> HOT
                    </span>
                </div>
            )}

            {/* Image Container */}
            <div className="relative overflow-hidden h-40">
                <img
                    src={enrollment.course.imageUrl}
                    alt={enrollment.course.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Image Overlay with info */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent
                      flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-xs line-clamp-2">{enrollment.course.shortDescription}</p>
                </div>

                {/* Language badge */}
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-xs px-2 py-1 rounded-lg shadow-sm font-medium">
                    {enrollment.course.language}
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Title */}
                <h3 className="font-bold text-gray-900 text-base mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                    {enrollment.course.title}
                </h3>

                {/* Time info section - Show both enrollment and completion dates */}
                <div className="mb-3 bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                    {/* Enrollment date - Always show this */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1.5">
                        <i className="fas fa-calendar-plus text-blue-500"></i>
                        <span className="font-medium">Ngày đăng ký:</span>
                        <span className="font-bold">{formatDate(enrollment.enrolledAt)}</span>
                    </div>

                    {/* Completion date - Show for all statuses but style differently */}
                    <div className="flex items-center gap-1.5 text-xs">
                        <i className={`fas fa-trophy ${status === "completed" ? "text-green-500" : "text-gray-400"}`}></i>
                        <span className="font-medium">Ngày hoàn thành:</span>
                        {status === "completed" ? (
                            <span className="font-bold text-green-600">{formatDate(enrollment.completedAt ? enrollment.completedAt : "")}</span>
                        ) : (
                            <span className="italic text-gray-400">Chưa hoàn thành</span>
                        )}
                    </div>
                </div>

                {/* Stats row */}
                <div className="flex items-center justify-between mb-3 text-xs text-gray-500 border-t border-gray-100 pt-2">
                    <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
                        <i className="fas fa-users text-blue-500"></i>
                        <span>{enrollment.course.totalStudents} học viên</span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
                        <i className="fas fa-star text-yellow-500"></i>
                        <span>{enrollment.course.averageRating.toFixed(1)}</span>
                    </div>
                </div>

                {/* Progress Bar (redesigned and more prominent) */}
                <div className="mb-1 bg-gray-50 p-3 rounded-lg shadow-inner border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                            {/* Progress percentage with animated number effect */}
                            <span className={`text-lg font-bold ${
                                status === "completed" ? "text-green-600" :
                                    status === "in_progress" ? "text-cyan-600" :
                                        "text-gray-600"
                            }`}>
                                {roundedProgress}%
                            </span>
                            <span className="text-xs text-gray-500 font-medium">hoàn thành</span>
                        </div>

                        {/* Dynamic status indicator */}
                        <div
                            className={`${color} px-2.5 py-1 rounded-full flex items-center gap-1.5 text-xs font-medium shadow-sm border`}>
                            <i className={`fas ${icon}`}></i>
                            {label}
                        </div>
                    </div>

                    {/* Enhanced progress bar */}
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                        <div
                            className={`h-full bg-gradient-to-r ${progressColor} rounded-full transition-all duration-500 ease-out flex items-center justify-center relative`}
                            style={{ width: `${roundedProgress}%` }}
                        >
                            {/* Progress bar shine effect */}
                            <div className="absolute inset-0 overflow-hidden">
                                <div className="absolute top-0 -inset-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent h-full w-1/2"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Grid Container component cho việc hiển thị 4 cards trên một hàng với responsive
export const EnrollmentGrid: React.FC<{ enrollments: Enrollment[] }> = ({ enrollments }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {enrollments.map((enrollment) => (
                <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
            ))}
        </div>
    );
};