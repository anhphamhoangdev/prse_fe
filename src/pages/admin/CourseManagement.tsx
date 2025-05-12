import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Eye, Edit, Trash, Filter, X, Star, User, CheckCircle, XCircle, TrendingUp, Tag } from 'lucide-react';
import { requestAdminWithAuth } from '../../utils/request';
import { ENDPOINTS } from '../../constants/endpoint';
import { useNavigate } from 'react-router-dom';

// Định nghĩa kiểu dữ liệu cho khóa học
interface CourseData {
    id: number;
    title: string;
    shortDescription: string;
    imageUrl: string;
    originalPrice: number;
    averageRating: number;
    totalStudents: number;
    totalViews: number;
    isPublish: boolean;
    isHot: boolean;
    isDiscount: boolean;
    createdAt: string;
    updatedAt: string;
    instructorId: number;
    instructorName: string;
    instructorAvatar: string;
}

interface ApiResponse {
    content: CourseData[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

const CourseManagement = () => {
    const navigate = useNavigate();

    // State management
    const [courses, setCourses] = useState<CourseData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [isHotFilter, setIsHotFilter] = useState<boolean | null>(null);
    const [isPublishFilter, setIsPublishFilter] = useState<boolean | null>(null);
    const [isDiscountFilter, setIsDiscountFilter] = useState<boolean | null>(null);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortDir, setSortDir] = useState('desc');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<CourseData | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState<CourseData | null>(null);

    // Fetch courses from API
    const fetchCourses = async () => {
        setLoading(true);
        try {
            // Xây dựng URL với các tham số truy vấn
            let url = `${ENDPOINTS.ADMIN.COURSES}?page=${currentPage}&size=${pageSize}&sortBy=${sortBy}&sortDir=${sortDir}`;

            // Thêm các tham số lọc nếu có
            if (searchTerm) {
                url += `&keyword=${encodeURIComponent(searchTerm)}`;
            }

            if (isHotFilter !== null) {
                url += `&isHot=${isHotFilter}`;
            }

            if (isPublishFilter !== null) {
                url += `&isPublish=${isPublishFilter}`;
            }

            if (isDiscountFilter !== null) {
                url += `&isDiscount=${isDiscountFilter}`;
            }

            const response = await requestAdminWithAuth<ApiResponse>(url);

            if (response) {
                setCourses(response.content);
                setTotalPages(response.totalPages);
                setTotalElements(response.totalElements);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu khóa học');
        } finally {
            setLoading(false);
        }
    };

    // Load data on initial render and when filters change
    useEffect(() => {
        fetchCourses();
    }, [currentPage, pageSize]);

    // Handle page change
    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    // Open course detail modal
    const openDetailModal = (course: CourseData) => {
        setSelectedCourse(course);
        setIsModalOpen(true);
    };

    // Close modal
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCourse(null);
    };

    // Open delete confirmation modal
    const openDeleteModal = (course: CourseData) => {
        setCourseToDelete(course);
        setIsDeleteModalOpen(true);
    };

    // Close delete modal
    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setCourseToDelete(null);
    };



    // Apply filters and refresh data
    const applyFilters = () => {
        setCurrentPage(0); // Reset to first page when applying filters
        fetchCourses();
    };

    // Clear filters
    const clearFilters = () => {
        setSearchTerm('');
        setIsHotFilter(null);
        setIsPublishFilter(null);
        setIsDiscountFilter(null);
        setSortBy('createdAt');
        setSortDir('desc');
        setCurrentPage(0);
        // Fetch will be triggered by the useEffect
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

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN').format(amount);
    };

    // Format rating
    const formatRating = (rating: number) => {
        return rating.toFixed(1);
    };

    function goToCourseDetail(id: number) {
        navigate(`/admin/courses/${id}`);
    }

    return (
        <div className="container mx-auto p-6">
            {/* Main content */}
            <div className="bg-white shadow-lg rounded-lg p-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Quản lý khóa học</h1>
                    <button
                        onClick={() => navigate('/admin/courses/create')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        Thêm khóa học mới
                    </button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="col-span-1 md:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Tìm kiếm theo tên khóa học..."
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>
                    </div>
                    <div>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full p-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        >
                            <option value="createdAt">Sắp xếp theo: Ngày tạo</option>
                            <option value="title">Sắp xếp theo: Tên</option>
                            <option value="totalStudents">Sắp xếp theo: Học viên</option>
                            <option value="averageRating">Sắp xếp theo: Đánh giá</option>
                            <option value="originalPrice">Sắp xếp theo: Giá</option>
                        </select>
                    </div>
                    <div>
                        <select
                            value={sortDir}
                            onChange={(e) => setSortDir(e.target.value)}
                            className="w-full p-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        >
                            <option value="desc">Giảm dần</option>
                            <option value="asc">Tăng dần</option>
                        </select>
                    </div>
                </div>

                {/* Status filters */}
                <div className="flex flex-wrap gap-4 mb-8">
                    <div className="flex items-center">
                        <span className="mr-2 text-sm font-medium text-gray-700">Trạng thái xuất bản:</span>
                        <select
                            value={isPublishFilter === null ? 'all' : isPublishFilter ? 'true' : 'false'}
                            onChange={(e) => {
                                const value = e.target.value;
                                setIsPublishFilter(value === 'all' ? null : value === 'true');
                            }}
                            className="p-2 bg-gray-50 rounded-lg text-sm"
                        >
                            <option value="all">Tất cả</option>
                            <option value="true">Đã xuất bản</option>
                            <option value="false">Chưa xuất bản</option>
                        </select>
                    </div>
                    <div className="flex items-center">
                        <span className="mr-2 text-sm font-medium text-gray-700">Khóa học nổi bật:</span>
                        <select
                            value={isHotFilter === null ? 'all' : isHotFilter ? 'true' : 'false'}
                            onChange={(e) => {
                                const value = e.target.value;
                                setIsHotFilter(value === 'all' ? null : value === 'true');
                            }}
                            className="p-2 bg-gray-50 rounded-lg text-sm"
                        >
                            <option value="all">Tất cả</option>
                            <option value="true">Nổi bật</option>
                            <option value="false">Không nổi bật</option>
                        </select>
                    </div>
                    <div className="flex items-center">
                        <span className="mr-2 text-sm font-medium text-gray-700">Đang giảm giá:</span>
                        <select
                            value={isDiscountFilter === null ? 'all' : isDiscountFilter ? 'true' : 'false'}
                            onChange={(e) => {
                                const value = e.target.value;
                                setIsDiscountFilter(value === 'all' ? null : value === 'true');
                            }}
                            className="p-2 bg-gray-50 rounded-lg text-sm"
                        >
                            <option value="all">Tất cả</option>
                            <option value="true">Đang giảm giá</option>
                            <option value="false">Không giảm giá</option>
                        </select>
                    </div>
                    <div className="flex gap-2 ml-auto">
                        <button
                            onClick={applyFilters}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Filter className="w-4 h-4" />
                            Lọc
                        </button>
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            Xóa bộ lọc
                        </button>
                    </div>
                </div>

                {/* Courses Table */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : error ? (
                    <div className="text-red-600 text-center py-8">{error}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Khóa học
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Giảng viên
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Giá
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Học viên
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ngày tạo
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Hành động
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {courses.map((course) => (
                                <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        #{course.id}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        <div className="flex items-center">
                                            <div
                                                className="h-24 w-40 rounded-md overflow-hidden mr-3 flex-shrink-0 cursor-pointer"
                                                onClick={() => goToCourseDetail(course.id)}
                                            >
                                                <img
                                                    src={course.imageUrl || 'https://via.placeholder.com/160x90'}
                                                    alt={course.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                {/* Tên khóa học có thể click */}
                                                <div
                                                    className="font-extrabold cursor-pointer hover:text-blue-600 hover:underline"
                                                    onClick={() => goToCourseDetail(course.id)}
                                                >
                                                    {course.title}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1 flex items-center">
                                                    <Star className="w-3 h-3 text-yellow-500 mr-1" />
                                                    {formatRating(course.averageRating)}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex items-center">
                                            {course.instructorAvatar ? (
                                                <img
                                                    src={course.instructorAvatar}
                                                    alt={course.instructorName}
                                                    className="h-6 w-6 rounded-full mr-2"
                                                />
                                            ) : (
                                                <User className="h-6 w-6 text-gray-400 mr-2" />
                                            )}
                                            <button
                                                onClick={() => navigate(`/admin/instructor/${course.instructorId}`)}
                                                className="text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                {course.instructorName || `ID: ${course.instructorId}`}
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatCurrency(course.originalPrice)} VNĐ
                                        {course.isDiscount && (
                                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    <Tag className="w-3 h-3 mr-1" />
                                                    Giảm giá
                                                </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex items-center">
                                            <User className="w-4 h-4 text-gray-400 mr-1" />
                                            {course.totalStudents}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex flex-col gap-1">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    course.isPublish ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {course.isPublish ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                                                    {course.isPublish ? 'Đã xuất bản' : 'Chưa xuất bản'}
                                                </span>

                                            {course.isHot && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                        <TrendingUp className="w-3 h-3 mr-1" />
                                                        Nổi bật
                                                    </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDate(course.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => openDetailModal(course)}
                                                className="text-blue-600 hover:text-blue-800 p-1"
                                                title="Xem chi tiết"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => navigate(`/admin/courses/${course.id}`)}
                                                className="text-amber-600 hover:text-amber-800 p-1"
                                                title="Chỉnh sửa"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {totalPages > 0 && (
                            <div className="flex justify-between items-center mt-6">
                                <div className="text-sm text-gray-700">
                                    Hiển thị {courses.length} trên tổng số {totalElements} khóa học
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 0}
                                        className={`px-4 py-2 rounded ${
                                            currentPage === 0
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    >
                                        Trước
                                    </button>
                                    {totalPages <= 5
                                        ? [...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handlePageChange(i)}
                                                className={`px-4 py-2 rounded ${
                                                    currentPage === i
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))
                                        : [
                                            // Hiển thị nút trang đầu
                                            <button
                                                key="first"
                                                onClick={() => handlePageChange(0)}
                                                className={`px-4 py-2 rounded ${
                                                    currentPage === 0
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                            >
                                                1
                                            </button>,

                                            // Nút "..." nếu trang hiện tại > 2
                                            currentPage > 2 &&
                                            <button
                                                key="ellipsis1"
                                                className="px-4 py-2 rounded bg-gray-100 text-gray-400"
                                                disabled
                                            >
                                                ...
                                            </button>,

                                            // Trang trước trang hiện tại nếu có
                                            currentPage > 1 &&
                                            <button
                                                key={currentPage - 1}
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                                            >
                                                {currentPage}
                                            </button>,

                                            // Trang hiện tại (trừ khi đó là trang đầu hoặc cuối)
                                            currentPage !== 0 && currentPage !== totalPages - 1 &&
                                            <button
                                                key={currentPage}
                                                onClick={() => handlePageChange(currentPage)}
                                                className="px-4 py-2 rounded bg-blue-600 text-white"
                                            >
                                                {currentPage + 1}
                                            </button>,

                                            // Trang sau trang hiện tại nếu có
                                            currentPage < totalPages - 2 &&
                                            <button
                                                key={currentPage + 1}
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                                            >
                                                {currentPage + 2}
                                            </button>,

                                            // Nút "..." nếu trang hiện tại < totalPages - 3
                                            currentPage < totalPages - 3 &&
                                            <button
                                                key="ellipsis2"
                                                className="px-4 py-2 rounded bg-gray-100 text-gray-400"
                                                disabled
                                            >
                                                ...
                                            </button>,

                                            // Hiển thị nút trang cuối
                                            <button
                                                key="last"
                                                onClick={() => handlePageChange(totalPages - 1)}
                                                className={`px-4 py-2 rounded ${
                                                    currentPage === totalPages - 1
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                            >
                                                {totalPages}
                                            </button>
                                        ].filter(Boolean) // Lọc bỏ các phần tử null/undefined
                                    }
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages - 1}
                                        className={`px-4 py-2 rounded ${
                                            currentPage === totalPages - 1
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    >
                                        Sau
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal for viewing course details */}
            {isModalOpen && selectedCourse && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 overflow-hidden transform transition-all duration-300 scale-100 animate-in">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    Chi tiết khóa học
                                </h2>
                                <div className="flex items-center gap-2">
                                    {selectedCourse.isHot && (
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-500 text-white">
                                            <TrendingUp className="w-3 h-3 mr-1" />
                                            Nổi bật
                                        </span>
                                    )}
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                        selectedCourse.isPublish ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                                    }`}>
                                        {selectedCourse.isPublish ? 'Đã xuất bản' : 'Chưa xuất bản'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 max-h-[70vh] overflow-y-auto">
                            <div className="space-y-6">
                                {/* Course preview */}
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="md:w-1/3">
                                        <img
                                            src={selectedCourse.imageUrl || 'https://via.placeholder.com/300x200'}
                                            alt={selectedCourse.title}
                                            className="w-full h-auto rounded-lg object-cover aspect-video"
                                        />
                                    </div>
                                    <div className="md:w-2/3">
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedCourse.title}</h3>
                                        <p className="text-gray-600 mb-4">{selectedCourse.shortDescription}</p>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                                                    <User className="w-4 h-4" />
                                                    <span>{selectedCourse.totalStudents} học viên</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                                                    <Star className="w-4 h-4 text-yellow-500" />
                                                    <span>{formatRating(selectedCourse.averageRating)} điểm đánh giá</span>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                                                    <span className="font-medium">Giá:</span>
                                                    <span className="text-blue-600 font-medium">{formatCurrency(selectedCourse.originalPrice)} VNĐ</span>
                                                    {selectedCourse.isDiscount && (
                                                        <span className="inline-block ml-2 px-2 py-0.5 rounded text-xs bg-red-100 text-red-800">
                                                            Giảm giá
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                                                    <span className="font-medium">Ngày tạo:</span>
                                                    <span>{formatDate(selectedCourse.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <h4 className="font-medium text-gray-700 mb-2">Thông tin giảng viên:</h4>
                                            <div className="flex items-center">
                                                {selectedCourse.instructorAvatar ? (
                                                    <img
                                                        src={selectedCourse.instructorAvatar}
                                                        alt={selectedCourse.instructorName}
                                                        className="h-10 w-10 rounded-full mr-3"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                                        <User className="h-6 w-6 text-gray-500" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium">{selectedCourse.instructorName}</div>
                                                    <button
                                                        onClick={() => {
                                                            closeModal();
                                                            navigate(`/admin/instructor/${selectedCourse.instructorId}`);
                                                        }}
                                                        className="text-sm text-blue-600 hover:underline"
                                                    >
                                                        Xem thông tin giảng viên
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Course stats */}
                                <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                                    <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                                        <h3 className="font-semibold text-gray-800">Thông số chi tiết</h3>
                                    </div>
                                    <div className="p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                                <div className="text-sm text-gray-500 mb-1">Học viên</div>
                                                <div className="text-2xl font-bold text-gray-900">{selectedCourse.totalStudents}</div>
                                            </div>
                                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                                <div className="text-sm text-gray-500 mb-1">Lượt xem</div>
                                                <div className="text-2xl font-bold text-gray-900">{selectedCourse.totalViews}</div>
                                            </div>
                                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                                <div className="text-sm text-gray-500 mb-1">Đánh giá trung bình</div>
                                                <div className="text-2xl font-bold text-gray-900 flex items-center">
                                                    {formatRating(selectedCourse.averageRating)}
                                                    <Star className="w-5 h-5 text-yellow-500 ml-1" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Status indicators */}
                                <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                                    <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                                        <h3 className="font-semibold text-gray-800">Trạng thái khóa học</h3>
                                    </div>
                                    <div className="p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className={`p-4 rounded-lg border ${selectedCourse.isPublish ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                                <div className="flex items-center">
                                                    {selectedCourse.isPublish ? (
                                                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                                                    ) : (
                                                        <XCircle className="w-5 h-5 text-gray-500 mr-2" />
                                                    )}
                                                    <div>
                                                        <div className="font-medium">{selectedCourse.isPublish ? 'Đã xuất bản' : 'Chưa xuất bản'}</div>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {selectedCourse.isPublish ? 'Khóa học đang hiển thị cho học viên' : 'Khóa học chưa được hiển thị'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`p-4 rounded-lg border ${selectedCourse.isHot ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
                                                <div className="flex items-center">
                                                    {selectedCourse.isHot ? (
                                                        <TrendingUp className="w-5 h-5 text-orange-500 mr-2" />
                                                    ) : (
                                                        <TrendingUp className="w-5 h-5 text-gray-400 mr-2" />
                                                    )}
                                                    <div>
                                                        <div className="font-medium">{selectedCourse.isHot ? 'Khóa học nổi bật' : 'Không nổi bật'}</div>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {selectedCourse.isHot ? 'Hiển thị trong danh sách nổi bật' : 'Không hiển thị trong danh sách nổi bật'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`p-4 rounded-lg border ${selectedCourse.isDiscount ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                                                <div className="flex items-center">
                                                    {selectedCourse.isDiscount ? (
                                                        <Tag className="w-5 h-5 text-red-500 mr-2" />
                                                    ) : (
                                                        <Tag className="w-5 h-5 text-gray-400 mr-2" />
                                                    )}
                                                    <div>
                                                        <div className="font-medium">{selectedCourse.isDiscount ? 'Đang giảm giá' : 'Không giảm giá'}</div>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {selectedCourse.isDiscount ? 'Áp dụng giảm giá cho khóa học này' : 'Không áp dụng giảm giá'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal footer with action buttons */}
                        <div className="bg-gray-50 p-6 border-t border-gray-100 flex justify-end gap-4">
                            <button
                                onClick={() => navigate(`/admin/courses/${selectedCourse.id}/edit`)}
                                className="px-6 py-2.5 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-300 flex items-center gap-2"
                            >
                                <Edit className="w-4 h-4" />
                                Chỉnh sửa
                            </button>
                            <button
                                onClick={closeModal}
                                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default CourseManagement;