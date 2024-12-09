import React, { useEffect, useState } from 'react';
import { Category } from "../../models/Category";

interface CategoryListProps {
    category: Category;
    onSelectSubCategory: (subCategoryId: number, subCategoryName: string) => void;
    selectedCategory: string | null;
}

export const CategoryList: React.FC<CategoryListProps> = (props) => {
    const { category, onSelectSubCategory, selectedCategory } = props;
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (selectedCategory) {
            const hasSelectedSubCategory = category.subCategories.some(
                subCategory => subCategory.name === selectedCategory
            );
            if (hasSelectedSubCategory) {
                setIsOpen(true);
            }
        }
    }, [selectedCategory, category.subCategories]);

    return (
        <div className="mb-3">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full text-left font-semibold text-base py-2.5 px-4 
                    flex justify-between items-center rounded-lg
                    transition-all duration-200 ease-in-out
                    hover:bg-blue-50 hover:text-blue-600
                    ${isOpen ? 'bg-blue-50 text-blue-600 shadow-sm' : 'bg-white text-gray-700'}
                    group relative
                `}
            >
                <div className="flex items-center gap-2">
                    <i className={`fas fa-book${isOpen ? '-open' : ''} text-[0.95rem] 
                        transition-colors duration-200
                        ${isOpen ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-400'}`}>
                    </i>
                    <span className="truncate">{category.name}</span>
                </div>
                <div className="flex items-center gap-2">
                    <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} text-sm transition-transform duration-300
                        ${isOpen ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-400'}`}>
                    </i>
                </div>
            </button>

            <div className={`
                overflow-hidden transition-all duration-300 ease-in-out
                ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}
            `}>
                <ul className="pl-6 pt-2">
                    {category.subCategories.map((subCategory) => (
                        <li key={subCategory.id} className="py-1.5">
                            <button
                                onClick={() => onSelectSubCategory(subCategory.id, subCategory.name)}
                                className={`
                                    flex items-center gap-2 px-3 py-1.5 rounded-md w-full
                                    transition-all duration-200
                                    hover:bg-blue-50 hover:text-blue-600
                                    ${selectedCategory === subCategory.name
                                    ? 'bg-blue-100 text-blue-600 font-medium'
                                    : 'text-gray-600 hover:translate-x-1'
                                }
                                `}
                            >
                                <i className={`fas fa-graduation-cap text-xs transition-transform duration-200
                                    ${selectedCategory === subCategory.name ? 'translate-x-1 text-blue-500' : 'text-gray-400'}
                                `}></i>
                                <span className="truncate">{subCategory.name}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};