import React, { useState, useEffect } from 'react';
import { requestAdminWithAuth } from '../../utils/request';
import { ENDPOINTS } from '../../constants/endpoint';
import {
    X,
    Loader2,
    Code,
    Terminal,
    CheckCircle,
    Copy,
    FileText,
    Check,
    User,
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

interface CodeLessonDetails {
    id: number;
    lessonDraftId: number;
    language: string;
    content: string;
    initialCode: string;
    solutionCode: string;
    expectedOutput: string;
    hints: string;
    difficultyLevel: 'EASY' | 'MEDIUM' | 'HARD';
    testCaseInput: string;
    testCaseOutput: string;
    testCaseDescription: string;
    createdAt: string;
    updatedAt: string;
}

interface CodeLessonDetailsResponse {
    codeLessonDraft: CodeLessonDetails;
}

interface CodeQuickViewModalProps {
    lesson: LessonDraft;
    onClose: () => void;
    onApprove: (lessonId: number) => Promise<void>;
    onReject: (lessonId: number, reason: string) => Promise<void>;
}

export default function CodeQuickViewModal({ lesson, onClose, onApprove, onReject }: CodeQuickViewModalProps) {
    const [lessonDetails, setLessonDetails] = useState<CodeLessonDetails | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showInlineRejectForm, setShowInlineRejectForm] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const {showNotification} = useNotification();

    useEffect(() => {
        fetchLessonDetails();
    }, [lesson.id]);

    const fetchLessonDetails = async () => {
        try {
            setDetailsLoading(true);
            const response = await requestAdminWithAuth<CodeLessonDetailsResponse>(
                `${ENDPOINTS.ADMIN.CODE_LESSONS_DRAFT}?lessonDraftId=${lesson.id}`
            );
            setLessonDetails(response.codeLessonDraft || null);
        } catch (error) {
            console.error('Error fetching code lesson details:', error);
            showNotification('error', 'Lỗi', 'Không thể tải chi tiết bài học code');
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

    const copyToClipboard = async (text: string, message: string) => {
        try {
            await navigator.clipboard.writeText(text);
            showNotification('success', 'Thành công', message);
        } catch (error) {
            showNotification('error', 'Lỗi', 'Không thể sao chép');
        }
    };

    const getDifficultyBadge = (level: string) => {
        const styles: Record<string, string> = {
            EASY: 'bg-green-100 text-green-800',
            MEDIUM: 'bg-yellow-100 text-yellow-800',
            HARD: 'bg-red-100 text-red-800',
        };
        const labels: Record<string, string> = {
            EASY: 'Dễ',
            MEDIUM: 'Trung bình',
            HARD: 'Khó',
        };
        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[level] || 'bg-gray-100 text-gray-800'}`}>
                {labels[level] || level}
            </span>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-7xl w-full max-h-[95vh] overflow-y-auto">
                {/* Header */}
                <div
                    className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-green-50 to-emerald-50">
                    <div className="flex items-center gap-3">
                        <Code className="w-5 h-5 text-green-600"/>
                        <div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900">{lesson.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                {lessonDetails && getDifficultyBadge(lessonDetails.difficultyLevel)}
                                <span className="text-sm text-gray-500">
                                    Code • {lesson.instructor.name}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5"/>
                    </button>
                </div>

                <div className="p-4 sm:p-6">
                    {detailsLoading ? (
                        <div className="bg-gray-100 rounded-xl p-8 text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-green-500 mx-auto mb-3"/>
                            <p className="text-gray-600 text-sm">Đang tải thông tin bài tập code...</p>
                        </div>
                    ) : lessonDetails ? (
                        <div className="space-y-6">
                            {/* Main Content + Action Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                {/* Code Content - 3/4 width */}
                                <div className="lg:col-span-3 space-y-6">
                                    {/* Basic Info */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="p-3 bg-green-50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Terminal className="w-4 h-4 text-green-600"/>
                                                <span className="font-medium text-green-800">Ngôn ngữ</span>
                                            </div>
                                            <p className="text-sm text-green-700 uppercase">
                                                {lessonDetails.language}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-yellow-50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <CheckCircle className="w-4 h-4 text-yellow-600"/>
                                                <span className="font-medium text-yellow-800">Độ khó</span>
                                            </div>
                                            <div className="text-sm">
                                                {getDifficultyBadge(lessonDetails.difficultyLevel)}
                                            </div>
                                        </div>
                                        <div className="p-3 bg-purple-50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Code className="w-4 h-4 text-purple-600"/>
                                                <span className="font-medium text-purple-800">Code ID</span>
                                            </div>
                                            <p className="text-sm text-purple-700">
                                                #{lessonDetails.id}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Problem Description */}
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <h5 className="font-medium flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-gray-600"/>
                                                Mô tả bài tập
                                            </h5>
                                            <button
                                                onClick={() => copyToClipboard(lessonDetails.content, 'Đã sao chép mô tả')}
                                                className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded flex items-center gap-1"
                                            >
                                                <Copy className="w-3 h-3"/>
                                                Sao chép
                                            </button>
                                        </div>
                                        <div
                                            className="bg-white p-3 rounded border text-sm whitespace-pre-wrap max-h-40 overflow-y-auto">
                                            {lessonDetails.content}
                                        </div>
                                    </div>

                                    {/* Initial Code */}
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <h5 className="font-medium flex items-center gap-2">
                                                <Code className="w-4 h-4 text-gray-600"/>
                                                Code khởi tạo
                                            </h5>
                                            <button
                                                onClick={() => copyToClipboard(lessonDetails.initialCode, 'Đã sao chép code khởi tạo')}
                                                className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded flex items-center gap-1"
                                            >
                                                <Copy className="w-3 h-3"/>
                                                Sao chép
                                            </button>
                                        </div>
                                        <div className="bg-gray-900 p-3 rounded overflow-x-auto max-h-60">
                                            <pre className="text-green-400 text-sm">
                                                <code>{lessonDetails.initialCode}</code>
                                            </pre>
                                        </div>
                                    </div>

                                    {/* Solution Code */}
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <h5 className="font-medium flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-gray-600"/>
                                                Lời giải mẫu
                                            </h5>
                                            <button
                                                onClick={() => copyToClipboard(lessonDetails.solutionCode, 'Đã sao chép lời giải')}
                                                className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded flex items-center gap-1"
                                            >
                                                <Copy className="w-3 h-3"/>
                                                Sao chép
                                            </button>
                                        </div>
                                        <div className="bg-gray-900 p-3 rounded overflow-x-auto max-h-60">
                                            <pre className="text-green-400 text-sm">
                                                <code>{lessonDetails.solutionCode}</code>
                                            </pre>
                                        </div>
                                    </div>

                                    {/* Hints Section */}
                                    {lessonDetails.hints && (
                                        <div className="p-4 bg-blue-50 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <h5 className="font-medium flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-blue-600" fill="none"
                                                         stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              strokeWidth={2}
                                                              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                                                    </svg>
                                                    Gợi ý
                                                </h5>
                                                <button
                                                    onClick={() => copyToClipboard(lessonDetails.hints, 'Đã sao chép gợi ý')}
                                                    className="text-xs bg-blue-200 hover:bg-blue-300 px-2 py-1 rounded flex items-center gap-1"
                                                >
                                                    <Copy className="w-3 h-3"/>
                                                    Sao chép
                                                </button>
                                            </div>
                                            <div
                                                className="bg-white p-3 rounded border text-sm whitespace-pre-wrap max-h-32 overflow-y-auto">
                                                {lessonDetails.hints}
                                            </div>
                                        </div>
                                    )}

                                    {/* Expected Output */}
                                    {lessonDetails.expectedOutput && (
                                        <div className="p-4 bg-indigo-50 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <h5 className="font-medium flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4 text-indigo-600"/>
                                                    Kết quả mong đợi
                                                </h5>
                                                <button
                                                    onClick={() => copyToClipboard(lessonDetails.expectedOutput, 'Đã sao chép kết quả mong đợi')}
                                                    className="text-xs bg-indigo-200 hover:bg-indigo-300 px-2 py-1 rounded flex items-center gap-1"
                                                >
                                                    <Copy className="w-3 h-3"/>
                                                    Sao chép
                                                </button>
                                            </div>
                                            <div className="bg-white p-3 rounded border text-sm font-mono">
                                                {lessonDetails.expectedOutput}
                                            </div>
                                        </div>
                                    )}

                                    {/* Test Case */}
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <h5 className="font-medium mb-3 flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-gray-600"/>
                                            Test Case
                                        </h5>
                                        <div className="bg-white p-3 rounded border">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-medium text-sm">Test Case #1</span>
                                                {lessonDetails.testCaseDescription && (
                                                    <span
                                                        className="text-xs text-gray-500">- {lessonDetails.testCaseDescription}</span>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <span className="font-medium text-gray-600">Input:</span>
                                                    <div className="bg-gray-100 p-2 rounded mt-1 font-mono text-xs">
                                                        {lessonDetails.testCaseInput}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-600">Expected Output:</span>
                                                    <div className="bg-gray-100 p-2 rounded mt-1 font-mono text-xs">
                                                        {lessonDetails.testCaseOutput}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Panel - 1/4 width */}
                                <div className="space-y-4">
                                    {/* Quick Info */}
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-4">
                                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <Code className="w-5 h-5 text-green-600"/>
                                            Thông tin bài tập
                                        </h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Ngôn ngữ:</span>
                                                <span className="font-medium text-green-700 uppercase">
                                                    {lessonDetails.language}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Độ khó:</span>
                                                <div>
                                                    {getDifficultyBadge(lessonDetails.difficultyLevel)}
                                                </div>
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
                                                <CheckCircle className="w-5 h-5 text-gray-600"/>
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
                                                    <div
                                                        className="space-y-3 p-3 bg-red-50 rounded-lg border border-red-200">
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
                                            <p className="font-medium text-gray-900">{lesson.instructor.name}</p>
                                            <p className="text-sm text-blue-600">{lesson.instructor.email}</p>
                                            <p className="text-xs text-gray-500">
                                                Tạo: {new Date(lesson.createdAt).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Rejection Reason */}
                                    {lesson.status === 'rejected' && lesson.rejectedReason && (
                                        <div className="bg-red-50 rounded-xl border border-red-200 p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <X className="w-5 h-5 text-red-600"/>
                                                <h4 className="font-semibold text-red-800">Lý do từ chối</h4>
                                            </div>
                                            <p className="text-sm text-red-700">{lesson.rejectedReason}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-red-50 rounded-xl p-8 text-center border border-red-200">
                            <Code className="w-12 h-12 text-red-400 mx-auto mb-3"/>
                            <p className="text-red-800 font-medium mb-2">Không thể tải thông tin bài tập</p>
                            <p className="text-red-600 text-sm">Vui lòng thử lại hoặc kiểm tra kết nối</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}