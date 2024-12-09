import React from 'react';
import { Loader2, Upload } from 'lucide-react';

interface VideoUploadStatusProps {
    progress: number;
}

const VideoUploadStatus: React.FC<VideoUploadStatusProps> = ({ progress }) => (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-center flex-col gap-6">
                {/* Icon and Title */}
                <div className="relative">
                    <div className="absolute inset-0 animate-spin">
                        <div className="h-16 w-16 rounded-full border-4 border-blue-100 border-t-blue-600"></div>
                    </div>
                    <Upload className="h-8 w-8 text-blue-600 relative top-4 left-4"/>
                </div>

                <div className="text-center space-y-2">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Đang tải lên video bài giảng
                    </h2>
                    <p className="text-gray-500">Vui lòng không đóng trình duyệt</p>
                </div>

                {/* Progress Bar */}
                <div className="w-full max-w-md space-y-3">
                    <div className="relative w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div
                            className="absolute inset-0 bg-blue-600 transition-all duration-300 rounded-full"
                            style={{width: `${Math.round(progress)}%`}}
                        />
                        <div
                            className="absolute inset-0 bg-blue-400 animate-pulse opacity-50 rounded-full"
                            style={{width: `${Math.round(progress)}%`}}
                        />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600"/>
                        Đang xử lý...
                    </span>
                        <span className="text-blue-600 font-medium">{Math.round(progress)}%</span>
                    </div>
                </div>

                {/* Status Messages */}
                <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-lg text-sm max-w-md w-full text-center">
                    Video của bạn đang được tải lên máy chủ
                </div>
            </div>
        </div>
    </div>
);

export default VideoUploadStatus;