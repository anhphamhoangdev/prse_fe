import React, {ChangeEvent, useCallback, useRef, useState} from "react";
import {AlertCircle, Clock, UploadCloud} from "lucide-react";
import {FileDropZoneProps} from "../../types/upload-courses";
import {getVideoDuration} from "../../utils/getVideoDuration";
import {formatDuration} from "../../utils/formatSecondToHour";

const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB in bytes
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;  // 2MB in bytes

export const FileDropZone: React.FC<FileDropZoneProps> = ({ accept, onChange, value, type, duration }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string>('');
    const dropRef = useRef<HTMLDivElement>(null);

    const validateFile = (file: File): boolean => {
        setError('');

        if (type === 'video' && file.size > MAX_VIDEO_SIZE) {
            setError('Video không được lớn hơn 50MB');
            return false;
        }

        if (type === 'image' && file.size > MAX_IMAGE_SIZE) {
            setError('Ảnh không được lớn hơn 2MB');
            return false;
        }

        if (type === 'image') {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                URL.revokeObjectURL(img.src);
                const aspectRatio = img.width / img.height;
                if (Math.abs(aspectRatio - 16/9) > 0.1) {
                    setError('Khuyến nghị: Nên sử dụng ảnh có tỷ lệ 16:9 để hiển thị tốt nhất');
                }
            };
        }

        return true;
    };

    const processFile = async (file: File) => {
        if (!validateFile(file)) {
            onChange(null);
            return;
        }

        if (type === 'video') {
            setIsProcessing(true);
            try {
                const videoDuration = await getVideoDuration(file);
                onChange(file, videoDuration);
            } catch (error) {
                console.error('Error processing video:', error);
                setError('Không thể xử lý video này');
                onChange(null);
            } finally {
                setIsProcessing(false);
            }
        } else {
            onChange(file);
        }
    };

    const handleDrag = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDragIn = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    }, []);

    const handleDragOut = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    }, []);

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const handleDelete = () => {
        onChange(null);
    };

    React.useEffect(() => {
        const div = dropRef.current;
        if (!div) return;

        div.addEventListener('dragenter', handleDragIn as unknown as EventListener);
        div.addEventListener('dragleave', handleDragOut as unknown as EventListener);
        div.addEventListener('dragover', handleDrag as unknown as EventListener);
        div.addEventListener('drop', handleDrop as unknown as EventListener);

        return () => {
            div.removeEventListener('dragenter', handleDragIn as unknown as EventListener);
            div.removeEventListener('dragleave', handleDragOut as unknown as EventListener);
            div.removeEventListener('dragover', handleDrag as unknown as EventListener);
            div.removeEventListener('drop', handleDrop as unknown as EventListener);
        };
    }, [handleDragIn, handleDragOut, handleDrag, handleDrop]);

    const previewContent = value ? (
        <div className="relative">
            {type === 'image' ? (
                <img
                    src={URL.createObjectURL(value)}
                    alt="Preview"
                    className="mx-auto h-48 w-auto rounded-lg object-cover shadow-lg"
                />
            ) : (
                <div className="relative">
                    <video
                        src={URL.createObjectURL(value)}
                        controls
                        className="mx-auto h-48 w-auto rounded-lg shadow-lg"
                    />
                    {duration && (
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded-md text-sm flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDuration(duration)}
                        </div>
                    )}
                </div>
            )}
            <button
                type="button"
                onClick={handleDelete}
                className="absolute top-2 right-2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 focus:outline-none transition-colors duration-200"
            >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
    ) : (
        <div className="text-center">
            {isProcessing ? (
                <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <p className="text-sm text-gray-500">Đang xử lý video...</p>
                </div>
            ) : (
                <>
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                        <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                            <span>Tải file lên</span>
                            <input
                                type="file"
                                className="sr-only"
                                accept={accept}
                                onChange={handleFileChange}
                            />
                        </label>
                        <span className="pl-1">hoặc kéo thả vào đây</span>
                    </div>
                    {/*<p className="text-xs text-gray-500 mt-2">*/}
                    {/*    {type === 'image' ? 'PNG, JPG đến 10MB' : 'MP4, MOV đến 30MB'}*/}
                    {/*</p>*/}
                </>
            )}
        </div>
    );

    return (
        <div className="space-y-2">
            <div
                ref={dropRef}
                className={`flex justify-center px-6 pt-5 pb-6 border-2 ${
                    isDragging
                        ? 'border-blue-500 bg-blue-50'
                        : error
                            ? 'border-red-300 hover:border-red-400'
                            : 'border-gray-300 border-dashed hover:border-gray-400'
                } rounded-lg transition-colors duration-200 ease-in-out`}
            >
                {previewContent}
            </div>

            {/* File size info and aspect ratio recommendation */}
            <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                    {type === 'image'
                        ? 'PNG, JPG (Tối đa 2MB, khuyến nghị tỷ lệ 16:9)'
                        : 'MP4, MOV (Tối đa 50MB)'
                    }
                </span>
                {value && (
                    <span>
                        {`${(value.size / (1024 * 1024)).toFixed(2)}MB`}
                    </span>
                )}
            </div>

            {/* Error message */}
            {error && (
                <div className="flex items-center gap-1 text-sm text-red-500">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};