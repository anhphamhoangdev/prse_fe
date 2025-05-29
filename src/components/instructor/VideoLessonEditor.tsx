import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { requestPostFormDataWithAuth } from '../../utils/request';
import { ENDPOINTS } from '../../constants/endpoint';
import {
    Video,
    AlertCircle,
    Save,
    Loader2
} from 'lucide-react';
import { VideoPlayer } from "../../components/common/VideoPlayer";

interface VideoPreview {
    file: File;
    url: string;
}

interface VideoLessonEditorProps {
    courseId: string | undefined;
    chapterId: string | undefined;
    onSubmit: (lessonData: any) => Promise<void>;
    loading: boolean;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes

const VideoLessonEditor: React.FC<VideoLessonEditorProps> = ({
                                                                 courseId,
                                                                 chapterId,
                                                                 onSubmit,
                                                                 loading
                                                             }) => {
    const [selectedVideo, setSelectedVideo] = useState<VideoPreview | null>(null);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [videoProgress, setVideoProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_FILE_SIZE) {
            setError('File vượt quá kích thước cho phép (100MB)');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        // Cleanup previous preview if exists
        if (selectedVideo) {
            URL.revokeObjectURL(selectedVideo.url);
        }

        // Create new preview
        const videoURL = URL.createObjectURL(file);
        setSelectedVideo({ file, url: videoURL });
        setError(null);
    };

    const submitVideoContent = async (lessonId: number) => {
        if (selectedVideo) {
            setUploadingVideo(true);
            const formData = new FormData();
            formData.append('video', selectedVideo.file);

            const uploadInterval = setInterval(() => {
                setVideoProgress(prev => Math.min(prev + 10, 90));
            }, 500);

            try {
                await requestPostFormDataWithAuth(
                    `${ENDPOINTS.INSTRUCTOR.COURSES}/${courseId}/chapter/${chapterId}/lesson/${lessonId}/video-draft/upload`,
                    formData
                );

                clearInterval(uploadInterval);
                setVideoProgress(100);
            } catch (error) {
                clearInterval(uploadInterval);
                throw error;
            } finally {
                setUploadingVideo(false);
            }
        }
    };

    const handleSubmit = async () => {
        const lessonData = {
            submitContent: submitVideoContent
        };

        await onSubmit(lessonData);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Video className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium text-gray-900">Video bài giảng</h3>
            </div>

            {selectedVideo ? (
                <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden border border-gray-200">
                        <VideoPlayer url={selectedVideo.url} />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                        <AlertCircle className="h-4 w-4" />
                        <span>Video đang chờ tải lên</span>
                    </div>
                </div>
            ) : (
                <div className="p-4 rounded-lg bg-blue-50 text-blue-600 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>Chưa chọn video cho bài học này</span>
                </div>
            )}

            <div className="space-y-2">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    disabled={loading}
                    className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100
                        disabled:opacity-50
                        cursor-pointer"
                />
                <div className="text-xs text-gray-500">
                    Kích thước tối đa: 100MB
                </div>
            </div>

            {uploadingVideo && (
                <div className="space-y-2">
                    <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${videoProgress}%` }}
                        />
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Đang tải lên...</span>
                        <span>{videoProgress}%</span>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="p-4 rounded-lg bg-red-50 text-red-600 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                </div>
            )}

            {/* Action Buttons */}
            <div className="pt-6 border-t border-gray-200 flex justify-end gap-3">
                <Link
                    to={`/instructor/course/${courseId}/chapter/${chapterId}`}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    Hủy
                </Link>
                <button
                    onClick={handleSubmit}
                    disabled={loading || !selectedVideo}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Đang tạo...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5 mr-2" />
                            Tạo bài học
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default VideoLessonEditor;