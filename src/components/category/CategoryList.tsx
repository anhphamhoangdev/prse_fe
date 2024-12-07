import React, {useEffect, useState} from 'react';
import {Category} from "../../models/Category";

interface CategoryListProps {
    category: Category;
    onSelectSubCategory: (subCategoryId: number, subCategoryName: string) => void;
    selectedCategory: string | null;
}

export const CategoryList: React.FC<CategoryListProps> = (props) => {

    const {category, onSelectSubCategory, selectedCategory} = props;

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
        <div className="mb-2">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full text-left font-bold text-lg py-2 px-4 flex justify-between items-center hover:bg-gray-200 rounded-lg"
            >
                {category.name}
                <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
            </button>
            {isOpen && (
                <ul className="pl-8">
                    {category.subCategories.map((subCategory) => (
                        <li key={subCategory.id} className="py-1">
                            <button
                                onClick={() => onSelectSubCategory(subCategory.id ,subCategory.name)}
                                className={`hover:text-blue-500 ${
                                    selectedCategory === subCategory.name ? 'text-blue-600 font-bold' : ''
                                }`}
                            >
                                {subCategory.name}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
