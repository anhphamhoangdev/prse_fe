// tabs/StudentsTab.tsx
import React, { useState, useEffect } from 'react';
import {
    RefreshCw,
    Search,
    ChevronLeft,
    ChevronRight,
    ToggleLeft,
    ToggleRight
} from 'lucide-react';
import { putAdminWithAuth, requestAdminWithAuth } from "../../utils/request";
import { ENDPOINTS } from "../../constants/endpoint";
import {useNavigate} from "react-router-dom";

// Types for student and enrollment
interface Enrollment {
    id: number;
    studentId: number;
    courseId: number;
    paymentLogId: number;
    enrolledAt: string;
    status: 'completed' | 'in_progress' | 'not_started';
    progressPercent: number | null;
    completedAt: string | null;
    isRating: boolean;
    rating: number | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    student_id: number;
    fullName: string;
    email: string;
    avatarUrl: string;
}

// API Response interface
interface ApiResponse {
    enrollments: Enrollment[];
    totalElements: number;
}

interface StudentsTabProps {
    courseId: string;
    setSuccessMessage: (message: string | null) => void;
    setError: (error: string | null) => void;
}

const StudentsTab = ({ courseId, setSuccessMessage, setError }: StudentsTabProps) => {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setErrorLocal] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredEnrollments, setFilteredEnrollments] = useState<Enrollment[]>([]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    // Status updating
    const [updatingEnrollmentId, setUpdatingEnrollmentId] = useState<number | null>(null);


    const navigate = useNavigate();
    useEffect(() => {
        fetchEnrollments();
    }, [courseId]);

    useEffect(() => {
        // Filter enrollments based on search term
        const filtered = enrollments.filter(enrollment =>
            enrollment.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            enrollment.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredEnrollments(filtered);
        setTotalPages(Math.ceil(filtered.length / itemsPerPage));
        setCurrentPage(1); // Reset to first page on new search
    }, [searchTerm, enrollments, itemsPerPage]);

    const fetchEnrollments = async () => {
        if (!courseId) return;

        setLoading(true);
        setErrorLocal(null);

        try {
            // API call to get enrollments for the course
            const response = await requestAdminWithAuth<ApiResponse>(`${ENDPOINTS.ADMIN.COURSES}/${courseId}/enrollments`);

            if (response && response.enrollments) {
                setEnrollments(response.enrollments);
                setFilteredEnrollments(response.enrollments);
                setTotalPages(Math.ceil(response.enrollments.length / itemsPerPage));
            } else {
                setErrorLocal('Không thể tải danh sách học viên');
            }
        } catch (err) {
            setErrorLocal(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải danh sách học viên');
            setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải danh sách học viên');
        } finally {
            setLoading(false);
        }
    };

    const toggleEnrollmentActive = async (enrollmentId: number, currentActive: boolean) => {
        setUpdatingEnrollmentId(enrollmentId);

        try {
            await putAdminWithAuth(`${ENDPOINTS.ADMIN.COURSES}/enrollments/${enrollmentId}/toggle-active`, {
                isActive: !currentActive
            });

            // Update local state
            const updatedEnrollments = enrollments.map(enrollment => {
                if (enrollment.id === enrollmentId) {
                    return { ...enrollment, isActive: !currentActive };
                }
                return enrollment;
            });

            setEnrollments(updatedEnrollments);
            setSuccessMessage(`Đã ${!currentActive ? 'kích hoạt' : 'hủy kích hoạt'} đăng ký thành công`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi cập nhật trạng thái kích hoạt');
        } finally {
            setUpdatingEnrollmentId(null);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Calculate current items to display
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredEnrollments.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="bg-gray-50 rounded-lg p-6">
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            ) : error ? (
                <div>
                    <div className="text-red-600 text-center py-8">{error}</div>
                    <div className="flex justify-center">
                        <button
                            onClick={fetchEnrollments}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Thử lại
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    {/* Header and search */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Danh sách học viên đã đăng ký ({enrollments.length})
                        </h2>
                        <div className="relative w-full md:w-64">
                            <input
                                type="text"
                                placeholder="Tìm kiếm học viên..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        </div>
                    </div>

                    {/* Students table */}
                    {currentItems.length === 0 ? (
                        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                            <p>Chưa có học viên nào đăng ký khóa học này.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                        Học viên
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Email
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Ngày tham gia
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">
                                        Trạng thái kích hoạt
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                {currentItems.map((enrollment) => (
                                    <tr key={enrollment.id} className={!enrollment.isActive ? 'bg-gray-50' : ''}>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    <img
                                                        className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
                                                        src={enrollment.avatarUrl || 'https://via.placeholder.com/100?text=?'}
                                                        alt={enrollment.fullName}
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div
                                                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors flex items-center"
                                                        onClick={() => navigate(`/admin/student/${enrollment.student_id}`)}
                                                    >
                                                        {enrollment.fullName}
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                    </div>
                                                    <div className="text-gray-500 text-xs mt-0.5">ID: {enrollment.studentId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            {enrollment.email}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            {formatDate(enrollment.enrolledAt)}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                                            {updatingEnrollmentId === enrollment.id ? (
                                                <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
                                            ) : (
                                                <button
                                                    onClick={() => toggleEnrollmentActive(enrollment.id, enrollment.isActive)}
                                                    className="focus:outline-none inline-flex items-center px-4 py-2 rounded-full transition-colors"
                                                >
                                                    {enrollment.isActive ? (
                                                        <div className="flex items-center bg-green-100 text-green-800 px-3 py-1.5 rounded-full">
                                                            <ToggleRight className="w-7 h-7 text-green-600 mr-2" />
                                                            <span className="font-medium">Đang kích hoạt</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full">
                                                            <ToggleLeft className="w-7 h-7 text-gray-500 mr-2" />
                                                            <span className="font-medium">Đã vô hiệu</span>
                                                        </div>
                                                    )}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {filteredEnrollments.length > 0 && (
                        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-lg">
                            <div className="flex flex-1 justify-between sm:hidden">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                                        currentPage === 1
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    Trước
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                                        currentPage === totalPages
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    Sau
                                </button>
                            </div>
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Hiển thị <span className="font-medium">{indexOfFirstItem + 1}</span> đến{' '}
                                        <span className="font-medium">
                                            {indexOfLastItem > filteredEnrollments.length ? filteredEnrollments.length : indexOfLastItem}
                                        </span>{' '}
                                        trong tổng số <span className="font-medium">{filteredEnrollments.length}</span> học viên
                                    </p>
                                </div>
                                <div>
                                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ${
                                                currentPage === 1
                                                    ? 'cursor-not-allowed'
                                                    : 'hover:bg-gray-50 text-gray-500'
                                            }`}
                                        >
                                            <span className="sr-only">Trước</span>
                                            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                                        </button>

                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => handlePageChange(page)}
                                                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                                    currentPage === page
                                                        ? 'z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                                                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}

                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ${
                                                currentPage === totalPages
                                                    ? 'cursor-not-allowed'
                                                    : 'hover:bg-gray-50 text-gray-500'
                                            }`}
                                        >
                                            <span className="sr-only">Sau</span>
                                            <ChevronRight className="h-5 w-5" aria-hidden="true" />
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StudentsTab;