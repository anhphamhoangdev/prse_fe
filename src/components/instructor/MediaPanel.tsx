import {CourseInstructorEdit} from "../../types/course";
import React, { useEffect, useState } from "react";
import {ImageIcon, VideoIcon} from "lucide-react";
import {VideoPlayer} from "../common/VideoPlayer";

interface MediaPanelProps {
    course: CourseInstructorEdit;
    onInfoChange: (field: keyof CourseInstructorEdit, value: any) => void;
}

const MediaPanel: React.FC<MediaPanelProps> = ({ course, onInfoChange }) => {
    // State để kiểm soát việc load media
    const [imageLoaded, setImageLoaded] = useState(false);
    const [videoLoaded, setVideoLoaded] = useState(false);

    // Hàm lấy duration của video
    const getVideoDuration = async (url: string) => {
        try {
            const video = document.createElement('video');
            video.src = url;

            return new Promise<number>((resolve) => {
                video.onloadedmetadata = () => {
                    const durationInMinutes = Math.ceil(video.duration);
                    resolve(durationInMinutes);
                };
                video.onerror = () => resolve(0);
            });
        } catch (error) {
            console.error('Error getting video duration:', error);
            return 0;
        }
    };

    // Effect xử lý khi URL video thay đổi
    useEffect(() => {
        if (course.previewVideoUrl) {
            setVideoLoaded(false);
            getVideoDuration(course.previewVideoUrl).then(duration => {
                onInfoChange('previewVideoDuration', duration);
                setVideoLoaded(true);
            });
        }
    }, [course.previewVideoUrl]);

    // Effect xử lý khi URL ảnh thay đổi
    useEffect(() => {
        if (course.imageUrl) {
            setImageLoaded(false);
            const img = new Image();
            img.onload = () => setImageLoaded(true);
            img.onerror = () => setImageLoaded(false);
            img.src = course.imageUrl;
        }
    }, [course.imageUrl]);

    return (
        <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
                {/* Image Section */}
                <div className="group bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-blue-500
                    transition-all duration-300 hover:shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <label htmlFor="imageUrl" className="flex items-center gap-2 text-base font-semibold text-gray-800
                            group-hover:text-blue-600 transition-colors duration-300">
                            <ImageIcon className="w-5 h-5" />
                            Hình ảnh khóa học
                        </label>
                        {imageLoaded && course.imageUrl && (
                            <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                Đã tải lên
                            </span>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="relative">
                            <input
                                id="imageUrl"
                                type="text"
                                value={course.imageUrl || ''}
                                onChange={(e) => onInfoChange('imageUrl', e.target.value)}
                                className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg
                                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                    transition-all duration-200"
                                placeholder="Nhập URL hình ảnh"
                            />
                        </div>

                        <div className="relative aspect-video bg-gray-50 rounded-lg overflow-hidden
                            border-2 border-dashed border-gray-300 group-hover:border-blue-400 transition-colors">
                            {course.imageUrl ? (
                                <>
                                    <img
                                        src={course.imageUrl}
                                        alt="Course preview"
                                        className={`absolute inset-0 w-full h-full object-contain transition-all duration-500
                                            ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                                        onLoad={() => setImageLoaded(true)}
                                        onError={() => setImageLoaded(false)}
                                    />
                                    {!imageLoaded && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                                    <div className="text-center">
                                        <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">Chưa có hình ảnh</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Video Section */}
                <div className="group bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-blue-500
                    transition-all duration-300 hover:shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <label htmlFor="previewVideoUrl" className="flex items-center gap-2 text-base font-semibold text-gray-800
                            group-hover:text-blue-600 transition-colors duration-300">
                            <VideoIcon className="w-5 h-5" />
                            Video giới thiệu
                        </label>
                        {videoLoaded && course.previewVideoUrl && (
                            <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                Đã tải lên
                            </span>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="relative">
                            <input
                                id="previewVideoUrl"
                                type="text"
                                value={course.previewVideoUrl || ''}
                                onChange={(e) => onInfoChange('previewVideoUrl', e.target.value)}
                                className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg
                                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                    transition-all duration-200"
                                placeholder="Nhập URL video"
                            />
                        </div>

                        <div className="relative rounded-lg overflow-hidden bg-gray-50
                            border-2 border-dashed border-gray-300 group-hover:border-blue-400 transition-colors">
                            {course.previewVideoUrl ? (
                                <>
                                    <VideoPlayer url={course.previewVideoUrl} />
                                    {!videoLoaded && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-90">
                                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="aspect-video flex items-center justify-center text-gray-500">
                                    <div className="text-center">
                                        <VideoIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">Chưa có video</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                            <label htmlFor="previewVideoDuration" className="flex items-center justify-between text-sm font-medium text-gray-700">
                                <span>Thời lượng video</span>
                                <span className="text-blue-600">{course.previewVideoDuration || 0} giây</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MediaPanel;