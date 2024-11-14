import React, { useRef } from 'react';

interface VideoPlayerProps {
    url: string;
    className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, className = '' }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    // Prevent right click
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
    };

    // Handle keyboard shortcuts
    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Prevent Picture-in-Picture
        if (e.key === 'p' || e.key === 'P') {
            e.preventDefault();
        }
    };

    return (
        <div className="relative w-full aspect-video bg-black"> {/* Thêm bg-black để tạo viền đen */}
            <video
                ref={videoRef}
                className={`absolute inset-0 w-full h-full object-contain ${className}`}
                // Thay object-cover bằng object-contain để giữ nguyên tỷ lệ video
                // và thêm position absolute để video nằm giữa container
                controls
                autoPlay
                crossOrigin="anonymous"
                controlsList="nodownload nofullscreen noremoteplayback"
                disablePictureInPicture
                playsInline
                onContextMenu={handleContextMenu}
                onKeyDown={handleKeyDown}
            >
                <source src={url} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <div
                className="absolute inset-0 w-full h-full"
                onContextMenu={handleContextMenu}
                style={{ pointerEvents: 'none' }}
            />
        </div>
    );
};