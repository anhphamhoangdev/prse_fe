import React, { useState, useEffect } from 'react';
import { patchAdminWithAuth, requestAdminWithAuth } from '../../utils/request';
import { ENDPOINTS } from '../../constants/endpoint';
import {
    Check,
    X,
    Loader2,
    BookOpen,
    Clock,
    Search,
    RefreshCcw,
    Eye,
    User,
    Video,
    Play,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react';
import { useNotification } from "../../components/notification/NotificationProvider";

// Types
interface LessonDraft {
    id: number;
    title: string;
    type: string;
    orderIndex: number;
    isPublish: boolean;
    status: 'new' | 'approved' | 'rejected';
    rejectedReason?: string;
    createdAt: string;
    updatedAt: string;
    chapterId: number;
    instructor: {
        name: string;
        email: string;
    };
    videoLesson?: {
        id: number;
        videoUrl: string;
        duration: number; // in seconds
    };
}

type TabType = 'new' | 'approved' | 'rejected';

export default function AdminLessonApproval() {
    const [allLessons, setAllLessons] = useState<LessonDraft[]>([]);
    const [activeTab, setActiveTab] = useState<TabType>('new');
    const [loading, setLoading] = useState(true);
    const [selectedLesson, setSelectedLesson] = useState<LessonDraft | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showQuickViewModal, setShowQuickViewModal] = useState(false);
    const { showNotification } = useNotification();
    const [searchTerm, setSearchTerm] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [videoLoading, setVideoLoading] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchLessons();
        setIsRefreshing(false);
    };

    const filteredLessons = allLessons.filter(lesson =>
        lesson.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lesson.instructor?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        fetchLessons();
    }, [activeTab]);

    const fetchLessons = async () => {
        try {
            const response = await requestAdminWithAuth<{ lessons: LessonDraft[] }>(
                `${ENDPOINTS.ADMIN.LESSONS_DRAFT}?status=${activeTab}`
            );
            setAllLessons(response.lessons);
        } catch (error) {
            console.error('Error fetching lessons:', error);
            showNotification('error', 'Lỗi', 'Không thể tải danh sách bài học');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (lessonId: number) => {
        setIsProcessing(true);
        try {
            // await patchAdminWithAuth(
            //     `${ENDPOINTS.ADMIN.LESSONS_DRAFT}/${lessonId}/approve`,
            //     {}
            // );

            setAllLessons(prevLessons =>
                prevLessons.filter(lesson => lesson.id !== lessonId)
            );
            showNotification('success', 'Thành công', 'Đã duyệt bài học');

            if (showQuickViewModal) {
                setShowQuickViewModal(false);
            }
        } catch (error) {
            console.error('Error approving lesson:', error);
            showNotification('error', 'Thất bại', 'Có lỗi xảy ra khi duyệt bài học');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            showNotification('error', 'Lỗi', 'Vui lòng nhập lý do từ chối');
            return;
        }

        setIsProcessing(true);
        try {
            // await patchAdminWithAuth(
            //     `${ENDPOINTS.ADMIN.LESSONS_DRAFT}/${selectedLesson?.id}/reject`,
            //     { rejectedReason: rejectionReason }
            // );

            setAllLessons(prevLessons =>
                prevLessons.filter(lesson => lesson.id !== selectedLesson?.id)
            );

            setShowRejectModal(false);
            setRejectionReason('');
            showNotification('success', 'Thành công', 'Đã từ chối bài học');

            if (showQuickViewModal) {
                setShowQuickViewModal(false);
            }
        } catch (error) {
            console.error('Error rejecting lesson:', error);
            showNotification('error', 'Thất bại', 'Có lỗi xảy ra khi từ chối bài học');
        } finally {
            setIsProcessing(false);
        }
    };

    const fetchVideoData = async (lessonId: number) => {
        // try {
        //     const response = await requestAdminWithAuth(
        //         `${ENDPOINTS.ADMIN.VIDEO_LESSONS_DRAFT}?lessonDraftId=${lessonId}`
        //     );
        //     return response.videoLesson;
        // } catch (error) {
        //     console.error('Error fetching video data:', error);
        //     return null;
        // }
    };

    const handleQuickView = async (lesson: LessonDraft) => {
        setSelectedLesson(lesson);
        setShowQuickViewModal(true);

        // Fetch video data if lesson type is video
        if (lesson.type === 'video') {
            setVideoLoading(true);
            try {
                const videoData = await fetchVideoData(lesson.id);
                // if (videoData) {
                //     setSelectedLesson(prevLesson => ({
                //         ...prevLesson!,
                //         videoLesson: videoData
                //     }));
                // }
            } catch (error) {
                console.error('Error loading video data:', error);
                showNotification('error', 'Lỗi', 'Không thể tải thông tin video');
            } finally {
                setVideoLoading(false);
            }
        }
    };

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <BookOpen className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Quản lý bài học</h1>
                        <p className="text-gray-500">Quản lý và xử lý các bài học từ giảng viên</p>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-3">
                            <AlertCircle className="w-5 h-5 text-orange-600"/>
                            <p className="text-sm font-medium text-orange-600">Chờ duyệt</p>
                        </div>
                        <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-3xl font-bold text-gray-900 tabular-nums">
                                {activeTab === 'new' ? allLessons.length : '—'}
                            </span>
                            {activeTab === 'new' && allLessons.length > 0 && (
                                <div className="h-2 w-2 rounded-full bg-orange-500 animate-ping"/>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-3">
                            <CheckCircle className="w-5 h-5 text-green-600"/>
                            <p className="text-sm font-medium text-green-600">Đã duyệt</p>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">
                            {activeTab === 'approved' ? allLessons.length : '—'}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-3">
                            <XCircle className="w-5 h-5 text-red-600"/>
                            <p className="text-sm font-medium text-red-600">Đã từ chối</p>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">
                            {activeTab === 'rejected' ? allLessons.length : '—'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('new')}
                            className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'new'
                                    ? 'border-orange-500 text-orange-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <AlertCircle className="w-4 h-4" />
                            Chờ duyệt
                            {activeTab === 'new' && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                    {allLessons.length}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => setActiveTab('approved')}
                            className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'approved'
                                    ? 'border-green-500 text-green-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <CheckCircle className="w-4 h-4" />
                            Đã duyệt
                            {activeTab === 'approved' && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {allLessons.length}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => setActiveTab('rejected')}
                            className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'rejected'
                                    ? 'border-red-500 text-red-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <XCircle className="w-4 h-4" />
                            Đã từ chối
                            {activeTab === 'rejected' && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    {allLessons.length}
                                </span>
                            )}
                        </button>
                    </nav>
                </div>
            </div>

            {/* Search and Actions Bar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                    <input
                        type="text"
                        placeholder="Tìm theo tên bài học, giảng viên..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <button
                    onClick={handleRefresh}
                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                    <RefreshCcw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}/>
                    Làm mới
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Thời gian
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Bài học
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Giảng viên
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Thời lượng
                            </th>
                            {activeTab === 'rejected' && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Lý do từ chối
                                </th>
                            )}
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Thao tác
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {filteredLessons.map((lesson: LessonDraft) => (
                            <tr key={lesson.id} className="hover:bg-gray-50 transition-colors duration-200">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <div>
                                        <p>{new Date(lesson.createdAt).toLocaleString('vi-VN', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            day: '2-digit',
                                            month: '2-digit'
                                        })}</p>
                                        {lesson.status !== 'new' && (
                                            <p className="text-xs text-gray-500">
                                                Cập nhật: {new Date(lesson.updatedAt).toLocaleString('vi-VN', {
                                                day: '2-digit',
                                                month: '2-digit'
                                            })}
                                            </p>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Video className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {lesson.title}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Bài học #{lesson.orderIndex}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-400"/>
                                        <div className="text-sm">
                                            <div className="font-medium text-gray-900">
                                                {lesson.instructor.name}
                                            </div>
                                            <div className="text-gray-500">
                                                {lesson.instructor.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-1 text-sm text-gray-900">
                                        <Clock className="w-4 h-4 text-gray-400"/>
                                        {lesson.videoLesson ? formatDuration(lesson.videoLesson.duration) : '—'}
                                    </div>
                                </td>
                                {activeTab === 'rejected' && (
                                    <td className="px-6 py-4 max-w-xs">
                                        <p className="text-sm text-red-600 truncate" title={lesson.rejectedReason}>
                                            {lesson.rejectedReason}
                                        </p>
                                    </td>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {activeTab === 'new' ? (
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleQuickView(lesson)}
                                                className="inline-flex items-center px-3 py-1.5 text-blue-700 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors duration-200"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleApprove(lesson.id)}
                                                disabled={isProcessing}
                                                className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50"
                                            >
                                                <Check className="w-4 h-4 mr-1" />
                                                Duyệt
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedLesson(lesson);
                                                    setShowRejectModal(true);
                                                }}
                                                disabled={isProcessing}
                                                className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50"
                                            >
                                                <X className="w-4 h-4 mr-1" />
                                                Từ chối
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleQuickView(lesson)}
                                            className="inline-flex items-center px-3 py-1.5 text-blue-700 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors duration-200"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick View Modal */}
            {showQuickViewModal && selectedLesson && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[85vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Video className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{selectedLesson.title}</h3>
                                        <div className="mt-1">
                                            {selectedLesson.status === 'new' && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                    <AlertCircle className="w-3 h-3" />
                                                    Chờ duyệt
                                                </span>
                                            )}
                                            {selectedLesson.status === 'approved' && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Đã duyệt
                                                </span>
                                            )}
                                            {selectedLesson.status === 'rejected' && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    <XCircle className="w-3 h-3" />
                                                    Đã từ chối
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {selectedLesson.status === 'new' && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setSelectedLesson(selectedLesson);
                                                    setShowRejectModal(true);
                                                }}
                                                disabled={isProcessing}
                                                className="inline-flex items-center px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                                            >
                                                <X className="w-4 h-4 mr-2" />
                                                Không duyệt
                                            </button>
                                            <button
                                                onClick={() => handleApprove(selectedLesson.id)}
                                                disabled={isProcessing}
                                                className="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                                            >
                                                {isProcessing ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Đang xử lý...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check className="w-4 h-4 mr-2" />
                                                        Duyệt
                                                    </>
                                                )}
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => setShowQuickViewModal(false)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Instructor Info */}
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <User className="w-4 h-4 text-gray-600"/>
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">{selectedLesson.instructor.name}</p>
                                        <p className="text-xs text-gray-600">{selectedLesson.instructor.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Rejection Reason */}
                            {selectedLesson.status === 'rejected' && selectedLesson.rejectedReason && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <h4 className="text-sm font-medium text-red-800 mb-1">Lý do từ chối:</h4>
                                    <p className="text-sm text-red-700">{selectedLesson.rejectedReason}</p>
                                </div>
                            )}

                            {/* Video Content */}
                            {selectedLesson.type === 'video' && (
                                <div>
                                    <h4 className="text-base font-semibold mb-3">Nội dung video</h4>
                                    {videoLoading ? (
                                        <div className="bg-gray-100 rounded-lg p-6 text-center">
                                            <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2"/>
                                            <p className="text-sm text-gray-600">Đang tải thông tin video...</p>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-100 rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Play className="w-4 h-4 text-gray-600"/>
                                                <span className="text-sm font-medium">
                                                    Thời lượng: {selectedLesson.videoLesson ? formatDuration(selectedLesson.videoLesson.duration) : 'Chưa có thông tin'}
                                                </span>
                                            </div>

                                            <div className="bg-black aspect-video rounded-lg flex items-center justify-center mb-3 relative group cursor-pointer">
                                                <div className="text-white text-center">
                                                    <div className="bg-white/20 rounded-full p-3 mb-2 group-hover:bg-white/30 transition-colors">
                                                        <Play className="w-8 h-8 mx-auto" />
                                                    </div>
                                                    <p className="text-sm font-medium">{selectedLesson.title}</p>
                                                    <p className="text-xs opacity-75 mt-1">Nhấn để xem trước video</p>
                                                </div>
                                            </div>

                                            <div className="bg-white p-2 rounded border">
                                                <p className="text-xs text-gray-600 mb-1">URL video:</p>
                                                <p className="text-xs text-blue-600 break-all font-mono">
                                                    {selectedLesson.videoLesson?.videoUrl || 'Chưa có URL video'}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Lesson Info */}
                            <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg text-sm">
                                <div>
                                    <span className="text-xs font-medium text-gray-500">Thứ tự:</span>
                                    <p className="text-gray-900 font-mono">#{selectedLesson.orderIndex}</p>
                                </div>
                                <div>
                                    <span className="text-xs font-medium text-gray-500">Xuất bản:</span>
                                    <p className="text-gray-900">{selectedLesson.isPublish ? 'Có' : 'Không'}</p>
                                </div>
                                <div>
                                    <span className="text-xs font-medium text-gray-500">Ngày tạo:</span>
                                    <p className="text-gray-900 text-xs">
                                        {new Date(selectedLesson.createdAt).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs font-medium text-gray-500">Cập nhật:</span>
                                    <p className="text-gray-900 text-xs">
                                        {new Date(selectedLesson.updatedAt).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Không duyệt bài học</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Lý do từ chối <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    rows={4}
                                    placeholder="Nhập lý do từ chối bài học..."
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setRejectionReason('');
                                    }}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={isProcessing || !rejectionReason.trim()}
                                    className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg flex items-center disabled:opacity-50 transition-colors"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        'Xác nhận từ chối'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}