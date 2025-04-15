import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SearchHeaderAndFooterLayout } from "../../layouts/UserLayout";
import { Enrollment, getMyCourses } from "../../services/courseService";
import { EnrollmentCard } from "../../components/enrollment/EnrollmentCard";
import {getWithAuth} from "../../utils/request";
import {ENDPOINTS} from "../../constants/endpoint";

export function MyCoursesPage() {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [filteredEnrollments, setFilteredEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [activeTab, setActiveTab] = useState<
        "all" | "completed" | "in_progress" | "not_started"
    >("all");
    const [stats, setStats] = useState({
        all: 0,
        completed: 0,
        in_progress: 0,
        not_started: 0
    });
    const [searchTerm, setSearchTerm] = useState("");

    const fetchEnrollments = async (page: number, status?: string) => {
        try {
            setLoading(true);
            const pageData = await getMyCourses(page - 1, 12, status);

            setEnrollments(pageData.content || []);
            setFilteredEnrollments(pageData.content || []); // Initialize filtered enrollments
            setTotalPages(pageData.totalPages || 1);
            setCurrentPage(page);

        } catch (err) {
            console.error("Error fetching enrollments:", err);
            setError("Không thể tải danh sách khóa học. Vui lòng thử lại sau.");
            setEnrollments([]);
            setFilteredEnrollments([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const data = await getWithAuth<{
                enrollment_stat: {
                    all: number;
                    completed: number;
                    inProgress: number;
                    notStarted: number;
                }
            }>(ENDPOINTS.ENROLLMENT.STATS);

            setStats({
                all: data.enrollment_stat.all,
                completed: data.enrollment_stat.completed,
                in_progress: data.enrollment_stat.inProgress,
                not_started: data.enrollment_stat.notStarted
            });
        } catch (err) {
            console.error("Error fetching stats:", err);
        }
    };


    useEffect(() => {
        fetchEnrollments(1, activeTab !== "all" ? activeTab : undefined);
    }, [activeTab]);

    useEffect(() => {
        fetchStats();
    }, []);

    // Handle search filtering
    useEffect(() => {
        const filtered = enrollments.filter((enrollment) =>
            enrollment.course?.title?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredEnrollments(filtered);
    }, [searchTerm, enrollments]);

    const handlePageChange = (page: number) => {
        fetchEnrollments(page, activeTab !== "all" ? activeTab : undefined);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleTabChange = (
        tab: "all" | "completed" | "in_progress" | "not_started"
    ) => {
        setActiveTab(tab);
        setCurrentPage(1); // Reset to page 1 when switching tabs
        setSearchTerm(""); // Clear search term when switching tabs
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    // Cấu hình tab để tái sử dụng
    const tabsConfig = [
        {
            id: "all",
            label: "Tất cả",
            icon: "fa-th-large",
            color: "from-blue-500 to-blue-700",
            description: "Tất cả các khóa học đã đăng ký"
        },
        {
            id: "completed",
            label: "Đã hoàn thành",
            icon: "fa-check-circle",
            color: "from-green-500 to-emerald-600",
            description: "Các khóa học bạn đã học xong"
        },
        {
            id: "in_progress",
            label: "Đang học",
            icon: "fa-book-open",
            color: "from-cyan-500 to-cyan-600",
            description: "Các khóa học bạn đang học dở"
        },
        {
            id: "not_started",
            label: "Chưa bắt đầu",
            icon: "fa-hourglass-start",
            color: "from-amber-500 to-orange-600",
            description: "Các khóa học bạn đăng ký nhưng chưa bắt đầu"
        },
    ];

    const currentTab = tabsConfig.find(tab => tab.id === activeTab) || tabsConfig[0];

    return (
        <SearchHeaderAndFooterLayout>
            <div className="min-h-screen bg-gray-50 py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Enhanced Header */}
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Khóa học của tôi
                        </h1>
                        <Link
                            to="/"
                            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition duration-300 shadow-sm"
                        >
                            Khám phá thêm khóa học
                        </Link>
                    </div>

                    {/* Redesigned Tabs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {tabsConfig.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    className={`relative flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                                        isActive
                                            ? `bg-gradient-to-r ${tab.color} text-white shadow-md`
                                            : "bg-white border border-gray-200 hover:border-gray-300 hover:shadow text-gray-700"
                                    }`}
                                    onClick={() =>
                                        handleTabChange(
                                            tab.id as "all" | "completed" | "in_progress" | "not_started"
                                        )
                                    }
                                >
                                    <div className="flex items-center">
                                        <div className={`flex items-center justify-center h-10 w-10 rounded-lg ${
                                            isActive ? "bg-white/20" : `bg-gradient-to-r ${tab.color} bg-opacity-10 text-white`
                                        }`}>
                                            <i className={`fas ${tab.icon} ${isActive ? "text-white" : ""}`}></i>
                                        </div>
                                        <span className="font-medium ml-3">{tab.label}</span>
                                    </div>
                                    <div className={`h-6 w-6 flex items-center justify-center rounded-full ${
                                        isActive ? "bg-white text-blue-600" : "bg-gray-100 text-gray-700"
                                    }`}>
                                        {stats[tab.id as keyof typeof stats] || 0}
                                    </div>
                                    {isActive && (
                                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 -mb-1">
                                            <div className="h-1.5 w-10 rounded-full bg-white"></div>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex flex-col justify-center items-center h-64 bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="relative h-16 w-16 mb-4">
                                <div className="absolute inset-0 rounded-full border-t-4 border-blue-600 animate-spin"></div>
                                <div className="absolute inset-3 rounded-full border-2 border-gray-200"></div>
                            </div>
                            <p className="text-blue-600 text-lg font-medium">
                                Đang tải danh sách khóa học...
                            </p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center shadow-sm">
                            <div className="mb-3">
                                <i className="fas fa-exclamation-circle text-3xl text-red-500"></i>
                            </div>
                            <h3 className="text-lg font-medium mb-2">Đã xảy ra lỗi</h3>
                            <p>{error}</p>
                            <button
                                onClick={() => fetchEnrollments(currentPage, activeTab !== "all" ? activeTab : undefined)}
                                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
                            >
                                <i className="fas fa-redo mr-2"></i>
                                Thử lại
                            </button>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && filteredEnrollments.length === 0 && enrollments.length > 0 && searchTerm && (
                        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-blue-50 mb-6">
                                <i className="fas fa-search text-4xl text-blue-500"></i>
                            </div>
                            <h3 className="text-xl font-medium text-gray-900 mb-3">
                                Không tìm thấy khóa học
                            </h3>
                            <p className="text-gray-500 max-w-md mx-auto mb-6">
                                Không có khóa học nào khớp với từ khóa "{searchTerm}". Hãy thử tìm kiếm khác.
                            </p>
                            <button
                                onClick={() => setSearchTerm("")}
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-300"
                            >
                                <i className="fas fa-undo mr-2"></i>
                                Xóa tìm kiếm
                            </button>
                        </div>
                    )}

                    {!loading && !error && enrollments.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-blue-50 mb-6">
                                <i className={`fas ${currentTab.icon} text-4xl ${
                                    activeTab === "completed" ? "text-green-500" :
                                        activeTab === "in_progress" ? "text-blue-500" :
                                            activeTab === "not_started" ? "text-amber-500" : "text-indigo-500"
                                }`}></i>
                            </div>
                            <h3 className="text-xl font-medium text-gray-900 mb-3">
                                {activeTab === "all"
                                    ? "Bạn chưa đăng ký khóa học nào"
                                    : activeTab === "completed"
                                        ? "Bạn chưa hoàn thành khóa học nào"
                                        : activeTab === "in_progress"
                                            ? "Bạn không có khóa học nào đang học"
                                            : "Bạn không có khóa học nào chưa bắt đầu"}
                            </h3>
                            <p className="text-gray-500 max-w-md mx-auto mb-6">
                                {activeTab === "all"
                                    ? "Hãy khám phá các khóa học phù hợp với sở thích và mục tiêu của bạn."
                                    : activeTab === "completed"
                                        ? "Tiếp tục học và hoàn thành các khóa học để đạt được mục tiêu của bạn."
                                        : activeTab === "in_progress"
                                            ? "Hãy bắt đầu các khóa học đã đăng ký để tiến bộ mỗi ngày."
                                            : "Hãy chọn một khóa học và bắt đầu hành trình học tập của bạn."}
                            </p>
                            <Link
                                to="/"
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-300"
                            >
                                <i className="fas fa-search mr-2"></i>
                                Khám phá khóa học ngay
                            </Link>
                        </div>
                    )}

                    {/* Enrollment Grid */}
                    {!loading && !error && enrollments.length > 0 && (
                        <>
                            {/* Search Input and Stats Summary */}
                            <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border border-gray-100">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="relative w-full sm:w-1/2">
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={handleSearchChange}
                                            placeholder="Tìm kiếm theo tên khóa học..."
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Hiển thị <span className="font-medium text-gray-700">{filteredEnrollments.length}</span> khóa học {
                                        activeTab !== "all" ? `${
                                            activeTab === "completed" ? "đã hoàn thành" :
                                                activeTab === "in_progress" ? "đang học" : "chưa bắt đầu"
                                        }` : ""
                                    }
                                        {searchTerm && ` khớp với "${searchTerm}"`}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {filteredEnrollments.map((enrollment) => (
                                    <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
                                ))}
                            </div>

                            {/* Enhanced Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-8 flex justify-center">
                                    <div className="inline-flex rounded-md shadow-sm">
                                        <button
                                            onClick={() => handlePageChange(1)}
                                            disabled={currentPage === 1}
                                            className={`px-3 py-2 rounded-l-lg border ${
                                                currentPage === 1
                                                    ? "bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200"
                                                    : "bg-white text-blue-600 hover:bg-blue-50 border-gray-200"
                                            }`}
                                        >
                                            <i className="fas fa-angle-double-left"></i>
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className={`px-3 py-2 border-t border-b ${
                                                currentPage === 1
                                                    ? "bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200"
                                                    : "bg-white text-blue-600 hover:bg-blue-50 border-gray-200"
                                            }`}
                                        >
                                            <i className="fas fa-angle-left"></i>
                                        </button>

                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum: number;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }

                                            if (pageNum > 0 && pageNum <= totalPages) {
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => handlePageChange(pageNum)}
                                                        className={`px-4 py-2 border-t border-b ${
                                                            currentPage === pageNum
                                                                ? "bg-blue-600 text-white border-blue-600"
                                                                : "bg-white text-gray-700 hover:bg-blue-50 border-gray-200"
                                                        }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            }
                                            return null;
                                        })}

                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className={`px-3 py-2 border-t border-b ${
                                                currentPage === totalPages
                                                    ? "bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200"
                                                    : "bg-white text-blue-600 hover:bg-blue-50 border-gray-200"
                                            }`}
                                        >
                                            <i className="fas fa-angle-right"></i>
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(totalPages)}
                                            disabled={currentPage === totalPages}
                                            className={`px-3 py-2 rounded-r-lg border ${
                                                currentPage === totalPages
                                                    ? "bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200"
                                                    : "bg-white text-blue-600 hover:bg-blue-50 border-gray-200"
                                            }`}
                                        >
                                            <i className="fas fa-angle-double-right"></i>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </SearchHeaderAndFooterLayout>
    );
}