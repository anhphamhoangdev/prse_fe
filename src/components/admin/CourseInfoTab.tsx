import React, { RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Book,
    BookOpen,
    Users,
    GraduationCap,
    Globe,
    DollarSign,
    Calendar,
    Clock,
    Eye,
    XCircle,
    RefreshCw
} from 'lucide-react';
import {AdminCourseDetailType} from "../../types/admin";

interface CourseInfoTabProps {
    courseDetail: AdminCourseDetailType;
    descriptionRef: RefObject<HTMLDivElement>;
    isPublish: boolean;
    isSaving: boolean;
    handlePublishToggle: () => Promise<void>;
    navigate: ReturnType<typeof useNavigate>;
}

const CourseInfoTab = ({
                           courseDetail,
                           descriptionRef,
                           isPublish,
                           isSaving,
                           handlePublishToggle,
                           navigate
                       }: CourseInfoTabProps) => {
    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN').format(amount);
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Cột trái: thông tin khóa học */}
            <div className="md:col-span-2">
                {/* Thông tin bán hàng */}
                <SalesInfo
                    courseDetail={courseDetail}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                />

                {/* Mô tả khóa học */}
                <CourseDescription
                    courseDetail={courseDetail}
                    descriptionRef={descriptionRef}
                />

                {/* Thông tin truyền thông */}
                <MediaInfo courseDetail={courseDetail} />
            </div>

            {/* Cột phải: thông tin bổ sung */}
            <div className="md:col-span-1">
                {/* Thông tin giảng viên */}
                <InstructorInfo
                    courseDetail={courseDetail}
                    navigate={navigate}
                />

                {/* Thống kê khóa học */}
                <CourseStats courseDetail={courseDetail} />

                {/* Nút Tắt xuất bản riêng biệt */}
                {isPublish && (
                    <div className="bg-gray-50 p-6 rounded-lg mb-6">
                        <button
                            type="button"
                            onClick={handlePublishToggle}
                            disabled={isSaving}
                            className="w-full py-3 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex justify-center items-center gap-2"
                        >
                            {isSaving ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                                <XCircle className="w-5 h-5" />
                            )}
                            {isSaving ? 'Đang cập nhật...' : 'Tắt xuất bản'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

interface SalesInfoProps {
    courseDetail: AdminCourseDetailType;
    formatCurrency: (amount: number) => string;
    formatDate: (dateString: string) => string;
}

const SalesInfo = ({ courseDetail, formatCurrency, formatDate }: SalesInfoProps) => {
    return (
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Thông tin bán hàng
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border border-gray-100">
                    <div className="flex items-center mb-2">
                        <Globe className="w-5 h-5 text-blue-500 mr-2" />
                        <h3 className="text-sm font-medium text-gray-700">Ngôn ngữ</h3>
                    </div>
                    <p className="text-gray-900">{courseDetail.language === 'Vietnamese' ? 'Tiếng Việt' : courseDetail.language}</p>
                </div>

                <div className="p-4 bg-white rounded-lg border border-gray-100">
                    <div className="flex items-center mb-2">
                        <DollarSign className="w-5 h-5 text-green-500 mr-2" />
                        <h3 className="text-sm font-medium text-gray-700">Giá</h3>
                    </div>
                    <p className="text-gray-900 font-semibold">{formatCurrency(courseDetail.originalPrice)} VNĐ</p>
                </div>

                <div className="p-4 bg-white rounded-lg border border-gray-100">
                    <div className="flex items-center mb-2">
                        <Calendar className="w-5 h-5 text-purple-500 mr-2" />
                        <h3 className="text-sm font-medium text-gray-700">Ngày tạo</h3>
                    </div>
                    <p className="text-gray-900">{formatDate(courseDetail.createdAt)}</p>
                </div>

                <div className="p-4 bg-white rounded-lg border border-gray-100">
                    <div className="flex items-center mb-2">
                        <Calendar className="w-5 h-5 text-orange-500 mr-2" />
                        <h3 className="text-sm font-medium text-gray-700">Cập nhật lần cuối</h3>
                    </div>
                    <p className="text-gray-900">{formatDate(courseDetail.updatedAt)}</p>
                </div>
            </div>
        </div>
    );
};

interface CourseDescriptionProps {
    courseDetail: AdminCourseDetailType;
    descriptionRef: RefObject<HTMLDivElement>;
}

const CourseDescription = ({ courseDetail, descriptionRef }: CourseDescriptionProps) => {
    return (
        <section ref={descriptionRef} id="description"
                 className="transition-all duration-300 hover:shadow-md p-6 rounded-lg bg-gray-50 mb-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-500"/>
                Mô tả khóa học
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700">
                {courseDetail.description ? (
                    <div
                        dangerouslySetInnerHTML={{__html: courseDetail.description}}
                        className="course-content leading-relaxed prose-headings:all-unset prose-p:all-unset"
                    />
                ) : (
                    <p className="text-gray-500 italic">Chưa có mô tả cho khóa học này.</p>
                )}
            </div>
        </section>
    );
};

interface MediaInfoProps {
    courseDetail: AdminCourseDetailType;
}

const MediaInfo = ({ courseDetail }: MediaInfoProps) => {
    return (
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Thông tin truyền thông
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Hình ảnh khóa học</h4>
                    <div className="relative bg-gray-200 rounded-lg overflow-hidden aspect-w-16 aspect-h-9 h-40">
                        <img
                            src={courseDetail.imageUrl}
                            alt={courseDetail.title}
                            className="w-full h-full object-cover"
                            onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/800x450?text=No+Image')}
                        />
                    </div>
                </div>

                {courseDetail.previewVideoUrl && (
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Video giới thiệu</h4>
                        <div className="relative bg-gray-200 rounded-lg overflow-hidden aspect-w-16 aspect-h-9 h-40">
                            <iframe
                                src={courseDetail.previewVideoUrl}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full object-cover"
                            ></iframe>
                        </div>
                        {courseDetail.previewVideoDuration > 0 && (
                            <p className="mt-2 text-sm text-gray-500 flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                Thời lượng: {courseDetail.previewVideoDuration} phút
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

interface InstructorInfoProps {
    courseDetail: AdminCourseDetailType;
    navigate: ReturnType<typeof useNavigate>;
}

const InstructorInfo = ({ courseDetail, navigate }: InstructorInfoProps) => {
    return (
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Thông tin giảng viên
            </h2>

            <div className="flex items-center space-x-4 mb-4">
                <img
                    src={courseDetail.instructorAvatar || 'https://via.placeholder.com/100?text=?'}
                    alt={courseDetail.instructorName}
                    className="h-16 w-16 rounded-full object-cover"
                />
                <div>
                    <h3 className="text-base font-medium text-gray-900">{courseDetail.instructorName}</h3>
                    <p className="text-sm text-gray-500">{courseDetail.instructorTitle}</p>
                </div>
            </div>

            <div className="mt-4">
                <button
                    type="button"
                    onClick={() => navigate(`/admin/instructors/${courseDetail.instructorId}`)}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                    Xem thông tin giảng viên
                </button>
            </div>
        </div>
    );
};

interface CourseStatsProps {
    courseDetail: AdminCourseDetailType;
}

const CourseStats = ({ courseDetail }: CourseStatsProps) => {
    return (
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Thống kê khóa học
            </h2>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Eye className="w-5 h-5 text-gray-500" />
                        <span className="text-sm text-gray-700">Lượt xem:</span>
                    </div>
                    <span className="font-medium">{courseDetail.totalViews}</span>
                </div>
            </div>
        </div>
    );
};

export default CourseInfoTab;