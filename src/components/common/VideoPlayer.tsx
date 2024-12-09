import React, { useRef } from 'react';

interface VideoPlayerProps {
    url: string;
    className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, className = '' }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    // Hàm kiểm tra và lấy YouTube video ID
    const getYouTubeVideoId = (url: string): string | null => {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu.be\/|youtube.com\/embed\/)([^#&?]*).*/,
            /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
        ];

        for (let pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) return match[1];
        }
        return null;
    };

    const youtubeId = getYouTubeVideoId(url);

    // Nếu là YouTube video
    if (youtubeId) {
        return (
            <div className="relative w-full aspect-video bg-black">
                <iframe
                    className={`absolute inset-0 w-full h-full ${className}`}
                    src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="YouTube video player"
                    style={{ border: 0 }}
                />
            </div>
        );
    }

    // Nếu là video thông thường
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'p' || e.key === 'P') {
            e.preventDefault();
        }
    };

    return (
        <div className="relative w-full aspect-video bg-black">
            <video
                ref={videoRef}
                className={`absolute inset-0 w-full h-full object-contain ${className}`}
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