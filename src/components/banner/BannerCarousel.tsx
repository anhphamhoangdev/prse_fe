import React, { useState, useEffect } from 'react';
import { Banner } from "../../models/Banner";
import { getBanners } from "../../services/bannerService";
import { Loader2 } from "lucide-react";

export const BannerCarousel: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                setLoading(true);
                const data = await getBanners();
                setBanners(data);
            } catch (err) {
                console.error('[BannerCarousel] Error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchBanners();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            nextSlide();
        }, 5000);

        return () => clearInterval(timer);
    }, [currentIndex]);

    const handleTransitionStart = () => {
        setIsTransitioning(true);
    };

    const handleTransitionEnd = () => {
        setIsTransitioning(false);
    };

    const prevSlide = () => {
        if (!isTransitioning) {
            setCurrentIndex(prev => prev === 0 ? banners.length - 1 : prev - 1);
        }
    };

    const nextSlide = () => {
        if (!isTransitioning) {
            setCurrentIndex(prev => prev === banners.length - 1 ? 0 : prev + 1);
        }
    };

    const goToSlide = (index: number) => {
        if (!isTransitioning) {
            setCurrentIndex(index);
        }
    };

    if (loading) {
        return (
            <div className="w-full h-[400px] flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl mb-8">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                    <span className="text-gray-600 font-medium animate-pulse">Đang tải banner...</span>
                </div>
            </div>
        );
    }

    if (banners.length === 0) return null;

    return (
        <div className="relative w-full h-[400px] overflow-hidden rounded-xl mb-8 group">
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent z-10"/>
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 z-10"/>

            {/* Slides Container */}
            <div
                className="flex h-full transition-transform duration-700 ease-out"
                style={{
                    width: `${banners.length * 100}%`,
                    transform: `translateX(-${(currentIndex * 100) / banners.length}%)`
                }}
                onAnimationStart={handleTransitionStart}
                onTransitionEnd={handleTransitionEnd}
            >
                {banners.map((banner, index) => (
                    <div
                        key={banner.id || index}
                        className="relative w-full h-full flex-shrink-0"
                        style={{ width: `${100 / banners.length}%` }}
                    >
                        <a href={banner.url} className="block w-full h-full transform transition-transform duration-700 hover:scale-105">
                            <img
                                src={banner.imageUrl}
                                alt={`Banner ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </a>
                    </div>
                ))}
            </div>

            {/* Navigation Buttons */}
            {banners.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/30 hover:bg-black/50
                                 text-white w-12 h-12 rounded-full flex items-center justify-center
                                 transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110
                                 backdrop-blur-sm z-20"
                        aria-label="Previous slide"
                    >
                        <span className="text-3xl">‹</span>
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/30 hover:bg-black/50
                                 text-white w-12 h-12 rounded-full flex items-center justify-center
                                 transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110
                                 backdrop-blur-sm z-20"
                        aria-label="Next slide"
                    >
                        <span className="text-3xl">›</span>
                    </button>

                    {/* Enhanced Dots Indicator */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-4 z-20">
                        {banners.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-3 h-3 rounded-full transition-all duration-500
                                    ${currentIndex === index
                                    ? 'bg-white w-6 scale-110'
                                    : 'bg-white/40 hover:bg-white/60'
                                }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};