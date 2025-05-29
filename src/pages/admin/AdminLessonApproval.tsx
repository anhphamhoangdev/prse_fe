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
    Code,
    HelpCircle,
    FileText,
    CheckCircle,
    Copy,
    Terminal,
} from 'lucide-react';
import { useNotification } from '../../components/notification/NotificationProvider';

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

interface CodeLessonDetails {
    id: number;
    lessonDraftId: number;
    content: string;
    language: string;
    testCases: Array<{
        id: number;
        input: string;
        expectedOutput: string;
        description: string;
    }>;
    initialCode: string;
    solutionCode: string;
    createdAt: string;
    updatedAt: string;
}

interface QuizQuestion {
    id: number;
    question: string;
    type: 'multiple_choice' | 'single_choice' | 'true_false';
    options: Array<{
        id: number;
        text: string;
        isCorrect: boolean;
    }>;
    explanation: string;
}

interface QuizzLessonDetails {
    id: number;
    lessonDraftId: number;
    timeLimit: number;
    passingScore: number;
    questions: QuizQuestion[];
    createdAt: string;
    updatedAt: string;
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
    const [lessonDetails, setLessonDetails] = useState<VideoLessonDetails | CodeLessonDetails | QuizzLessonDetails | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showQuickViewModal, setShowQuickViewModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const [showInlineRejectForm, setShowInlineRejectForm] = useState(false);

    const {showNotification} = useNotification();

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

    const handleApprove = async (lessonId: number) => {
        setIsProcessing(true);
        try {
            await patchAdminWithAuth(
                `${ENDPOINTS.ADMIN.LESSONS_DRAFT}/${lessonId}/approve`,
                {}
            );

            // Cập nhật trạng thái thay vì xóa
            setAllLessons(prevLessons =>
                prevLessons.map(lesson =>
                    lesson.id === lessonId
                        ? { ...lesson, status: 'approved' as LessonStatus }
                        : lesson
                )
            );

            showNotification('success', 'Thành công', 'Đã duyệt bài học');
            setShowQuickViewModal(false);

            // Reload dữ liệu để đảm bảo sync với server
            await fetchLessons();
        } catch (error) {
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
            await patchAdminWithAuth(
                `${ENDPOINTS.ADMIN.LESSONS_DRAFT}/${selectedLesson?.id}/reject`,
                {rejectedReason: rejectionReason}
            );

            // Cập nhật trạng thái thay vì xóa
            setAllLessons(prevLessons =>
                prevLessons.map(lesson =>
                    lesson.id === selectedLesson?.id
                        ? {
                            ...lesson,
                            status: 'rejected' as LessonStatus,
                            rejectedReason: rejectionReason
                        }
                        : lesson
                )
            );

            setShowRejectModal(false);
            setRejectionReason('');
            showNotification('success', 'Thành công', 'Đã từ chối bài học');
            setShowQuickViewModal(false);

            // Reload dữ liệu để đảm bảo sync với server
            await fetchLessons();
        } catch (error) {
            showNotification('error', 'Thất bại', 'Có lỗi xảy ra khi từ chối bài học');
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
            await patchAdminWithAuth(
                `${ENDPOINTS.ADMIN.LESSONS_DRAFT}/${selectedLesson?.id}/reject`,
                {rejectedReason: rejectionReason}
            );

            setAllLessons(prevLessons =>
                prevLessons.map(lesson =>
                    lesson.id === selectedLesson?.id
                        ? {
                            ...lesson,
                            status: 'rejected' as LessonStatus,
                            rejectedReason: rejectionReason
                        }
                        : lesson
                )
            );

            setShowInlineRejectForm(false);
            setRejectionReason('');
            showNotification('success', 'Thành công', 'Đã từ chối bài học');
            setShowQuickViewModal(false);

            await fetchLessons();
        } catch (error) {
            showNotification('error', 'Thất bại', 'Có lỗi xảy ra khi từ chối bài học');
        } finally {
            setIsProcessing(false);
        }
    };

    const closeQuickView = () => {
        setShowQuickViewModal(false);
        setShowInlineRejectForm(false);
        setRejectionReason('');
    };

    const fetchLessonDetails = async (lesson: LessonDraft) => {
        try {
            setDetailsLoading(true);

            if (lesson.type === 'video') {
                const response = await requestAdminWithAuth<VideoLessonDetailsResponse>(
                    `${ENDPOINTS.ADMIN.VIDEO_LESSONS_DRAFT}?lessonDraftId=${lesson.id}`
                );
                return response.videoLesson || null;
            }
            // } else if (lesson.type === 'code') {
            //     const response = await requestAdminWithAuth(
            //         `${ENDPOINTS.ADMIN.CODE_LESSONS_DRAFT}?lessonDraftId=${lesson.id}`
            //     );
            //     return response.data?.codeLesson || null;
            // } else if (lesson.type === 'quizz') {
            //     const response = await requestAdminWithAuth(
            //         `${ENDPOINTS.ADMIN.QUIZZ_LESSONS_DRAFT}?lessonDraftId=${lesson.id}`
            //     );
            //     return response.data?.quizzLesson || null;
            // }

            return null;
        } catch (error) {
            console.error('Error fetching lesson details:', error);
            showNotification('error', 'Lỗi', 'Không thể tải chi tiết bài học');
            return null;
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleQuickView = async (lesson: LessonDraft) => {
        setSelectedLesson(lesson);
        setLessonDetails(null);
        setShowQuickViewModal(true);

        const details = await fetchLessonDetails(lesson);
        setLessonDetails(details);
    };

    const getTypeIcon = (type: LessonType) => {
        switch (type) {
            case 'video':
                return <Video className="w-5 h-5 text-blue-600"/>;
            case 'code':
                return <Code className="w-5 h-5 text-green-600"/>;
            case 'quizz':
                return <HelpCircle className="w-5 h-5 text-purple-600"/>;
            default:
                return <BookOpen className="w-5 h-5 text-gray-600"/>;
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

    const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const formatTime = (minutes: number) => {
        if (minutes < 60) {
            return `${minutes} phút`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}m`;
    };

    const copyToClipboard = async (text: string, message: string) => {
        try {
            await navigator.clipboard.writeText(text);
            showNotification('success', 'Thành công', message);
        } catch (error) {
            showNotification('error', 'Lỗi', 'Không thể sao chép');
        }
    };

    const renderVideoContent = (details: VideoLessonDetails) => (
        <div className="space-y-4">
            <div className="bg-black rounded-lg overflow-hidden">
                <video
                    controls
                    className="w-full h-64 sm:h-80"
                    preload="metadata"
                >
                    <source src={details.videoUrl} type="video/mp4"/>
                    Trình duyệt của bạn không hỗ trợ phát video.
                </video>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <Play className="w-4 h-4 text-blue-600"/>
                        <span className="font-medium text-blue-800">Thời lượng</span>
                    </div>
                    <p className="text-sm text-blue-700">
                        {formatDuration(details.duration)}
                    </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <Video className="w-4 h-4 text-green-600"/>
                        <span className="font-medium text-green-800">Video ID</span>
                    </div>
                    <p className="text-sm text-green-700">
                        #{details.id}
                    </p>
                </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                    <Video className="w-4 h-4 text-gray-600"/>
                    <span className="font-medium">URL Video</span>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={details.videoUrl}
                        readOnly
                        className="flex-1 text-xs bg-white border border-gray-200 rounded px-2 py-1 text-gray-600"
                    />
                    <button
                        onClick={() => copyToClipboard(details.videoUrl, 'Đã sao chép URL video')}
                        className="px-2 py-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 rounded flex items-center gap-1"
                    >
                        <Copy className="w-3 h-3"/>
                        Sao chép
                    </button>
                </div>
            </div>
        </div>
    );

    const renderCodeContent = (details: CodeLessonDetails) => (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <Terminal className="w-4 h-4 text-green-600"/>
                        <span className="font-medium text-green-800">Ngôn ngữ</span>
                    </div>
                    <p className="text-sm text-green-700 capitalize">
                        {details.language}
                    </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-blue-600"/>
                        <span className="font-medium text-blue-800">Test Cases</span>
                    </div>
                    <p className="text-sm text-blue-700">
                        {details.testCases?.length || 0} test cases
                    </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <Code className="w-4 h-4 text-purple-600"/>
                        <span className="font-medium text-purple-800">Code ID</span>
                    </div>
                    <p className="text-sm text-purple-700">
                        #{details.id}
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-600"/>
                            Mô tả bài tập
                        </h5>
                        <button
                            onClick={() => copyToClipboard(details.content, 'Đã sao chép mô tả')}
                            className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded flex items-center gap-1"
                        >
                            <Copy className="w-3 h-3"/>
                            Sao chép
                        </button>
                    </div>
                    <div className="bg-white p-3 rounded border text-sm whitespace-pre-wrap">
                        {details.content}
                    </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium flex items-center gap-2">
                            <Code className="w-4 h-4 text-gray-600"/>
                            Code khởi tạo
                        </h5>
                        <button
                            onClick={() => copyToClipboard(details.initialCode, 'Đã sao chép code khởi tạo')}
                            className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded flex items-center gap-1"
                        >
                            <Copy className="w-3 h-3"/>
                            Sao chép
                        </button>
                    </div>
                    <div className="bg-gray-900 p-3 rounded overflow-x-auto">
                        <pre className="text-green-400 text-sm">
                            <code>{details.initialCode}</code>
                        </pre>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-gray-600"/>
                            Lời giải mẫu
                        </h5>
                        <button
                            onClick={() => copyToClipboard(details.solutionCode, 'Đã sao chép lời giải')}
                            className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded flex items-center gap-1"
                        >
                            <Copy className="w-3 h-3"/>
                            Sao chép
                        </button>
                    </div>
                    <div className="bg-gray-900 p-3 rounded overflow-x-auto">
                        <pre className="text-green-400 text-sm">
                            <code>{details.solutionCode}</code>
                        </pre>
                    </div>
                </div>

                {details.testCases && details.testCases.length > 0 && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h5 className="font-medium mb-3 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-gray-600"/>
                            Test Cases ({details.testCases.length})
                        </h5>
                        <div className="space-y-3">
                            {details.testCases.map((testCase, index) => (
                                <div key={testCase.id} className="bg-white p-3 rounded border">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-medium text-sm">Test Case #{index + 1}</span>
                                        {testCase.description && (
                                            <span className="text-xs text-gray-500">- {testCase.description}</span>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="font-medium text-gray-600">Input:</span>
                                            <div className="bg-gray-100 p-2 rounded mt-1 font-mono">
                                                {testCase.input}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-600">Expected Output:</span>
                                            <div className="bg-gray-100 p-2 rounded mt-1 font-mono">
                                                {testCase.expectedOutput}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    const renderQuizContent = (details: QuizzLessonDetails) => (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-purple-600"/>
                        <span className="font-medium text-purple-800">Thời gian</span>
                    </div>
                    <p className="text-sm text-purple-700">
                        {formatTime(details.timeLimit)}
                    </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-green-600"/>
                        <span className="font-medium text-green-800">Điểm qua</span>
                    </div>
                    <p className="text-sm text-green-700">
                        {details.passingScore}%
                    </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <HelpCircle className="w-4 h-4 text-blue-600"/>
                        <span className="font-medium text-blue-800">Câu hỏi</span>
                    </div>
                    <p className="text-sm text-blue-700">
                        {details.questions?.length || 0} câu
                    </p>
                </div>
            </div>

            {details.questions && details.questions.length > 0 && (
                <div className="space-y-4">
                    <h5 className="font-medium flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-gray-600"/>
                        Danh sách câu hỏi
                    </h5>
                    {details.questions.map((question, index) => (
                        <div key={question.id} className="p-4 bg-gray-50 rounded-lg">
                            <div className="mb-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="font-medium">Câu {index + 1}:</span>
                                    <span className="text-xs bg-gray-200 px-2 py-1 rounded capitalize">
                                        {question.type.replace('_', ' ')}
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-gray-900">{question.question}</p>
                            </div>

                            {question.options && question.options.length > 0 && (
                                <div className="mb-3">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Các lựa chọn:</p>
                                    <div className="space-y-2">
                                        {question.options.map((option, optIndex) => (
                                            <div
                                                key={option.id}
                                                className={`p-2 rounded text-sm flex items-center gap-2 ${
                                                    option.isCorrect
                                                        ? 'bg-green-100 border border-green-200'
                                                        : 'bg-white border border-gray-200'
                                                }`}
                                            >
                                                <span className="font-medium text-gray-600">
                                                    {String.fromCharCode(65 + optIndex)}.
                                                </span>
                                                <span
                                                    className={option.isCorrect ? 'text-green-800 font-medium' : 'text-gray-700'}>
                                                    {option.text}
                                                </span>
                                                {option.isCorrect && (
                                                    <CheckCircle className="w-4 h-4 text-green-600 ml-auto"/>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {question.explanation && (
                                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                                    <p className="text-sm font-medium text-blue-800 mb-1">Giải thích:</p>
                                    <p className="text-sm text-blue-700">{question.explanation}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderLessonContent = () => {
        if (detailsLoading) {
            return (
                <div className="bg-gray-100 rounded-lg p-6 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2"/>
                    <p className="text-sm text-gray-600">Đang tải chi tiết bài học...</p>
                </div>
            );
        }

        if (!lessonDetails) {
            return (
                <div className="bg-red-50 rounded-lg p-6 text-center">
                    <div className="text-red-400 mb-2">
                        {getTypeIcon(selectedLesson!.type)}
                    </div>
                    <p className="text-sm text-red-600">Không thể tải thông tin bài học</p>
                    <p className="text-xs text-red-500 mt-1">
                        Vui lòng thử lại hoặc kiểm tra kết nối
                    </p>
                </div>
            );
        }

        switch (selectedLesson!.type) {
            case 'video':
                return renderVideoContent(lessonDetails as VideoLessonDetails);
            case 'code':
                return renderCodeContent(lessonDetails as CodeLessonDetails);
            case 'quizz':
                return renderQuizContent(lessonDetails as QuizzLessonDetails);
            default:
                return (
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                        <div className="text-gray-400 mb-2">
                            {getTypeIcon(selectedLesson!.type)}
                        </div>
                        <p className="text-sm text-gray-600">
                            Loại bài học không được hỗ trợ
                        </p>
                    </div>
                );
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500"/>
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
                        <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600"/>
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
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
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
                    <RefreshCcw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}/>
                    Làm mới
                </button>
            </div>

            {/* Table */}
            {filteredLessons.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4"/>
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
                                        <div className="flex items-center gap-2">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{lesson.title}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-gray-400"/>
                                            <div>
                                                <div
                                                    className="text-sm font-medium text-gray-900">{lesson.instructor.name}</div>
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
                                                <Eye className="w-5 h-5"/>
                                            </button>
                                            {lesson.status === 'new' && (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(lesson.id)}
                                                        disabled={isProcessing}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                                                        title="Duyệt"
                                                    >
                                                        <Check className="w-5 h-5"/>
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedLesson(lesson);
                                                            setShowRejectModal(true);
                                                        }}
                                                        disabled={isProcessing}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                                                        title="Từ chối"
                                                    >
                                                        <X className="w-5 h-5"/>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}


            {/* Quick View Modal */}
            {showQuickViewModal && selectedLesson && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-7xl w-full max-h-[95vh] overflow-y-auto">
                        {/* Header */}
                        <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
                            <div className="flex items-center gap-3">
                                {getTypeIcon(selectedLesson.type)}
                                <div>
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">{selectedLesson.title}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        {getStatusBadge(selectedLesson.status)}
                                        <span className="text-sm text-gray-500">
                                {getTypeLabel(selectedLesson.type)} • {selectedLesson.instructor.name}
                            </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowQuickViewModal(false)}
                                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5"/>
                            </button>
                        </div>

                        <div className="p-4 sm:p-6">
                            {/* Video Type - Enhanced Layout */}
                            {selectedLesson.type === 'video' && (
                                <div className="space-y-6">
                                    {detailsLoading ? (
                                        <div className="bg-gray-100 rounded-xl p-8 text-center">
                                            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3"/>
                                            <p className="text-gray-600 text-sm">Đang tải thông tin video...</p>
                                        </div>
                                    ) : lessonDetails ? (
                                        <>
                                            {/* Main Video + Action Section */}
                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                {/* Video Player - 2/3 width */}
                                                <div className="lg:col-span-2">
                                                    <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-4">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <Play className="w-5 h-5 text-white"/>
                                                            <h4 className="font-semibold text-white">Video Bài Học</h4>
                                                        </div>
                                                        <div className="bg-black rounded-lg overflow-hidden shadow-lg">
                                                            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                                                                <video
                                                                    controls
                                                                    className="absolute top-0 left-0 w-full h-full object-contain"
                                                                    preload="metadata"
                                                                >
                                                                    <source src={(lessonDetails as VideoLessonDetails).videoUrl} type="video/mp4"/>
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
                                                            <Video className="w-5 h-5 text-blue-600"/>
                                                            Thông tin video
                                                        </h4>
                                                        <div className="space-y-3">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm text-gray-600">Thời lượng:</span>
                                                                <span className="font-medium text-blue-700">
                                                        {formatDuration((lessonDetails as VideoLessonDetails).duration)}
                                                    </span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm text-gray-600">Video ID:</span>
                                                                <span className="font-medium text-green-700">
                                                        #{(lessonDetails as VideoLessonDetails).id}
                                                    </span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm text-gray-600">Thứ tự:</span>
                                                                <span className="font-medium text-purple-700">
                                                        #{selectedLesson.orderIndex}
                                                    </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    {selectedLesson.status === 'new' && (
                                                        <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
                                                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                                <CheckCircle className="w-5 h-5 text-gray-600"/>
                                                                Hành động duyệt
                                                            </h4>
                                                            <div className="space-y-3">
                                                                <button
                                                                    onClick={() => handleApprove(selectedLesson.id)}
                                                                    disabled={isProcessing}
                                                                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 font-medium transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                                                                >
                                                                    {isProcessing ? (
                                                                        <>
                                                                            <Loader2 className="w-5 h-5 animate-spin"/>
                                                                            Đang duyệt...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Check className="w-5 h-5"/>
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
                                                                        <X className="w-5 h-5"/>
                                                                        Từ chối
                                                                    </button>
                                                                ) : (
                                                                    <div className="space-y-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                                                        <div className="flex items-center gap-2 text-red-800">
                                                                            <X className="w-4 h-4"/>
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
                                                                                        <Loader2 className="w-4 h-4 animate-spin"/>
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
                                                            <User className="w-5 h-5 text-gray-600"/>
                                                            Giảng viên
                                                        </h4>
                                                        <div className="space-y-2">
                                                            <p className="font-medium text-gray-900">{selectedLesson.instructor.name}</p>
                                                            <p className="text-sm text-blue-600">{selectedLesson.instructor.email}</p>
                                                            <p className="text-xs text-gray-500">
                                                                Tạo: {new Date(selectedLesson.createdAt).toLocaleDateString('vi-VN')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* AI Analysis Section */}
                                            {((lessonDetails as VideoLessonDetails).content !== undefined || (lessonDetails as VideoLessonDetails).responseFromAI !== undefined) && (
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
                                                                    <FileText className="w-4 h-4 text-purple-600"/>
                                                                    Nội dung phân tích
                                                                </h5>
                                                                {(lessonDetails as VideoLessonDetails).content && (
                                                                    <button
                                                                        onClick={() => copyToClipboard((lessonDetails as VideoLessonDetails).content, 'Đã sao chép nội dung phân tích')}
                                                                        className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-600 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                                                                    >
                                                                        <Copy className="w-3 h-3"/>
                                                                        Sao chép
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <div className="bg-gray-50 rounded p-3 text-sm text-gray-700 max-h-40 overflow-y-auto">
                                                                {(lessonDetails as VideoLessonDetails).content ? (
                                                                    <div
                                                                        className="whitespace-pre-wrap prose prose-sm max-w-none"
                                                                        dangerouslySetInnerHTML={{
                                                                            __html: (lessonDetails as VideoLessonDetails).content
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
                                                                {(lessonDetails as VideoLessonDetails).responseFromAI && (
                                                                    <button
                                                                        onClick={() => copyToClipboard((lessonDetails as VideoLessonDetails).responseFromAI, 'Đã sao chép đánh giá AI')}
                                                                        className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-600 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                                                                    >
                                                                        <Copy className="w-3 h-3"/>
                                                                        Sao chép
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded p-3 text-sm text-gray-700 max-h-40 overflow-y-auto border border-purple-100">
                                                                {(lessonDetails as VideoLessonDetails).responseFromAI ? (
                                                                    <div
                                                                        className="whitespace-pre-wrap prose prose-sm max-w-none"
                                                                        dangerouslySetInnerHTML={{
                                                                            __html: (lessonDetails as VideoLessonDetails).responseFromAI
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
                                                        {((lessonDetails as VideoLessonDetails).content && (lessonDetails as VideoLessonDetails).responseFromAI) ? (
                                                            <p className="text-sm text-purple-800 flex items-center gap-2">
                                                                <CheckCircle className="w-4 h-4"/>
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

                                            {/* Additional Details - Expandable */}
                                            <div className="space-y-4">
                                                {/* Video URL Section */}
                                                <div className="bg-white rounded-xl border border-gray-200 p-4">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Video className="w-5 h-5 text-gray-600"/>
                                                        <h4 className="font-semibold text-gray-900">URL Video</h4>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            value={(lessonDetails as VideoLessonDetails).videoUrl}
                                                            readOnly
                                                            className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded px-3 py-2 text-gray-600 font-mono"
                                                        />
                                                        <button
                                                            onClick={() => copyToClipboard((lessonDetails as VideoLessonDetails).videoUrl, 'Đã sao chép URL video')}
                                                            className="px-3 py-2 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded flex items-center gap-1 transition-colors"
                                                        >
                                                            <Copy className="w-4 h-4"/>
                                                            Sao chép
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Rejection Reason */}
                                                {selectedLesson.status === 'rejected' && selectedLesson.rejectedReason && (
                                                    <div className="bg-red-50 rounded-xl border border-red-200 p-4">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <X className="w-5 h-5 text-red-600"/>
                                                            <h4 className="font-semibold text-red-800">Lý do từ chối</h4>
                                                        </div>
                                                        <p className="text-sm text-red-700">{selectedLesson.rejectedReason}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="bg-red-50 rounded-xl p-8 text-center border border-red-200">
                                            <Video className="w-12 h-12 text-red-400 mx-auto mb-3"/>
                                            <p className="text-red-800 font-medium mb-2">Không thể tải thông tin video</p>
                                            <p className="text-red-600 text-sm">Vui lòng thử lại hoặc kiểm tra kết nối</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Non-Video Types - Keep existing layout */}
                            {selectedLesson.type !== 'video' && (
                                <div className="space-y-6">
                                    {/* Standard info for non-video types */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <User className="w-4 h-4 text-gray-600"/>
                                                <span className="font-medium">Giảng viên</span>
                                            </div>
                                            <p className="text-sm">{selectedLesson.instructor.name}</p>
                                            <p className="text-sm text-gray-600">{selectedLesson.instructor.email}</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Clock className="w-4 h-4 text-gray-600"/>
                                                <span className="font-medium">Thông tin</span>
                                            </div>
                                            <p className="text-sm">Thứ tự: #{selectedLesson.orderIndex}</p>
                                            <p className="text-sm">Loại: {getTypeLabel(selectedLesson.type)}</p>
                                            <p className="text-sm">Xuất bản: {selectedLesson.isPublish ? 'Có' : 'Không'}</p>
                                            <p className="text-sm">Tạo: {new Date(selectedLesson.createdAt).toLocaleDateString('vi-VN')}</p>
                                        </div>
                                    </div>

                                    {selectedLesson.status === 'rejected' && selectedLesson.rejectedReason && (
                                        <div className="p-4 bg-red-50 rounded-lg">
                                            <h4 className="font-medium text-red-800 mb-2">Lý do từ chối</h4>
                                            <p className="text-sm text-red-700">{selectedLesson.rejectedReason}</p>
                                        </div>
                                    )}

                                    {/* Content preview section */}
                                    <div>
                                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                                            {getTypeIcon(selectedLesson.type)}
                                            Nội dung {getTypeLabel(selectedLesson.type).toLowerCase()}
                                        </h4>
                                        {renderLessonContent()}
                                    </div>

                                    {selectedLesson.status === 'new' && (
                                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                            <button
                                                onClick={() => setShowRejectModal(true)}
                                                disabled={isProcessing}
                                                className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg disabled:opacity-50 flex items-center gap-2"
                                            >
                                                <X className="w-4 h-4"/>
                                                Không duyệt
                                            </button>
                                            <button
                                                onClick={() => handleApprove(selectedLesson.id)}
                                                disabled={isProcessing}
                                                className="px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {isProcessing ? (
                                                    <Loader2 className="w-4 h-4 animate-spin"/>
                                                ) : (
                                                    <Check className="w-4 h-4"/>
                                                )}
                                                Duyệt
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-70 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Từ chối bài học</h3>
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
                                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={isProcessing || !rejectionReason.trim()}
                                    className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin"/>
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