import React from "react";
import { Play, ShoppingCart, Headphones } from "lucide-react";
import { formatCurrency } from "../../../utils/formatCurrency";
import { useNavigate } from "react-router-dom";

interface EnrollButtonProps {
    isEnrolled: boolean;
    originalPrice: number;
    discountPrice?: number;
    onAddToCart?: () => void;
    onBuyNow?: () => void;
    onStartLearning?: () => void;
    isAside?: boolean;
    courseId?: number;
    courseName?: string;
}

export const EnrollButton: React.FC<EnrollButtonProps> = ({
                                                              isEnrolled,
                                                              originalPrice,
                                                              discountPrice,
                                                              onAddToCart = () => {},
                                                              onBuyNow = () => {},
                                                              onStartLearning = () => {},
                                                              isAside = false,
                                                              courseId,
                                                              courseName,
                                                          }) => {
    const navigate = useNavigate();
    const hasDiscount = discountPrice != null && discountPrice < originalPrice && originalPrice !== 0;
    const isFree = originalPrice === 0;

    const calculateDiscount = () => {
        if (hasDiscount) {
            const discount = ((originalPrice - (discountPrice || 0)) / originalPrice) * 100;
            return Math.round(discount);
        }
        return 0;
    };

    const renderPrice = () => {
        if (isFree) return <span className="font-medium">Miễn phí</span>;
        if (hasDiscount) {
            return (
                <span className="flex items-center gap-2">
                    <span className="font-medium">{formatCurrency(discountPrice)}</span>
                    <span className="text-sm line-through text-gray-300 font-normal">{formatCurrency(originalPrice)}</span>
                </span>
            );
        }
        return <span className="font-medium">{formatCurrency(originalPrice)}</span>;
    };

    const handleSupportRequest = () => {
        navigate("/create-ticket", {
            state: {
                courseId,
                courseName,
            },
        });
    };

    if (isEnrolled) {
        return (
            <div className={`flex gap-3 w-full ${isAside ? 'flex-col' : 'flex-row'}`}>
                <button
                    onClick={onStartLearning}
                    className={`flex-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 
                        ${isAside ? 'px-4 py-2 text-sm' : 'px-8 py-3'}`}
                >
                    <Play className="w-4 h-4" />
                    Vào học
                </button>
                <button
                    onClick={handleSupportRequest}
                    className={`flex-1 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 
                        ${isAside ? 'px-4 py-2 text-sm' : 'px-8 py-3'}`}
                >
                    <Headphones className="w-4 h-4" />
                    Hỗ trợ
                </button>
            </div>
        );
    }

    if (isFree) {
        return (
            <div className="relative w-full">
                <div className={`absolute -top-2 left-0 bg-green-500 text-white font-bold rounded-full shadow-lg
                    ${isAside ? 'text-[10px] px-2 py-0.5' : 'text-xs px-3 py-1'}`}
                >
                    MIỄN PHÍ
                </div>
                <button
                    onClick={onBuyNow}
                    className={`w-full bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors
                        ${isAside ? 'px-4 py-2 text-sm' : 'px-8 py-3'}`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <Play className="w-4 h-4" />
                        <span>Đăng ký vào học</span>
                    </div>
                </button>
            </div>
        );
    }

    if (isAside) {
        return (
            <div className="flex flex-col gap-2 w-full relative">
                {hasDiscount && (
                    <div className="absolute -top-2 left-0 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg animate-pulse">
                        -{calculateDiscount()}% GIẢM
                    </div>
                )}
                <button
                    onClick={onAddToCart}
                    className="w-full bg-white text-blue-600 px-4 py-2 text-sm rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                >
                    <ShoppingCart className="w-4 h-4" />
                    Thêm vào giỏ - {renderPrice()}
                </button>
                <button
                    onClick={handleSupportRequest}
                    className="w-full bg-white text-blue-600 px-4 py-2 text-sm rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                >
                    <Headphones className="w-4 h-4" />
                    Yêu cầu hỗ trợ
                </button>
            </div>
        );
    }

    return (
        <div className="flex gap-3 w-full relative">
            {hasDiscount && (
                <div
                    className="absolute -top-3 left-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                    -{calculateDiscount()}% GIẢM
                </div>
            )}
            <button
                onClick={onAddToCart}
                className="flex-[3] bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
                <ShoppingCart className="w-4 h-4"/>
                <span>Thêm vào giỏ - {renderPrice()}</span>
            </button>
            <button
                onClick={handleSupportRequest}
                className="flex-1 bg-white text-blue-600 px-4 py-3 rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
            >
                <Headphones className="w-4 h-4"/>
                <span>Hỗ trợ</span>
            </button>
        </div>
    );
};