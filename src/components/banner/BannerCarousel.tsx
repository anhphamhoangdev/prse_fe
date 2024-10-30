import React, { useState, useEffect } from 'react';

import {Banner} from "../../models/Banner";
import {getBanners} from "../../services/bannerService";
import {Loader2} from "lucide-react";


export const BannerCarousel: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [banners, setBanners] = useState<Banner[]>([])
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBanners = async () => {
            console.log('[BannerCarousel] Starting to fetch banners...');
            try {
                setLoading(true);
                const data = await getBanners();
                console.log(`[BannerCarousel] Received ${data.length} banners`);
                setBanners(data);
            } catch (err) {
                console.error('[BannerCarousel] Error in component while fetching banners:', err); // Log lỗi ở component level
            } finally {
                setLoading(false);
                console.log('[BannerCarousel] Finished banner fetching process');
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

    const prevSlide = () => {
        setCurrentIndex(prev =>
            prev === 0 ? banners.length - 1 : prev - 1
        );
    };

    const nextSlide = () => {
        setCurrentIndex(prev =>
            prev === banners.length - 1 ? 0 : prev + 1
        );
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };


    // Hiển thị loading state
    if (loading) {
        return (
            <div className="w-full h-[400px] flex items-center justify-center bg-gray-100 rounded-lg mb-8">
                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
            </div>
        );
    }

    if (banners.length === 0) return null;

    return (
        <div className="relative w-full h-[400px] overflow-hidden rounded-lg mb-8">
            <div
                className="flex h-full transition-transform duration-500 ease-in-out"
                style={{
                    width: `${banners.length * 100}%`,
                    transform: `translateX(-${(currentIndex * 100) / banners.length}%)`
                }}
            >
                {banners.map((banner, index) => (
                    <div
                        key={banner.id || index}
                        className="relative w-full h-full flex-shrink-0"
                        style={{ width: `${100 / banners.length}%` }}
                    >
                        <a href={banner.url} className="block w-full h-full">
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
                        className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/50 hover:bg-black/70
                               text-white w-10 h-10 rounded-full flex items-center justify-center
                               transition-colors"
                        aria-label="Previous slide"
                    >
                        <span className="text-2xl">‹</span>
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/50 hover:bg-black/70
                               text-white w-10 h-10 rounded-full flex items-center justify-center
                               transition-colors"
                        aria-label="Next slide"
                    >
                        <span className="text-2xl">›</span>
                    </button>

                    {/* Dots Indicator */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3">
                        {banners.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                    currentIndex === index
                                        ? 'bg-white scale-110'
                                        : 'bg-white/50 hover:bg-white/70'
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