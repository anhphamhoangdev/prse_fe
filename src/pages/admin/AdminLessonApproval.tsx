import React, { useState, useEffect } from 'react';
import { patchAdminWithAuth, requestAdminWithAuth } from '../../utils/request';
import { ENDPOINTS } from '../../constants/endpoint';
import {
    Check,
    X,
    Loader2,
    BookOpen,
    Search,
    RefreshCcw,
    Eye,
    User,
    Video,
    Code,
    HelpCircle,
} from 'lucide-react';
import { useNotification } from '../../components/notification/NotificationProvider';
import VideoQuickViewModal from "../../components/admin/VideoQuickViewModal";
import CodeQuickViewModal from "../../components/admin/CodeQuickViewModal";


// Types
type LessonStatus = 'new' | 'approved' | 'rejected';
type LessonType = 'video' | 'code' | 'quizz';

interface LessonDraft {
    id: number;
    title: string;
    type: LessonType;
    orderIndex: number;
    isPublish: boolean;
    status: LessonStatus;
    rejectedReason?: string;
    createdAt: string;
    updatedAt: string;
    chapterId: number;
    instructor: {
        name: string;
        email: string;
    };
}

interface LessonsApiResponse {
    lessons: LessonDraft[];
    totalElements: number;
}

export default function AdminLessonApproval() {
    const [allLessons, setAllLessons] = useState<LessonDraft[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [selectedLesson, setSelectedLesson] = useState<LessonDraft | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Modal states
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [showCodeModal, setShowCodeModal] = useState(false);

    const { showNotification } = useNotification();

    useEffect(() => {
        fetchLessons();
    }, []);

    const fetchLessons = async () => {
        try {
            setLoading(true);
            const response = await requestAdminWithAuth<LessonsApiResponse>(
                `${ENDPOINTS.ADMIN.LESSONS_DRAFT}`
            );
            setAllLessons(response?.lessons || []);
        } catch (error) {
            console.error('Error fetching lessons:', error);
            setAllLessons([]);
            showNotification('error', 'Lỗi', 'Không thể tải danh sách bài học');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchLessons();
        setIsRefreshing(false);
    };

    const filteredLessons = allLessons.filter(lesson => {
        const matchesSearch = lesson.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lesson.instructor?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || lesson.status === statusFilter;
        const matchesType = typeFilter === 'all' || lesson.type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

    const handleQuickView = async (lesson: LessonDraft) => {
        setSelectedLesson(lesson);

        switch (lesson.type) {
            case 'video':
                setShowVideoModal(true);
                break;
            case 'code':
                setShowCodeModal(true);
                break;
            case 'quizz':
                // TODO: Implement quiz modal later
                showNotification('info', 'Thông báo', 'Quiz modal chưa được triển khai');
                break;
            default:
                showNotification('error', 'Lỗi', 'Loại bài học không được hỗ trợ');
        }
    };

    const handleApprove = async (lessonId: number) => {
        // This function will be passed to child components
        try {
            await patchAdminWithAuth(
                `${ENDPOINTS.ADMIN.LESSONS_DRAFT}/${lessonId}/approve`,
                {}
            );

            setAllLessons(prevLessons =>
                prevLessons.map(lesson =>
                    lesson.id === lessonId
                        ? { ...lesson, status: 'approved' as LessonStatus }
                        : lesson
                )
            );

            showNotification('success', 'Thành công', 'Đã duyệt bài học');
            closeAllModals();
            await fetchLessons();
        } catch (error) {
            showNotification('error', 'Thất bại', 'Có lỗi xảy ra khi duyệt bài học');
        }
    };

    const handleReject = async (lessonId: number, rejectionReason: string) => {
        // This function will be passed to child components
        try {
            await patchAdminWithAuth(
                `${ENDPOINTS.ADMIN.LESSONS_DRAFT}/${lessonId}/reject`,
                { rejectedReason: rejectionReason }
            );

            setAllLessons(prevLessons =>
                prevLessons.map(lesson =>
                    lesson.id === lessonId
                        ? {
                            ...lesson,
                            status: 'rejected' as LessonStatus,
                            rejectedReason: rejectionReason
                        }
                        : lesson
                )
            );

            showNotification('success', 'Thành công', 'Đã từ chối bài học');
            closeAllModals();
            await fetchLessons();
        } catch (error) {
            showNotification('error', 'Thất bại', 'Có lỗi xảy ra khi từ chối bài học');
        }
    };

    const closeAllModals = () => {
        setShowVideoModal(false);
        setShowCodeModal(false);
        setSelectedLesson(null);
    };

    const getTypeIcon = (type: LessonType) => {
        switch (type) {
            case 'video':
                return <Video className="w-5 h-5 text-blue-600" />;
            case 'code':
                return <Code className="w-5 h-5 text-green-600" />;
            case 'quizz':
                return <HelpCircle className="w-5 h-5 text-purple-600" />;
            default:
                return <BookOpen className="w-5 h-5 text-gray-600" />;
        }
    };

    const getTypeLabel = (type: LessonType) => {
        switch (type) {
            case 'video':
                return 'Video';
            case 'code':
                return 'Code';
            case 'quizz':
                return 'Quiz';
            default:
                return 'Khác';
        }
    };

    const getStatusBadge = (status: LessonStatus) => {
        const styles: Record<LessonStatus, string> = {
            new: 'bg-orange-100 text-orange-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
        };
        const labels: Record<LessonStatus, string> = {
            new: 'Chờ duyệt',
            approved: 'Đã duyệt',
            rejected: 'Đã từ chối',
        };
        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Quản lý bài học</h1>
                        <p className="text-sm text-gray-500">Duyệt và quản lý bài học từ giảng viên</p>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm theo tên bài học, giảng viên..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="new">Chờ duyệt</option>
                        <option value="approved">Đã duyệt</option>
                        <option value="rejected">Đã từ chối</option>
                    </select>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">Tất cả loại</option>
                        <option value="video">Video</option>
                        <option value="code">Code</option>
                        <option value="quizz">Quiz</option>
                    </select>
                </div>
                <button
                    onClick={handleRefresh}
                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <RefreshCcw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Làm mới
                </button>
            </div>

            {/* Table */}
            {filteredLessons.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchTerm ? 'Không tìm thấy kết quả' : 'Chưa có bài học nào'}
                    </h3>
                    <p className="text-gray-500">
                        {searchTerm
                            ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc'
                            : 'Hiện tại không có bài học nào phù hợp với bộ lọc'}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Bài học
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Giảng viên
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Loại
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ngày tạo
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Lý do từ chối
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {filteredLessons.map((lesson) => (
                                <tr key={lesson.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {lesson.title.length > 15 ? lesson.title.substring(0, 15) + '...' : lesson.title}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{lesson.instructor.name}</div>
                                                <div className="text-xs text-gray-500">{lesson.instructor.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            {getTypeIcon(lesson.type)}
                                            <span className="text-sm text-gray-900">{getTypeLabel(lesson.type)}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        {getStatusBadge(lesson.status)}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-900">
                                        {new Date(lesson.createdAt).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-4 py-4 max-w-xs">
                                        {lesson.status === 'rejected' && lesson.rejectedReason ? (
                                            <p className="text-sm text-red-600 truncate" title={lesson.rejectedReason}>
                                                {lesson.rejectedReason}
                                            </p>
                                        ) : (
                                            '—'
                                        )}
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleQuickView(lesson)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                title="Xem chi tiết"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modals */}
            {showVideoModal && selectedLesson && (
                <VideoQuickViewModal
                    lesson={selectedLesson}
                    onClose={closeAllModals}
                    onApprove={handleApprove}
                    onReject={handleReject}
                />
            )}

            {showCodeModal && selectedLesson && (
                <CodeQuickViewModal
                    lesson={selectedLesson}
                    onClose={closeAllModals}
                    onApprove={handleApprove}
                    onReject={handleReject}
                />
            )}
        </div>
    );
}