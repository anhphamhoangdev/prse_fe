import React from "react";
import {Play, ShoppingCart} from "lucide-react";

interface EnrollButtonProps {
    isEnrolled: boolean;
    price: number;
    onAddToCart?: () => void;
    onBuyNow?: () => void;
    onStartLearning?: () => void;
}

export const EnrollButton: React.FC<EnrollButtonProps> = ({
                                                              isEnrolled,
                                                              price,
                                                              onAddToCart = () => {},
                                                              onBuyNow = () => {},
                                                              onStartLearning = () => {}
                                                          }) => {
    if (isEnrolled) {
        return (
            <button
                onClick={onStartLearning}
                className="w-full bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
                <Play className="w-4 h-4" />
                Start Learning
            </button>
        );
    }

    return (
        <div className="flex gap-3 w-full">
            <button
                onClick={onBuyNow}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
                Buy Now - ${price}
            </button>
            <button
                onClick={onAddToCart}
                className="flex-1 bg-white text-blue-600 px-4 py-3 rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
            >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
            </button>
        </div>
    );
};