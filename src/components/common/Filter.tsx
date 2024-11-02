// components/common/Filter.tsx
import React, { useState } from 'react';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';
import {CourseFilters} from "../../types/course";

interface FilterSectionProps {
    filters: {
        q?: string;
        price?: string;
        rating?: number;
        level?: string;
        sortBy?: string;
    };
    onFilterChange: (filters: Partial<CourseFilters>) => void;
    onClearFilters: () => void;
    totalCourses: number;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
                                                                filters,
                                                                onFilterChange,
                                                                onClearFilters,
                                                                totalCourses
                                                            }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-white rounded-lg shadow p-4">
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full lg:hidden"
            >
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Bộ lọc</h3>
                    <span className="text-sm text-gray-500">
                        ({totalCourses} khóa học)
                    </span>
                </div>
                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {/* Filter Content - Always visible on desktop, toggleable on mobile */}
            <div className={`${isOpen ? 'block' : 'hidden'} lg:block`}>
                {/* Header - Only show on desktop */}
                <div className="hidden lg:flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Bộ lọc</h3>
                    <button
                        onClick={onClearFilters}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        Xóa bộ lọc
                    </button>
                </div>

                {/* Filter Options */}
                <div className="space-y-6">
                    {/* Price Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Khoảng giá
                        </label>
                        <select
                            value={filters.price || 'all'}
                            onChange={(e) => onFilterChange({ price: e.target.value })}
                            className="w-full p-2 border rounded-md"
                        >
                            <option value="all">Tất cả</option>
                            <option value="free">Miễn phí</option>
                            <option value="paid">Có phí</option>
                            <option value="under_50">Dưới 50.000đ</option>
                            <option value="50_200">50.000đ - 200.000đ</option>
                            <option value="over_200">Trên 200.000đ</option>
                        </select>
                    </div>

                    {/* Rating Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Đánh giá
                        </label>
                        <div className="space-y-2">
                            {[4, 3, 2, 1].map((rating) => (
                                <button
                                    key={rating}
                                    onClick={() => onFilterChange({
                                        rating: filters.rating === rating ? undefined : rating
                                    })}
                                    className={`w-full flex items-center p-2 rounded ${
                                        filters.rating === rating
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, index) => (
                                            <Star
                                                key={index}
                                                size={16}
                                                className={`${
                                                    index < rating
                                                        ? 'text-yellow-400 fill-current'
                                                        : 'text-gray-300'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="ml-2">và cao hơn</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sort Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sắp xếp theo
                        </label>
                        <select
                            value={filters.sortBy || 'newest'}
                            onChange={(e) => onFilterChange({ sortBy: e.target.value })}
                            className="w-full p-2 border rounded-md"
                        >
                            <option value="newest">Mới nhất</option>
                            <option value="oldest">Cũ nhất</option>
                            <option value="price_asc">Giá tăng dần</option>
                            <option value="price_desc">Giá giảm dần</option>
                            <option value="rating">Đánh giá cao nhất</option>
                            <option value="popular">Phổ biến nhất</option>
                        </select>
                    </div>
                </div>

                {/* Clear Filters Button - Only show on mobile */}
                <button
                    onClick={onClearFilters}
                    className="w-full mt-4 p-2 text-blue-600 border border-blue-600 rounded-md lg:hidden"
                >
                    Xóa tất cả bộ lọc
                </button>
            </div>
        </div>
    );
};