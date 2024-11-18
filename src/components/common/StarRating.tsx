import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface StarRatingProps {
    rating: number;
    className?: string;
    showNumber?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
                                                   rating,
                                                   className = '',
                                                   showNumber = true
                                               }) => {
    // Validate rating
    const validRating = Math.max(0, Math.min(5, rating));

    // Calculate stars
    const fullStars = Math.floor(validRating);
    const hasHalfStar = validRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div className={`flex items-center space-x-1 ${className}`}>
            {/* Full stars */}
            {[...Array(fullStars)].map((_, index) => (
                <Star
                    key={`full-${index}`}
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                />
            ))}

            {/* Half star */}
            {hasHalfStar && (
                <StarHalf
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                />
            )}

            {/* Empty stars */}
            {[...Array(emptyStars)].map((_, index) => (
                <Star
                    key={`empty-${index}`}
                    className="w-4 h-4 text-gray-300"
                />
            ))}

            {/* Rating number */}
            {showNumber && (
                <span className="ml-2 text-gray-300">
          {validRating.toFixed(1)}
        </span>
            )}
        </div>
    );
};

export default StarRating;