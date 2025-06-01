import React from 'react';
import { Check, X, Clock, MemoryStick, Play, AlertCircle, Terminal, ChevronRight, RefreshCw } from "lucide-react";

interface OutputConsoleProps {
    result: {
        success: boolean;
        output: string;
        error: string;
        executionTime: number;
        memoryUsed: number;
        status: string;
        isCorrect: boolean | null;
        actualOutput: string | null;
        expectedOutput: string | null;
        input?: string;
    } | null;
    isSubmission?: boolean;
    isRunning?: boolean; // Thêm prop để biết khi nào đang chạy
}

export const OutputConsole: React.FC<OutputConsoleProps> = ({
                                                                result,
                                                                isSubmission = false,
                                                                isRunning = false
                                                            }) => {
    // Nếu đang chạy code hoặc submit, hiển thị trạng thái loading
    if (isRunning) {
        return (
            <div className="mt-4 space-y-4">
                {/* Loading Status Header */}
                <div className="bg-blue-50 border-blue-200 border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                            <span className="font-semibold text-blue-700">
                                {isSubmission ? 'Đang nộp bài...' : 'Đang thực thi...'}
                            </span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-blue-600">
                            <Clock className="w-4 h-4" />
                            <span>Đang xử lý</span>
                        </div>
                    </div>
                </div>

                {/* Loading Message */}
                <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                        <h4 className="text-sm font-medium text-gray-900 flex items-center">
                            <Terminal className="w-4 h-4 mr-2" />
                            {isSubmission ? 'Đang nộp bài' : 'Đang chạy code'}
                        </h4>
                    </div>
                    <div className="p-4">
                        <div className="flex items-center space-x-3 text-gray-600">
                            <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
                            <div>
                                <p className="text-sm font-medium">
                                    {isSubmission
                                        ? 'Đang thực thi và chấm điểm solution của bạn...'
                                        : 'Đang thực thi code của bạn...'
                                    }
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Vui lòng chờ trong giây lát
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Nếu không có result, không hiển thị gì
    if (!result) return null;

    const getStatusConfig = () => {
        // Xử lý trạng thái loading từ result (trường hợp fallback)
        if (result.status === 'loading') {
            return {
                status: isSubmission ? 'Đang nộp bài...' : 'Đang thực thi...',
                icon: RefreshCw,
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-200',
                textColor: 'text-blue-700',
                iconColor: 'text-blue-500',
                spinning: true
            };
        }

        if (!result.success) {
            return {
                status: 'Lỗi thực thi',
                icon: AlertCircle,
                bgColor: 'bg-red-50',
                borderColor: 'border-red-200',
                textColor: 'text-red-700',
                iconColor: 'text-red-500',
                spinning: false
            };
        }

        if (result.isCorrect === true) {
            return {
                status: 'Đã chấp nhận',
                icon: Check,
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200',
                textColor: 'text-green-700',
                iconColor: 'text-green-500',
                spinning: false
            };
        }

        if (result.isCorrect === false) {
            return {
                status: 'Sai kết quả',
                icon: X,
                bgColor: 'bg-red-50',
                borderColor: 'border-red-200',
                textColor: 'text-red-700',
                iconColor: 'text-red-500',
                spinning: false
            };
        }

        return {
            status: 'Đã thực thi',
            icon: Play,
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            textColor: 'text-blue-700',
            iconColor: 'text-blue-500',
            spinning: false
        };
    };

    const config = getStatusConfig();
    const StatusIcon = config.icon;

    return (
        <div className="mt-4 space-y-4">
            {/* Status Header */}
            <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <StatusIcon className={`w-5 h-5 ${config.iconColor} ${config.spinning ? 'animate-spin' : ''}`} />
                        <span className={`font-semibold ${config.textColor}`}>
                            {config.status}
                        </span>
                    </div>

                    {/* Chỉ hiển thị metrics khi không phải loading */}
                    {result.status !== 'loading' && (
                        <div className="flex items-center space-x-6 text-sm">
                            <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span className="font-medium">{result.executionTime}ms</span>
                            </div>
                            {result.memoryUsed > 0 && (
                                <div className="flex items-center space-x-1">
                                    <MemoryStick className="w-4 h-4 text-gray-500" />
                                    <span className="font-medium">{result.memoryUsed}KB</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {!result.success && result.error && result.status !== 'loading' && (
                <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                        <h4 className="text-sm font-medium text-gray-900">Chi tiết lỗi</h4>
                    </div>
                    <div className="p-4">
                        <pre className="text-sm text-red-600 bg-red-50 p-3 rounded border font-mono overflow-x-auto whitespace-pre-wrap">
                            {result.error}
                        </pre>
                    </div>
                </div>
            )}

            {/* Test Case Comparison */}
            {result.success && result.isCorrect !== null && result.status !== 'loading' && (
                <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                        <h4 className="text-sm font-medium text-gray-900">Test Case</h4>
                    </div>
                    <div className="p-4 space-y-4">
                        {/* Input */}
                        {result.input && (
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
                                    Input
                                </label>
                                <pre className="text-sm bg-gray-50 p-3 rounded border font-mono overflow-x-auto">
                                    {result.input}
                                </pre>
                            </div>
                        )}

                        {/* Output Comparison */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
                                    Output
                                </label>
                                <pre className={`text-sm p-3 rounded border font-mono overflow-x-auto ${
                                    result.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                                }`}>
                                    {result.actualOutput || result.output || '(không có output)'}
                                </pre>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
                                    Expected
                                </label>
                                <pre className="text-sm bg-gray-50 p-3 rounded border font-mono overflow-x-auto">
                                    {result.expectedOutput || '(không có kết quả mong đợi)'}
                                </pre>
                            </div>
                        </div>

                        {/* Result Status */}
                        <div className={`flex items-center justify-between p-3 rounded ${
                            result.isCorrect ? 'bg-green-50' : 'bg-red-50'
                        }`}>
                            <div className="flex items-center space-x-2">
                                {result.isCorrect ? (
                                    <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                    <X className="w-4 h-4 text-red-600" />
                                )}
                                <span className={`text-sm font-medium ${
                                    result.isCorrect ? 'text-green-700' : 'text-red-700'
                                }`}>
                                    {result.isCorrect ? 'Test case đã pass' : 'Test case không pass'}
                                </span>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded font-medium ${
                                result.isCorrect
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                            }`}>
                                {result.isCorrect ? 'PASS' : 'FAIL'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Simple Output Display */}
            {result.success && result.isCorrect === null && result.status !== 'loading' && (
                <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                        <h4 className="text-sm font-medium text-gray-900 flex items-center">
                            <Terminal className="w-4 h-4 mr-2" />
                            Output
                        </h4>
                    </div>
                    <div className="p-4">
                        <pre className="text-sm bg-gray-50 p-3 rounded border font-mono overflow-x-auto whitespace-pre-wrap min-h-[80px]">
                            {result.output || '(không có output)'}
                        </pre>
                    </div>
                </div>
            )}

            {/* Success Notification */}
            {isSubmission && result.success && result.isCorrect && result.status !== 'loading' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                            <Check className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-green-800">
                                Bài làm đã được chấp nhận
                            </h3>
                            <p className="text-sm text-green-700 mt-1">
                                Solution của bạn đã pass tất cả test case.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Wrong Answer Notification */}
            {isSubmission && result.success && result.isCorrect === false && result.status !== 'loading' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                            <X className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-yellow-800">
                                Kết quả chưa đúng
                            </h3>
                            <p className="text-sm text-yellow-700 mt-1">
                                Solution của bạn chưa pass hết test case. Vui lòng kiểm tra lại.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};