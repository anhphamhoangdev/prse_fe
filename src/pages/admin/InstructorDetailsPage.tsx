import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Loader2, Award, Calendar, User, Clock, Briefcase,
    DollarSign, BookOpen, Users, Mail, Activity, Search, ChevronUp, ChevronDown
} from 'lucide-react';
import { putAdminWithAuth, requestAdminWithAuth } from '../../utils/request';
import { ENDPOINTS } from '../../constants/endpoint';

// Enhanced interfaces based on the API response
interface Student {
    studentId: number;
    fullName: string;
    email: string;
    courseCount: number;
    avatarUrl?: string; // Added avatarUrl property
}

interface Course {
    id: number;
    title: string;
    shortDescription: string;
    imageUrl: string;
    originalPrice: number;
    averageRating: number;
    totalStudents: number;
    isPublish: boolean;
    createdAt: string;
    updatedAt: string;
    language: string;
    isHot: boolean;
}

interface Instructor {
    id: number;
    studentId: number; // Added from API
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

interface StudentAccount {
    id: number;
    username: string;
    email: string;
    gender: string;
    fullName: string;
    phoneNumber: string;
    dateOfBirth: string;
    money: number;
    point: number;
    isActive: boolean;
    isBlocked: boolean;
    createdAt: string;
    updatedAt: string;
    avatarUrl: string;
    instructor: boolean;
}

interface InstructorDetailsResponse {
    instructorProfile: {
        instructor: Instructor;
        studentAccount: StudentAccount; // Added from API
        students: Student[];
        courses: Course[];
        totalRevenue: number;
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

// InfoItem component with improved design
const InfoItem = ({ icon, label, value, themeColor = "blue" }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
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
                <p className="font-bold text-gray-800 text-lg">{value}</p>
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

const InstructorDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [details, setDetails] = useState<InstructorDetailsResponse['instructorProfile'] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('info');
    const [isToggling, setIsToggling] = useState(false);

    // Search and sorting states
    const [studentSearch, setStudentSearch] = useState('');
    const [courseSearch, setCourseSearch] = useState('');
    const [studentSorting, setStudentSorting] = useState<{field: 'fullName' | 'courseCount', direction: 'asc' | 'desc'}>({
        field: 'courseCount',
        direction: 'desc'
    });
    const [courseSorting, setCourseSorting] = useState<{field: 'title' | 'totalStudents' | 'originalPrice' | 'averageRating', direction: 'asc' | 'desc'}>({
        field: 'totalStudents',
        direction: 'desc'
    });

    // Fetch instructor details
    useEffect(() => {
        const fetchInstructorDetails = async () => {
            setLoading(true);
            try {
                if (!id) {
                    throw new Error('ID giảng viên không hợp lệ');
                }
                // Fetch instructor details using admin auth
                const response = await requestAdminWithAuth<InstructorDetailsResponse>(`/admin/instructor/${id}`);
                setDetails(response.instructorProfile);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi lấy thông tin giảng viên');
            } finally {
                setLoading(false);
            }
        };

        fetchInstructorDetails();
    }, [id]);

    // Toggle instructor active status
    const toggleInstructorActive = async () => {
        if (!details || !id || isToggling) return;
        setIsToggling(true);
        try {
            await putAdminWithAuth(`${ENDPOINTS.ADMIN.INSTRUCTORS}/${id}/toggle-status`, {});
            setDetails({
                ...details,
                instructor: { ...details.instructor, isActive: !details.instructor.isActive },
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi cập nhật trạng thái');
        } finally {
            setIsToggling(false);
        }
    };

    // Filter students based on search
    const filteredStudents = details?.students.filter(student =>
        student.fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
        student.email.toLowerCase().includes(studentSearch.toLowerCase())
    ) || [];

    // Sort students
    const sortedStudents = [...filteredStudents].sort((a, b) => {
        if (studentSorting.field === 'fullName') {
            return studentSorting.direction === 'asc'
                ? a.fullName.localeCompare(b.fullName)
                : b.fullName.localeCompare(a.fullName);
        } else {
            return studentSorting.direction === 'asc'
                ? a.courseCount - b.courseCount
                : b.courseCount - a.courseCount;
        }
    });

    // Filter courses based on search
    const filteredCourses = details?.courses.filter(course =>
        course.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
        course.shortDescription.toLowerCase().includes(courseSearch.toLowerCase())
    ) || [];

    // Sort courses
    const sortedCourses = [...filteredCourses].sort((a, b) => {
        switch (courseSorting.field) {
            case 'title':
                return courseSorting.direction === 'asc'
                    ? a.title.localeCompare(b.title)
                    : b.title.localeCompare(a.title);
            case 'totalStudents':
                return courseSorting.direction === 'asc'
                    ? a.totalStudents - b.totalStudents
                    : b.totalStudents - a.totalStudents;
            case 'originalPrice':
                return courseSorting.direction === 'asc'
                    ? a.originalPrice - b.originalPrice
                    : b.originalPrice - a.originalPrice;
            case 'averageRating':
                return courseSorting.direction === 'asc'
                    ? a.averageRating - b.averageRating
                    : b.averageRating - a.averageRating;
            default:
                return 0;
        }
    });

    // Toggle sort for students
    const toggleStudentSort = (field: 'fullName' | 'courseCount') => {
        if (studentSorting.field === field) {
            setStudentSorting({
                field,
                direction: studentSorting.direction === 'asc' ? 'desc' : 'asc'
            });
        } else {
            setStudentSorting({
                field,
                direction: 'asc'
            });
        }
    };

    // Toggle sort for courses
    const toggleCourseSort = (field: 'title' | 'totalStudents' | 'originalPrice' | 'averageRating') => {
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
                    <p className="text-gray-600 font-semibold text-lg">Đang tải thông tin giảng viên...</p>
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
                        onClick={() => navigate('/admin/instructors')}
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
                    <h2 className="text-3xl font-bold text-gray-800 mb-3">Không tìm thấy giảng viên</h2>
                    <p className="text-gray-600 mb-6">Giảng viên bạn đang tìm kiếm không tồn tại trong hệ thống.</p>
                    <button
                        onClick={() => navigate('/admin/instructors')}
                        className="px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors shadow-md font-semibold"
                    >
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    const { instructor, studentAccount, students, courses, totalRevenue } = details;
    const accountAge = calculateAccountAge(instructor.createdAt);

    return (
        <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/admin/instructors')}
                    className="flex items-center gap-2 text-blue-700 hover:text-blue-900 mb-6 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 font-semibold text-base"
                >
                    <ArrowLeft className="h-5 w-5" />
                    <span>Quay lại danh sách giảng viên</span>
                </button>

                {/* Profile Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-xl mb-8 overflow-hidden text-gray-800 border border-blue-200">
                    <div className="p-8">
                        <div className="flex flex-col md:flex-row md:items-center md:space-x-8">
                            <div className="w-40 h-40 rounded-full border-4 border-white overflow-hidden shadow-lg bg-white flex-shrink-0 transition-transform duration-300 hover:scale-105 mx-auto md:mx-0">
                                {instructor.avatarUrl ? (
                                    <img
                                        src={instructor.avatarUrl}
                                        alt={instructor.fullName}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-5xl">
                                        {instructor.fullName.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="mt-6 md:mt-0 flex-grow text-center md:text-left">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <h1 className="text-4xl font-extrabold text-gray-900 mb-1">{instructor.fullName}</h1>
                                        <p className="text-lg text-gray-600 mb-3">{instructor.title}</p>
                                        <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                                            <Mail className="w-5 h-5 text-gray-500" />
                                            <span className="text-gray-600">{studentAccount.email}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 md:mt-0 flex flex-col md:items-end gap-3">
                                        <StatusBadge active={instructor.isActive} large />
                                        <div className="relative inline-flex items-center w-12 h-6">
                                            <input
                                                type="checkbox"
                                                checked={instructor.isActive}
                                                onChange={toggleInstructorActive}
                                                disabled={isToggling}
                                                className="opacity-0 w-0 h-0 absolute"
                                                id="status-toggle"
                                                aria-label={`Bật/tắt trạng thái hoạt động cho ${instructor.fullName}`}
                                                aria-checked={instructor.isActive}
                                            />
                                            <label
                                                htmlFor="status-toggle"
                                                className={`block w-12 h-6 rounded-full cursor-pointer transition-colors duration-200 ${
                                                    instructor.isActive ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-400'
                                                } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                        <span
                            className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md flex items-center justify-center transition-transform duration-300 ease-in-out ${
                                instructor.isActive ? 'translate-x-6' : 'translate-x-0'
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
                            <p className="text-sm text-gray-500 font-medium">Thời gian hoạt động</p>
                            <p className="text-2xl font-bold text-gray-800">{accountAge} ngày</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4 border-l-4 border-purple-500 hover:shadow-lg transition-all duration-300">
                        <div className="rounded-full bg-purple-100 p-3 flex-shrink-0">
                            <BookOpen className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Số khóa học</p>
                            <p className="text-2xl font-bold text-gray-800">{courses.length}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4 border-l-4 border-green-500 hover:shadow-lg transition-all duration-300">
                        <div className="rounded-full bg-green-100 p-3 flex-shrink-0">
                            <Users className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Tổng học viên</p>
                            <p className="text-2xl font-bold text-gray-800">{instructor.totalStudent}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4 border-l-4 border-amber-500 hover:shadow-lg transition-all duration-300">
                        <div className="rounded-full bg-amber-100 p-3 flex-shrink-0">
                            <DollarSign className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Tổng doanh thu</p>
                            <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalRevenue)}</p>
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
                                activeTab === 'students' ? 'text-blue-700 border-b-4 border-blue-700 bg-white' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                            }`}
                            onClick={() => setActiveTab('students')}
                            aria-selected={activeTab === 'students'}
                            role="tab"
                        >
                            <Users className="w-5 h-5" />
                            Học viên
                            <span className="ml-1 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{students.length}</span>
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
                            Khóa học
                            <span className="ml-1 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{courses.length}</span>
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
                                            value={instructor.fullName}
                                            themeColor="blue"
                                        />
                                        <InfoItem
                                            icon={<Briefcase />}
                                            label="Chức danh"
                                            value={instructor.title}
                                            themeColor="blue"
                                        />
                                        <InfoItem
                                            icon={<DollarSign />}
                                            label="Phí giảng dạy"
                                            value={formatCurrency(instructor.fee)}
                                            themeColor="blue"
                                        />
                                        <InfoItem
                                            icon={<Mail />}
                                            label="Email"
                                            value={studentAccount.email}
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
                                            value={instructor.id}
                                            themeColor="purple"
                                        />
                                        <InfoItem
                                            icon={<User />}
                                            label="Tài khoản học viên"
                                            value={`ID: ${studentAccount.id} (${studentAccount.username})`}
                                            themeColor="purple"
                                        />
                                        <InfoItem
                                            icon={<DollarSign />}
                                            label="Số dư"
                                            value={formatCurrency(instructor.money)}
                                            themeColor="purple"
                                        />
                                        <InfoItem
                                            icon={<Clock />}
                                            label="Ngày tạo tài khoản"
                                            value={formatDateTime(instructor.createdAt)}
                                            themeColor="purple"
                                        />

                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Students Tab */}
                        {activeTab === 'students' && (
                            <div>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-800 flex items-center mb-4 sm:mb-0">
                                        <Users className="mr-2 text-blue-600" />
                                        Danh sách học viên ({filteredStudents.length})
                                    </h3>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                                            placeholder="Tìm kiếm học viên..."
                                            value={studentSearch}
                                            onChange={(e) => setStudentSearch(e.target.value)}
                                        />
                                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                    </div>
                                </div>

                                {filteredStudents.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                                        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <p className="text-xl font-semibold text-gray-600">
                                            {studentSearch ? 'Không tìm thấy học viên nào phù hợp' : 'Chưa có học viên nào tham gia khóa học'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-lg border overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        <div className="flex items-center">
                                                            Học viên
                                                            <button onClick={() => toggleStudentSort('fullName')} className="ml-1">
                                                                {studentSorting.field === 'fullName' ? (
                                                                    studentSorting.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                                                                ) : (
                                                                    <ChevronDown size={16} className="text-gray-300" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Email
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        <div className="flex items-center">
                                                            Số khóa học
                                                            <button onClick={() => toggleStudentSort('courseCount')} className="ml-1">
                                                                {studentSorting.field === 'courseCount' ? (
                                                                    studentSorting.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                                                                ) : (
                                                                    <ChevronDown size={16} className="text-gray-300" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </th>
                                                </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                {sortedStudents.map((student) => (
                                                    <tr
                                                        key={student.studentId}
                                                        className="hover:bg-blue-50 cursor-pointer transition-all duration-300"
                                                        onClick={() => navigate(`/admin/student/${student.studentId}`)}
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                                                                    {student.avatarUrl ? (
                                                                        <img
                                                                            src={student.avatarUrl}
                                                                            alt={student.fullName}
                                                                            className="h-10 w-10 object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="h-10 w-10 bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                                                            {student.fullName.charAt(0)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="ml-4">
                                                                    <div className="text-sm font-medium text-gray-900">{student.fullName}</div>
                                                                    <div className="text-sm text-gray-500">ID: {student.studentId}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                            {student.email}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-3 py-1 inline-flex text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                                  {student.courseCount} khóa học
                                </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>
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
                                        Danh sách khóa học ({filteredCourses.length})
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
                                        label="Số học viên"
                                        active={courseSorting.field === 'totalStudents'}
                                        direction={courseSorting.direction}
                                        onClick={() => toggleCourseSort('totalStudents')}
                                    />
                                    <SortButton
                                        label="Giá khóa học"
                                        active={courseSorting.field === 'originalPrice'}
                                        direction={courseSorting.direction}
                                        onClick={() => toggleCourseSort('originalPrice')}
                                    />
                                    <SortButton
                                        label="Đánh giá"
                                        active={courseSorting.field === 'averageRating'}
                                        direction={courseSorting.direction}
                                        onClick={() => toggleCourseSort('averageRating')}
                                    />
                                </div>

                                {filteredCourses.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                                        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <p className="text-xl font-semibold text-gray-600">
                                            {courseSearch ? 'Không tìm thấy khóa học nào phù hợp' : 'Chưa có khóa học nào'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-6">
                                        {sortedCourses.map((course) => (
                                            <div
                                                key={course.id}
                                                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer flex flex-col md:flex-row"
                                                onClick={() => window.open(`https://prse-fe.vercel.app/course-detail/${course.id}`)}
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
                                                    {course.isHot && (
                                                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-md font-bold">
                                                            HOT
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-6 flex-grow">
                                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                                        <h4 className="text-lg font-bold text-gray-800 mb-2">{course.title}</h4>
                                                        <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                                  course.isPublish ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {course.isPublish ? 'Đã xuất bản' : 'Chưa xuất bản'}
                              </span>
                                                            <span className="px-3 py-1 inline-flex text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                                {course.language}
                              </span>
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.shortDescription}</p>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex flex-wrap gap-3">
                                                            <div className="flex items-center">
                                                                <DollarSign className="h-4 w-4 text-amber-600 mr-1" />
                                                                <span className="text-sm font-semibold">{formatCurrency(course.originalPrice)}</span>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <Users className="h-4 w-4 text-blue-600 mr-1" />
                                                                <span className="text-sm font-semibold">{course.totalStudents} học viên</span>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <Award className="h-4 w-4 text-yellow-600 mr-1" />
                                                                <span className="text-sm font-semibold">{course.averageRating.toFixed(1)}/5 điểm</span>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <Calendar className="h-4 w-4 text-green-600 mr-1" />
                                                                <span className="text-sm font-semibold">{formatDate(course.createdAt)}</span>
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

export default InstructorDetailsPage;