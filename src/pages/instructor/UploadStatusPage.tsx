import React, { useEffect, useState } from 'react';
import { requestWithAuth } from '../../utils/request';
import { ENDPOINTS } from '../../constants/endpoint';
import { Upload, AlertCircle, XCircle } from 'lucide-react';

interface UploadStatus {
    threadId: string;
    status: 'PENDING' | 'FAILED';
    title: string;
    errorMessage: string | null;
    imageUrl: string;
    createdAt: string;
    progress: number;
    instructorId: number;
}

interface UploadStatusResponse {
    uploadStatuses: UploadStatus[];
}

const UploadStatusPage: React.FC = () => {
    const [uploads, setUploads] = useState<UploadStatus[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUploads = async () => {
            try {
                const response = await requestWithAuth<UploadStatusResponse>(ENDPOINTS.INSTRUCTOR.UPLOAD_STATUS);
                setUploads(response.uploadStatuses);
            } catch (error) {
                console.error('Error fetching upload status:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUploads();
        const interval = setInterval(fetchUploads, 2000); // Poll every 3 seconds

        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-200px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Videos đang xử lý</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Danh sách video đang được tải lên
                </p>
            </div>

            {uploads.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Không có video nào đang được xử lý</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {uploads.map((upload) => (
                        <div
                            key={upload.threadId}
                            className={`bg-white rounded-lg shadow-sm border ${
                                upload.status === 'FAILED' ? 'border-red-200' : 'border-gray-200'
                            } p-4`}
                        >
                            <div className="flex items-center gap-4">
                                {/* Status Icon */}
                                {upload.status === 'PENDING' ? (
                                    <Upload className="w-6 h-6 text-blue-500 animate-pulse" />
                                ) : (
                                    <XCircle className="w-6 h-6 text-red-500" />
                                )}

                                {/* Upload Info */}
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900">
                                        {upload.title}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Bắt đầu: {new Date(upload.createdAt).toLocaleString()}
                                    </p>

                                    {/* Error Message */}
                                    {upload.status === 'FAILED' && upload.errorMessage && (
                                        <div className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {upload.errorMessage}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UploadStatusPage;