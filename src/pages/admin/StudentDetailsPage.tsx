import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Loader2, Award, Calendar, Phone, Mail, User,
    Clock, Briefcase, DollarSign, BookOpen, Users, Activity,
    Search, ChevronUp, ChevronDown
} from 'lucide-react';
import { putAdminWithAuth, requestAdminWithAuth } from '../../utils/request';
import { ENDPOINTS } from '../../constants/endpoint';

// Enhanced interfaces for type safety
interface Student {
    id: number;
    username: string;
    email: string;
    fullName: string;
    phoneNumber: string;
    dateOfBirth: string;
    gender: string;
    avatarUrl: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface Instructor {
    id: number;
    fullName: string;
    avatarUrl: string;
    title: string;
    fee: number;
    totalCourse: number;
    totalStudent: number;
    money: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface EnrolledCourse {
    courseId: number;
    title: string;
    imageUrl: string;
    enrolledAt: string;
    progressPercent: number | null;
    isActive: boolean;
    status: string;
    ratingStart: number | null;
    rating: boolean;
}

interface StudentDetailsResponse {
    studentProfile: {
        student: Student;
        instructor: Instructor | null;
        enrolledCourses: EnrolledCourse[];
        totalSpent: number;
    };
}

// Utility functions
const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

// Render stars based on ratingStart
const renderStars = (ratingStart: number | null): React.ReactNode => {
    if (!ratingStart) return 'Chưa đánh giá';

    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, index) => (
                <span
                    key={index}
                    className={`text-lg ${index < ratingStart ? 'text-yellow-500' : 'text-gray-300'}`}
                >
          ★
        </span>
            ))}
        </div>
    );
};

// InfoItem component with improved design
const InfoItem = ({ icon, label, value, themeColor = "blue" }: {
    icon: React.ReactNode;
    label: string;
    value: string | number | React.ReactNode;
    themeColor?: "blue" | "purple" | "green" | "amber";
}) => {
    const colorMap = {
        blue: "text-blue-600",
        purple: "text-purple-600",
        green: "text-green-600",
        amber: "text-amber-600"
    };

    return (
        <div className="flex items-center gap-4 py-4 px-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
            <div className={`p-3 rounded-full bg-${themeColor}-100`}>
                {React.cloneElement(icon as React.ReactElement, { className: `w-6 h-6 ${colorMap[themeColor]}` })}
            </div>
            <div>
                <span className="text-gray-500 text-sm font-medium">{label}</span>
                <div className="font-bold text-gray-800 text-lg">{value}</div>
            </div>
        </div>
    );
};

// Badge component for status indicators
const StatusBadge = ({ active, large = false }: { active: boolean; large?: boolean }) => {
    const baseClasses = "inline-flex items-center font-semibold rounded-full";
    const sizeClasses = large ? "px-4 py-1.5 text-sm" : "px-3 py-1 text-xs";
    const colorClasses = active
        ? "bg-green-100 text-green-800"
        : "bg-red-100 text-red-800";

    return (
        <span className={`${baseClasses} ${sizeClasses} ${colorClasses}`}>
      {active ? 'Hoạt động' : 'Không hoạt động'}
    </span>
    );
};

// Sort button component
const SortButton = ({
                        label,
                        active,
                        direction,
                        onClick
                    }: {
    label: string;
    active: boolean;
    direction: 'asc' | 'desc';
    onClick: () => void;
}) => (
    <button
        className={`flex items-center gap-1 px-2 py-1 rounded ${active ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
        onClick={onClick}
    >
        {label}
        {active && (direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
    </button>
);

const StudentDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [details, setDetails] = useState<StudentDetailsResponse['studentProfile'] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('info');
    const [isToggling, setIsToggling] = useState(false);

    // Search and sorting states
    const [courseSearch, setCourseSearch] = useState('');
    const [courseSorting, setCourseSorting] = useState<{field: 'title' | 'enrolledAt' | 'progressPercent', direction: 'asc' | 'desc'}>({
        field: 'enrolledAt',
        direction: 'desc'
    });

    // Fetch student details
    useEffect(() => {
        const fetchStudentDetails = async () => {
            setLoading(true);
            try {
                if (!id) {
                    throw new Error('ID học viên không hợp lệ');
                }
                // Fetch student details using admin auth
                const response = await requestAdminWithAuth<StudentDetailsResponse>(`/admin/student/${id}`);
                setDetails(response.studentProfile);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi lấy thông tin học viên');
            } finally {
                setLoading(false);
            }
        };

        fetchStudentDetails();
    }, [id]);

    // Toggle student active status
    const toggleStudentActive = async () => {
        if (!details || !id || isToggling) return;
        setIsToggling(true);
        try {
            await putAdminWithAuth(`${ENDPOINTS.ADMIN.STUDENTS}/${id}/toggle-status`, {});
            setDetails({
                ...details,
                student: { ...details.student, isActive: !details.student.isActive },
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi cập nhật trạng thái');
        } finally {
            setIsToggling(false);
        }
    };

    // Filter courses based on search
    const filteredCourses = details?.enrolledCourses.filter(course =>
        course.title.toLowerCase().includes(courseSearch.toLowerCase())
    ) || [];

    // Sort courses
    const sortedCourses = [...filteredCourses].sort((a, b) => {
        switch (courseSorting.field) {
            case 'title':
                return courseSorting.direction === 'asc'
                    ? a.title.localeCompare(b.title)
                    : b.title.localeCompare(a.title);
            case 'enrolledAt':
                return courseSorting.direction === 'asc'
                    ? new Date(a.enrolledAt).getTime() - new Date(b.enrolledAt).getTime()
                    : new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime();
            case 'progressPercent':
                const aProgress = a.progressPercent || 0;
                const bProgress = b.progressPercent || 0;
                return courseSorting.direction === 'asc'
                    ? aProgress - bProgress
                    : bProgress - aProgress;
            default:
                return 0;
        }
    });

    // Toggle sort for courses
    const toggleCourseSort = (field: 'title' | 'enrolledAt' | 'progressPercent') => {
        if (courseSorting.field === field) {
            setCourseSorting({
                field,
                direction: courseSorting.direction === 'asc' ? 'desc' : 'asc'
            });
        } else {
            setCourseSorting({
                field,
                direction: 'asc'
            });
        }
    };

    // Calculate account age
    const calculateAccountAge = (createdAt: string): number => {
        return Math.floor((new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-10 rounded-2xl shadow-2xl flex flex-col items-center">
                    <Loader2 className="h-14 w-14 animate-spin text-blue-700 mb-4" />
                    <p className="text-gray-600 font-semibold text-lg">Đang tải thông tin học viên...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-10 rounded-2xl shadow-2xl text-center max-w-md">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-red-500 text-3xl font-bold">!</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-3">Đã xảy ra lỗi</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/admin/students')}
                        className="px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors shadow-md font-semibold"
                    >
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    // Not found state
    if (!details) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-10 rounded-2xl shadow-2xl text-center max-w-md">
                    <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="h-10 w-10 text-yellow-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-3">Không tìm thấy học viên</h2>
                    <p className="text-gray-600 mb-6">Người dùng bạn đang tìm kiếm không tồn tại trong hệ thống.</p>
                    <button
                        onClick={() => navigate('/admin/students')}
                        className="px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors shadow-md font-semibold"
                    >
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    const { student, instructor, enrolledCourses, totalSpent } = details;

    // Calculate stats
    const accountAge = calculateAccountAge(student.createdAt);
    const coursesInProgress = enrolledCourses.filter(c => c.progressPercent && c.progressPercent < 100).length;
    const coursesCompleted = enrolledCourses.filter(c => c.progressPercent === 100).length;

    return (
        <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/admin/students')}
                    className="flex items-center gap-2 text-blue-700 hover:text-blue-900 mb-6 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 font-semibold text-base"
                >
                    <ArrowLeft className="h-5 w-5" />
                    <span>Quay lại danh sách học viên</span>
                </button>

                {/* Profile Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-xl mb-8 overflow-hidden text-gray-800 border border-blue-200">
                    <div className="p-8">
                        <div className="flex flex-col md:flex-row md:items-center md:space-x-8">
                            <div className="w-40 h-40 rounded-full border-4 border-white overflow-hidden shadow-lg bg-white flex-shrink-0 transition-transform duration-300 hover:scale-105 mx-auto md:mx-0">
                                {student.avatarUrl ? (
                                    <img
                                        src={student.avatarUrl}
                                        alt={student.fullName}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-5xl">
                                        {student.fullName.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="mt-6 md:mt-0 flex-grow text-center md:text-left">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <h1 className="text-4xl font-extrabold text-gray-900 mb-1">{student.fullName}</h1>
                                        <p className="text-lg text-gray-600 mb-3">@{student.username}</p>
                                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                            <Mail className="w-5 h-5 text-gray-500" />
                                            <span className="text-gray-600">{student.email}</span>
                                        </div>
                                        <div className="flex items-center justify-center md:justify-start gap-2">
                                            <Phone className="w-5 h-5 text-gray-500" />
                                            <span className="text-gray-600">{student.phoneNumber}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 md:mt-0 flex flex-col md:items-end gap-3">
                                        <StatusBadge active={student.isActive} large />
                                        <div className="relative inline-flex items-center w-12 h-6">
                                            <input
                                                type="checkbox"
                                                checked={student.isActive}
                                                onChange={toggleStudentActive}
                                                disabled={isToggling}
                                                className="opacity-0 w-0 h-0 absolute"
                                                id="status-toggle"
                                                aria-label={`Bật/tắt trạng thái hoạt động cho ${student.fullName}`}
                                                aria-checked={student.isActive}
                                            />
                                            <label
                                                htmlFor="status-toggle"
                                                className={`block w-12 h-6 rounded-full cursor-pointer transition-colors duration-200 ${
                                                    student.isActive ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-400'
                                                } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                        <span
                            className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md flex items-center justify-center transition-transform duration-300 ease-in-out ${
                                student.isActive ? 'translate-x-6' : 'translate-x-0'
                            }`}
                        >
                          {isToggling && <Loader2 className="w-3 h-3 animate-spin text-gray-600" />}
                        </span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4 border-l-4 border-blue-500 hover:shadow-lg transition-all duration-300">
                        <div className="rounded-full bg-blue-100 p-3 flex-shrink-0">
                            <Calendar className="h-6 w-6 text-blue-700" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Thời gian thành viên</p>
                            <p className="text-2xl font-bold text-gray-800">{accountAge} ngày</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4 border-l-4 border-purple-500 hover:shadow-lg transition-all duration-300">
                        <div className="rounded-full bg-purple-100 p-3 flex-shrink-0">
                            <BookOpen className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Số khóa học</p>
                            <p className="text-2xl font-bold text-gray-800">{enrolledCourses.length}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4 border-l-4 border-green-500 hover:shadow-lg transition-all duration-300">
                        <div className="rounded-full bg-green-100 p-3 flex-shrink-0">
                            <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Tổng chi tiêu</p>
                            <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalSpent)}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4 border-l-4 border-amber-500 hover:shadow-lg transition-all duration-300">
                        <div className="rounded-full bg-amber-100 p-3 flex-shrink-0">
                            <Activity className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Tiến độ học tập</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {coursesCompleted}/{enrolledCourses.length} hoàn thành
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 border">
                    <div className="flex flex-wrap border-b bg-gray-50">
                        <button
                            className={`px-6 py-4 font-semibold text-base flex items-center gap-2 transition-all duration-200 ${
                                activeTab === 'info' ? 'text-blue-700 border-b-4 border-blue-700 bg-white' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                            }`}
                            onClick={() => setActiveTab('info')}
                            aria-selected={activeTab === 'info'}
                            role="tab"
                        >
                            <User className="w-5 h-5" />
                            <span className="hidden sm:inline">Thông tin cá nhân</span>
                            <span className="sm:hidden">Thông tin</span>
                        </button>
                        <button
                            className={`px-6 py-4 font-semibold text-base flex items-center gap-2 transition-all duration-200 ${
                                activeTab === 'instructor' ? 'text-blue-700 border-b-4 border-blue-700 bg-white' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                            }`}
                            onClick={() => setActiveTab('instructor')}
                            aria-selected={activeTab === 'instructor'}
                            role="tab"
                        >
                            <Award className="w-5 h-5" />
                            <span className="hidden sm:inline">Thông tin giảng viên</span>
                            <span className="sm:hidden">Giảng viên</span>
                            {instructor && <span className="ml-1 bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">Có</span>}
                        </button>
                        <button
                            className={`px-6 py-4 font-semibold text-base flex items-center gap-2 transition-all duration-200 ${
                                activeTab === 'courses' ? 'text-blue-700 border-b-4 border-blue-700 bg-white' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                            }`}
                            onClick={() => setActiveTab('courses')}
                            aria-selected={activeTab === 'courses'}
                            role="tab"
                        >
                            <BookOpen className="w-5 h-5" />
                            <span className="hidden sm:inline">Khóa học đang tham gia</span>
                            <span className="sm:hidden">Khóa học</span>
                            <span className="ml-1 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{enrolledCourses.length}</span>
                        </button>
                    </div>

                    <div className="p-6">
                        {/* Personal Info Tab */}
                        {activeTab === 'info' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                        <User className="mr-2 text-blue-600" />
                                        Thông tin cá nhân
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        <InfoItem
                                            icon={<User />}
                                            label="Họ và tên"
                                            value={student.fullName}
                                            themeColor="blue"
                                        />
                                        <InfoItem
                                            icon={<Mail />}
                                            label="Email"
                                            value={student.email}
                                            themeColor="blue"
                                        />
                                        <InfoItem
                                            icon={<Phone />}
                                            label="Số điện thoại"
                                            value={student.phoneNumber}
                                            themeColor="blue"
                                        />
                                        <InfoItem
                                            icon={<Calendar />}
                                            label="Ngày sinh"
                                            value={formatDate(student.dateOfBirth)}
                                            themeColor="blue"
                                        />
                                        <InfoItem
                                            icon={<User />}
                                            label="Giới tính"
                                            value={student.gender === 'MALE' ? 'Nam' : student.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
                                            themeColor="blue"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                        <Activity className="mr-2 text-purple-600" />
                                        Thông tin tài khoản
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        <InfoItem
                                            icon={<User />}
                                            label="ID"
                                            value={student.id}
                                            themeColor="purple"
                                        />
                                        <InfoItem
                                            icon={<User />}
                                            label="Tên người dùng"
                                            value={student.username}
                                            themeColor="purple"
                                        />
                                        <InfoItem
                                            icon={<Clock />}
                                            label="Ngày tạo tài khoản"
                                            value={formatDateTime(student.createdAt)}
                                            themeColor="purple"
                                        />
                                        <InfoItem
                                            icon={<Activity />}
                                            label="Vai trò"
                                            value={
                                                <div className="flex items-center">
                                                    <span className="mr-2">Học viên</span>
                                                    {instructor && (
                                                        <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold">
                              + Giảng viên
                            </span>
                                                    )}
                                                </div>
                                            }
                                            themeColor="purple"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Instructor Info Tab */}
                        {activeTab === 'instructor' && (
                            <div>
                                {instructor ? (
                                    <div className="space-y-6">
                                        {/* Instructor Header with Avatar */}
                                        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 rounded-xl border border-amber-200 shadow-md mb-6">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                                                <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden shadow-lg mx-auto sm:mx-0">
                                                    {instructor.avatarUrl ? (
                                                        <img
                                                            src={instructor.avatarUrl}
                                                            alt={instructor.fullName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-5xl">
                                                            {instructor.fullName.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-center sm:text-left">
                                                    <div className="text-sm font-medium text-amber-700 mb-1">Vai trò giảng viên</div>
                                                    <h3 className="text-2xl font-bold text-gray-800">{instructor.fullName}</h3>
                                                    <p className="text-gray-600 mt-1">{instructor.title}</p>
                                                    <button
                                                        onClick={() => navigate(`/admin/instructor/${instructor.id}`)}
                                                        className="mt-3 inline-flex items-center text-amber-700 hover:text-amber-900 font-medium"
                                                    >
                                                        Xem hồ sơ giảng viên
                                                        <ArrowLeft className="ml-1 h-4 w-4 transform rotate-180" />
                                                    </button>
                                                </div>
                                                <div className="ml-auto hidden sm:block">
                                                    <StatusBadge active={instructor.isActive} large />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Instructor Statistics */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                            <div className="bg-white p-5 rounded-lg shadow-sm border border-amber-200 hover:shadow-md transition-all duration-300">
                                                <div className="flex items-center">
                                                    <div className="rounded-full bg-amber-100 p-3 mr-4">
                                                        <BookOpen className="h-6 w-6 text-amber-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Học viên</p>
                                                        <p className="text-xl font-bold text-gray-900">{instructor.totalStudent}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-white p-5 rounded-lg shadow-sm border border-amber-200 hover:shadow-md transition-all duration-300">
                                                <div className="flex items-center">
                                                    <div className="rounded-full bg-amber-100 p-3 mr-4">
                                                        <DollarSign className="h-6 w-6 text-amber-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Phí giảng dạy</p>
                                                        <p className="text-xl font-bold text-gray-900">{instructor.fee}%</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-white p-5 rounded-lg shadow-sm border border-amber-200 hover:shadow-md transition-all duration-300">
                                                <div className="flex items-center">
                                                    <div className="rounded-full bg-amber-100 p-3 mr-4">
                                                        <DollarSign className="h-6 w-6 text-amber-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Số dư</p>
                                                        <p className="text-xl font-bold text-gray-900">{formatCurrency(instructor.money)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
                                        <Award className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                                        <p className="text-2xl font-semibold text-gray-600 mb-3">Tài khoản này chưa kích hoạt Giảng viên</p>
                                        <p className="text-gray-500 max-w-lg mx-auto">Học viên có thể đăng ký trở thành giảng viên để tạo và quản lý các khóa học của riêng mình.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Courses Tab */}
                        {activeTab === 'courses' && (
                            <div>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-800 flex items-center mb-4 sm:mb-0">
                                        <BookOpen className="mr-2 text-blue-600" />
                                        Khóa học đang tham gia ({filteredCourses.length})
                                    </h3>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                                            placeholder="Tìm kiếm khóa học..."
                                            value={courseSearch}
                                            onChange={(e) => setCourseSearch(e.target.value)}
                                        />
                                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                    </div>
                                </div>

                                <div className="mb-4 flex flex-wrap gap-2">
                                    <SortButton
                                        label="Tên khóa học"
                                        active={courseSorting.field === 'title'}
                                        direction={courseSorting.direction}
                                        onClick={() => toggleCourseSort('title')}
                                    />
                                    <SortButton
                                        label="Ngày đăng ký"
                                        active={courseSorting.field === 'enrolledAt'}
                                        direction={courseSorting.direction}
                                        onClick={() => toggleCourseSort('enrolledAt')}
                                    />
                                    <SortButton
                                        label="Tiến độ học tập"
                                        active={courseSorting.field === 'progressPercent'}
                                        direction={courseSorting.direction}
                                        onClick={() => toggleCourseSort('progressPercent')}
                                    />
                                </div>

                                {filteredCourses.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                                        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <p className="text-xl font-semibold text-gray-600">
                                            {courseSearch ? 'Không tìm thấy khóa học nào phù hợp' : 'Tài khoản này chưa tham gia khóa học nào'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-6">
                                        {sortedCourses.map((course) => (
                                            <div
                                                key={course.courseId}
                                                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer flex flex-col md:flex-row"
                                                onClick={() => navigate("/admin/courses/" + course.courseId)}
                                            >
                                                <div className="w-full md:w-64 flex-shrink-0 overflow-hidden relative">
                                                    <div className="aspect-[16/9]">
                                                        <img
                                                            className="w-full h-full object-cover"
                                                            src={course.imageUrl || 'https://via.placeholder.com/400x225?text=No+Image'}
                                                            alt={course.title}
                                                            loading="lazy"
                                                        />
                                                    </div>
                                                    <div className="absolute top-2 right-2">
                            <span className={`px-2 py-1 text-xs font-bold rounded-md ${
                                course.status === 'completed' ? 'bg-green-500 text-white' :
                                    course.status === 'in_progress' ? 'bg-blue-500 text-white' :
                                        'bg-gray-500 text-white'
                            }`}>
                              {course.status === 'completed' ? 'Hoàn thành' :
                                  course.status === 'in_progress' ? 'Đang học' :
                                      'Chưa bắt đầu'}
                            </span>
                                                    </div>
                                                </div>
                                                <div className="p-6 flex-grow">
                                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                                        <h4 className="text-lg font-bold text-gray-800 mb-2">{course.title}</h4>
                                                    </div>

                                                    <div className="mb-4">
                                                        <div className="text-sm text-gray-500 mb-1">Tiến độ học tập</div>
                                                        <div className="flex items-center">
                                                            <div className="w-full bg-gray-200 rounded-full h-3 mr-2 flex-grow">
                                                                <div
                                                                    className={`h-3 rounded-full ${
                                                                        !course.progressPercent ? 'bg-gray-400' :
                                                                            course.progressPercent < 30 ? 'bg-red-500' :
                                                                                course.progressPercent < 70 ? 'bg-yellow-500' :
                                                                                    'bg-green-500'
                                                                    }`}
                                                                    style={{width: `${course.progressPercent || 0}%`}}
                                                                ></div>
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-700 w-12 text-right">
                                {course.progressPercent !== null ? `${Math.round(course.progressPercent)}%` : '0%'}
                              </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex flex-wrap gap-3">
                                                            <div className="flex items-center">
                                                                <Calendar className="h-4 w-4 text-blue-600 mr-1" />
                                                                <span className="text-sm font-medium">Đăng ký: {formatDate(course.enrolledAt)}</span>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <Award className="h-4 w-4 text-yellow-600 mr-1" />
                                                                <span className="text-sm font-medium">
                                  {course.rating && course.ratingStart ? (
                                      <div className="flex items-center">
                                          {[...Array(5)].map((_, i) => (
                                              <span key={i} className={`text-lg ${i < (course.ratingStart || 0) ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
                                          ))}
                                      </div>
                                  ) : (
                                      "Chưa đánh giá"
                                  )}
                                </span>
                                                            </div>
                                                        </div>
                                                        <button className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center whitespace-nowrap">
                                                            Chi tiết
                                                            <ArrowLeft className="h-4 w-4 ml-1 transform rotate-180" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDetailsPage;
