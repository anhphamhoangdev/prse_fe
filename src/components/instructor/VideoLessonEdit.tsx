import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { requestWithAuth, putWithAuth, requestPostFormDataWithAuth } from '../../utils/request';
import { ENDPOINTS } from '../../constants/endpoint';
import { formatDuration } from "../../utils/formatSecondToHour";
import { AlertCircle, Upload, Video, CheckCircle2 } from 'lucide-react';
import VideoUploadStatus from "./VideoUploadStatus";
import {VideoPlayer} from "../common/VideoPlayer";

interface Lesson {
    id: number;
    title: string;
    type: 'video' | 'text' | 'code' | 'quiz';
    isPublish: boolean;
    chapterId: number;
    orderIndex: number;
    createdAt: string;
    updatedAt: string;
}

interface VideoLesson {
    id: number;
    videoUrl: string;
    duration: number;
    lessonId: number;
    createdAt: string;
    updatedAt: string;
}

interface VideoLessonEditProps {
    lesson: Lesson;
}

interface VideoPreview {
    file: File;
    url: string;
}



const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes

const VideoLessonEdit: React.FC<VideoLessonEditProps> = ({ lesson }) => {
    const { courseId, chapterId } = useParams();
    const [videoLesson, setVideoLesson] = useState<VideoLesson | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<VideoPreview | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPublish, setIsPublish] = useState(lesson.isPublish);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [uploadStatus, setUploadStatus] = useState<boolean | null>(null);


    useEffect(() => {
        const checkUploadStatus = async () => {
            try {
                const response = await requestWithAuth<{ isUploading: boolean, progress: number }>(
                    `${ENDPOINTS.INSTRUCTOR.COURSES}/${courseId}/chapter/${chapterId}/lesson/${lesson.id}/video/upload-status`
                );
                setUploadStatus(response.isUploading);
                setProgress(response.progress);

                // Nếu đang upload, poll status mỗi 2 giây
                if (response.isUploading) {
                    setTimeout(checkUploadStatus, 2000);
                } else {
                    // Nếu không còn upload nữa, fetch video lesson
                    await fetchVideoLesson();
                }
            } catch (err) {
                console.error('Error checking upload status:', err);
                setError('Không thể kiểm tra trạng thái tải lên');
            }
        };

        checkUploadStatus();
    }, [lesson.id, uploading]);

    // useEffect(() => {
    //     fetchVideoLesson();
    //     return () => {
    //         // Cleanup preview URL when component unmounts
    //         if (selectedVideo) {
    //             URL.revokeObjectURL(selectedVideo.url);
    //         }
    //     };
    // }, [lesson.id]);

    const fetchVideoLesson = async () => {
        try {
            setLoading(true);
            const response = await requestWithAuth<{ video: VideoLesson }>(
                `${ENDPOINTS.INSTRUCTOR.COURSES}/${courseId}/chapter/${chapterId}/lesson/${lesson.id}/details`
            );
            setVideoLesson(response.video);
            setError(null);
        } catch (err) {
            setError('Không thể tải thông tin video');
            console.error('Error fetching video lesson:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePublishToggle = async () => {
        try {
            await putWithAuth(
                `${ENDPOINTS.INSTRUCTOR.COURSES}/${courseId}/chapter/${chapterId}/lesson/${lesson.id}`,
                { isPublish: !isPublish }
            );
            setIsPublish(!isPublish);
        } catch (err) {
            console.error('Error updating publish status:', err);
        }
    };

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

    const handleUpload = async () => {
        if (!selectedVideo) return;

        setUploading(true);
        setProgress(0);
        setError(null);

        try {
            const formData = new FormData();
            console.log("Selected file:", selectedVideo.file);
            console.log("File size:", selectedVideo.file.size);
            console.log("File type:", selectedVideo.file.type);
            formData.append('video', selectedVideo.file);

            const uploadInterval = setInterval(() => {
                setProgress(prev => Math.min(prev + 10, 90));
            }, 500);

            await requestPostFormDataWithAuth<{ data: boolean }>(
                `${ENDPOINTS.INSTRUCTOR.COURSES}/${courseId}/chapter/${chapterId}/lesson/${lesson.id}/video/upload`,
                formData
            );

            clearInterval(uploadInterval);
            setProgress(100);
            setUploading(true);
            await fetchVideoLesson();

            // Cleanup
            URL.revokeObjectURL(selectedVideo.url);
            setSelectedVideo(null);

        } catch (error) {
            console.error('Error uploading video:', error);
            setError('Không thể tải lên video');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    if (uploadStatus) {
        return <VideoUploadStatus progress={progress}   />;
    }


    if (loading) {
        return (
            <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }


    return (
        <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Quản lý Video</h2>
                    <div className="flex items-center gap-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={isPublish}
                                onChange={handlePublishToggle}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            <span className="ml-3 text-sm font-medium text-gray-700">
                                {isPublish ? 'Đã xuất bản' : 'Nháp'}
                            </span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
                {/* Video Player Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Video className="h-5 w-5 text-blue-600" />
                        <h3 className="font-medium text-gray-900">Video bài giảng</h3>
                    </div>

                    {videoLesson || selectedVideo ? (
                        <div className="space-y-4">
                            <div className="relative rounded-lg overflow-hidden border border-gray-200">
                                <VideoPlayer
                                    url={selectedVideo ? selectedVideo.url : videoLesson?.videoUrl || ''}
                                />
                            </div>
                            {videoLesson && !selectedVideo && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span>Thời lượng: {formatDuration(videoLesson.duration)}</span>
                                </div>
                            )}
                            {selectedVideo && (
                                <div className="flex items-center gap-2 text-sm text-blue-600">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>Video đang chờ tải lên</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-4 rounded-lg bg-blue-50 text-blue-600 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            <span>Chưa có video cho bài học này</span>
                        </div>
                    )}
                </div>

                {/* Upload Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Upload className="h-5 w-5 text-blue-600" />
                        <h3 className="font-medium text-gray-900">Tải lên video mới</h3>
                    </div>

                    <div className="space-y-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="video/*"
                            onChange={handleFileChange}
                            disabled={uploading}
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

                    {selectedVideo && !uploading && (
                        <button
                            onClick={handleUpload}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <Upload className="h-5 w-5 mr-2" />
                            Tải lên video
                        </button>
                    )}

                    {uploading && (
                        <div className="space-y-2">
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <span>Đang tải lên...</span>
                                <span>{progress}%</span>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 rounded-lg bg-red-50 text-red-600 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoLessonEdit;