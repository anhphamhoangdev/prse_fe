import React, {useEffect, useState} from "react";
import CarouselModel from "../model/CarouselModel";
import {FaArrowLeft, FaArrowRight, FaChevronLeft, FaChevronRight} from "react-icons/fa";

interface CarouselProps {
    carousel: CarouselModel[]
}

export function Carousel({carousel}: CarouselProps) {

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) =>
                prevIndex === carousel.length - 1 ? 0 : prevIndex + 1
            );
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const changeSlide = (direction: number) => {
        setCurrentIndex((prevIndex) => {
            let newIndex = prevIndex + direction;
            if (newIndex < 0) {
                newIndex = carousel.length - 1;
            } else if (newIndex >= carousel.length) {
                newIndex = 0;
            }
            return newIndex;
        });
    };

    return (
        <div className="relative overflow-hidden rounded-lg shadow-lg mb-6 h-[25rem]">
            <div
                className="flex transition-transform duration-500 ease-in-out h-full"
                style={{transform: `translateX(-${currentIndex * 100}%)`}}
            >
                {carousel.map((image, index) => (
                    <div key={index} className="w-full h-full flex-shrink-0 relative">
                        <img
                            src={image.imageLink}
                            alt={image.imageAlt}
                            className="w-full h-full object-center"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            {/*<h2 className="text-white text-4xl font-bold text-center">KHONG-CAN</h2>*/}
                        </div>
                    </div>
                ))}
            </div>

            <button
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 text-black p-2 rounded-full transition-all duration-300"
                onClick={() => changeSlide(-1)}
                aria-label="Previous slide"
            >
                <FaChevronLeft size={24}/>
            </button>
            <button
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 text-black p-2 rounded-full transition-all duration-300"
                onClick={() => changeSlide(1)}
                aria-label="Next slide"
            >
                <FaChevronRight size={24}/>
            </button>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {carousel.map((_, index) => (
                    <button
                        key={index}
                        className={`w-3 h-3 rounded-full ${index === currentIndex ? "bg-white" : "bg-gray-400"}`}
                        onClick={() => setCurrentIndex(index)}
                        aria-label={`Go to slide ${index + 1}`}
                    ></button>
                ))}
            </div>
        </div>
    )
}