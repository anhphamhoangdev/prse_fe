import React, { useState, useEffect } from 'react';
import { requestAdminWithAuth } from '../../utils/request';
import { ENDPOINTS } from '../../constants/endpoint';
import {
    X,
    Loader2,
    Play,
    Video,
    User,
    CheckCircle,
    Copy,
    FileText,
    Check,
} from 'lucide-react';
import { useNotification } from '../notification/NotificationProvider';

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

interface VideoLessonDetails {
    id: number;
    lessonDraftId: number;
    videoUrl: string;
    duration: number;
    createdAt: string;
    updatedAt: string;
    responseFromAI: string;
    content: string;
}

interface VideoLessonDetailsResponse {
    videoLesson: VideoLessonDetails;
}

interface VideoQuickViewModalProps {
    lesson: LessonDraft;
    onClose: () => void;
    onApprove: (lessonId: number) => Promise<void>;
    onReject: (lessonId: number, reason: string) => Promise<void>;
}

export default function VideoQuickViewModal({ lesson, onClose, onApprove, onReject }: VideoQuickViewModalProps) {
    const [lessonDetails, setLessonDetails] = useState<VideoLessonDetails | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showInlineRejectForm, setShowInlineRejectForm] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const { showNotification } = useNotification();

    useEffect(() => {
        fetchLessonDetails();
    }, [lesson.id]);

    const fetchLessonDetails = async () => {
        try {
            setDetailsLoading(true);
            const response = await requestAdminWithAuth<VideoLessonDetailsResponse>(
                `${ENDPOINTS.ADMIN.VIDEO_LESSONS_DRAFT}?lessonDraftId=${lesson.id}`
            );
            setLessonDetails(response.videoLesson || null);
        } catch (error) {
            console.error('Error fetching video lesson details:', error);
            showNotification('error', 'Lỗi', 'Không thể tải chi tiết bài học video');
            setLessonDetails(null);
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleApprove = async () => {
        setIsProcessing(true);
        try {
            await onApprove(lesson.id);
        } catch (error) {
            // Error handled in parent component
        } finally {
            setIsProcessing(false);
        }
    };

    const handleInlineReject = async () => {
        if (!rejectionReason.trim()) {
            showNotification('error', 'Lỗi', 'Vui lòng nhập lý do từ chối');
            return;
        }
        setIsProcessing(true);
        try {
            await onReject(lesson.id, rejectionReason);
            setShowInlineRejectForm(false);
            setRejectionReason('');
        } catch (error) {
            // Error handled in parent component
        } finally {
            setIsProcessing(false);
        }
    };

    const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const copyToClipboard = async (text: string, message: string) => {
        try {
            await navigator.clipboard.writeText(text);
            showNotification('success', 'Thành công', message);
        } catch (error) {
            showNotification('error', 'Lỗi', 'Không thể sao chép');
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
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-7xl w-full max-h-[95vh] overflow-y-auto">
                {/* Header */}
                <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-3">
                        <Video className="w-5 h-5 text-blue-600" />
                        <div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900">{lesson.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                {getStatusBadge(lesson.status)}
                                <span className="text-sm text-gray-500">
                                    Video • {lesson.instructor.name}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 sm:p-6">
                    {detailsLoading ? (
                        <div className="bg-gray-100 rounded-xl p-8 text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
                            <p className="text-gray-600 text-sm">Đang tải thông tin video...</p>
                        </div>
                    ) : lessonDetails ? (
                        <div className="space-y-6">
                            {/* Main Video + Action Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Video Player - 2/3 width */}
                                <div className="lg:col-span-2">
                                    <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Play className="w-5 h-5 text-white" />
                                            <h4 className="font-semibold text-white">Video Bài Học</h4>
                                        </div>
                                        <div className="bg-black rounded-lg overflow-hidden shadow-lg">
                                            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                                                <video
                                                    controls
                                                    className="absolute top-0 left-0 w-full h-full object-contain"
                                                    preload="metadata"
                                                >
                                                    <source src={lessonDetails.videoUrl} type="video/mp4" />
                                                    Trình duyệt của bạn không hỗ trợ phát video.
                                                </video>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Panel - 1/3 width */}
                                <div className="space-y-4">
                                    {/* Quick Info */}
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-4">
                                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <Video className="w-5 h-5 text-blue-600" />
                                            Thông tin video
                                        </h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Thời lượng:</span>
                                                <span className="font-medium text-blue-700">
                                                    {formatDuration(lessonDetails.duration)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Video ID:</span>
                                                <span className="font-medium text-green-700">
                                                    #{lessonDetails.id}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Thứ tự:</span>
                                                <span className="font-medium text-purple-700">
                                                    #{lesson.orderIndex}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {lesson.status === 'new' && (
                                        <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
                                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                <CheckCircle className="w-5 h-5 text-gray-600" />
                                                Hành động duyệt
                                            </h4>
                                            <div className="space-y-3">
                                                <button
                                                    onClick={handleApprove}
                                                    disabled={isProcessing}
                                                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 font-medium transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                                                >
                                                    {isProcessing ? (
                                                        <>
                                                            <Loader2 className="w-5 h-5 animate-spin" />
                                                            Đang duyệt...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Check className="w-5 h-5" />
                                                            Duyệt bài học
                                                        </>
                                                    )}
                                                </button>

                                                {/* Nút từ chối và form inline */}
                                                {!showInlineRejectForm ? (
                                                    <button
                                                        onClick={() => setShowInlineRejectForm(true)}
                                                        disabled={isProcessing}
                                                        className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 font-medium transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                                                    >
                                                        <X className="w-5 h-5" />
                                                        Từ chối
                                                    </button>
                                                ) : (
                                                    <div className="space-y-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                                        <div className="flex items-center gap-2 text-red-800">
                                                            <X className="w-4 h-4" />
                                                            <span className="font-medium text-sm">Lý do từ chối</span>
                                                        </div>
                                                        <textarea
                                                            value={rejectionReason}
                                                            onChange={(e) => setRejectionReason(e.target.value)}
                                                            className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm resize-none"
                                                            rows={3}
                                                            placeholder="Nhập lý do từ chối bài học..."
                                                            disabled={isProcessing}
                                                        />
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setShowInlineRejectForm(false);
                                                                    setRejectionReason('');
                                                                }}
                                                                disabled={isProcessing}
                                                                className="flex-1 px-3 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                                            >
                                                                Hủy
                                                            </button>
                                                            <button
                                                                onClick={handleInlineReject}
                                                                disabled={isProcessing || !rejectionReason.trim()}
                                                                className="flex-1 px-3 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                                                            >
                                                                {isProcessing ? (
                                                                    <>
                                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                                        Xử lý...
                                                                    </>
                                                                ) : (
                                                                    'Xác nhận'
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Instructor Info */}
                                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <User className="w-5 h-5 text-gray-600" />
                                            Giảng viên
                                        </h4>
                                        <div className="space-y-2">
                                            <p className="font-medium text-gray-900">{lesson.instructor.name}</p>
                                            <p className="text-sm text-blue-600">{lesson.instructor.email}</p>
                                            <p className="text-xs text-gray-500">
                                                Tạo: {new Date(lesson.createdAt).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* AI Analysis Section */}
                            {(lessonDetails.content || lessonDetails.responseFromAI) && (
                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                            </svg>
                                        </div>
                                        <h4 className="font-bold text-gray-900">Phân tích AI</h4>
                                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                                            Tự động
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Content Analysis */}
                                        <div className="bg-white rounded-lg p-4 border border-purple-100">
                                            <div className="flex items-center justify-between mb-3">
                                                <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-purple-600" />
                                                    Nội dung phân tích
                                                </h5>
                                                {lessonDetails.content && (
                                                    <button
                                                        onClick={() => copyToClipboard(lessonDetails.content, 'Đã sao chép nội dung phân tích')}
                                                        className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-600 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                                                    >
                                                        <Copy className="w-3 h-3" />
                                                        Sao chép
                                                    </button>
                                                )}
                                            </div>
                                            <div className="bg-gray-50 rounded p-3 text-sm text-gray-700 max-h-40 overflow-y-auto">
                                                {lessonDetails.content ? (
                                                    <div
                                                        className="whitespace-pre-wrap prose prose-sm max-w-none"
                                                        dangerouslySetInnerHTML={{
                                                            __html: lessonDetails.content
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="flex items-center gap-2 text-gray-500 italic">
                                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-300 border-t-purple-600"></div>
                                                        Đang trong quá trình phân tích nội dung...
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* AI Response */}
                                        <div className="bg-white rounded-lg p-4 border border-purple-100">
                                            <div className="flex items-center justify-between mb-3">
                                                <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                    Đánh giá AI
                                                </h5>
                                                {lessonDetails.responseFromAI && (
                                                    <button
                                                        onClick={() => copyToClipboard(lessonDetails.responseFromAI, 'Đã sao chép đánh giá AI')}
                                                        className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-600 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                                                    >
                                                        <Copy className="w-3 h-3" />
                                                        Sao chép
                                                    </button>
                                                )}
                                            </div>
                                            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded p-3 text-sm text-gray-700 max-h-40 overflow-y-auto border border-purple-100">
                                                {lessonDetails.responseFromAI ? (
                                                    <div
                                                        className="whitespace-pre-wrap prose prose-sm max-w-none"
                                                        dangerouslySetInnerHTML={{
                                                            __html: lessonDetails.responseFromAI
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="flex items-center gap-2 text-gray-500 italic">
                                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-300 border-t-purple-600"></div>
                                                        Đang trong quá trình đánh giá AI...
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* AI Analysis Summary */}
                                    <div className="mt-4 p-3 bg-white/70 rounded-lg border border-purple-100">
                                        {(lessonDetails.content && lessonDetails.responseFromAI) ? (
                                            <p className="text-sm text-purple-800 flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4" />
                                                <span className="font-medium">AI đã phân tích video này để hỗ trợ quá trình duyệt</span>
                                            </p>
                                        ) : (
                                            <p className="text-sm text-purple-600 flex items-center gap-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-300 border-t-purple-600"></div>
                                                <span className="font-medium">AI đang phân tích video này...</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Additional Details */}
                            <div className="space-y-4">
                                {/* Video URL Section */}
                                <div className="bg-white rounded-xl border border-gray-200 p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Video className="w-5 h-5 text-gray-600" />
                                        <h4 className="font-semibold text-gray-900">URL Video</h4>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={lessonDetails.videoUrl}
                                            readOnly
                                            className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded px-3 py-2 text-gray-600 font-mono"
                                        />
                                        <button
                                            onClick={() => copyToClipboard(lessonDetails.videoUrl, 'Đã sao chép URL video')}
                                            className="px-3 py-2 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded flex items-center gap-1 transition-colors"
                                        >
                                            <Copy className="w-4 h-4" />
                                            Sao chép
                                        </button>
                                    </div>
                                </div>

                                {/* Rejection Reason */}
                                {lesson.status === 'rejected' && lesson.rejectedReason && (
                                    <div className="bg-red-50 rounded-xl border border-red-200 p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <X className="w-5 h-5 text-red-600" />
                                            <h4 className="font-semibold text-red-800">Lý do từ chối</h4>
                                        </div>
                                        <p className="text-sm text-red-700">{lesson.rejectedReason}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-red-50 rounded-xl p-8 text-center border border-red-200">
                            <Video className="w-12 h-12 text-red-400 mx-auto mb-3" />
                            <p className="text-red-800 font-medium mb-2">Không thể tải thông tin video</p>
                            <p className="text-red-600 text-sm">Vui lòng thử lại hoặc kiểm tra kết nối</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}