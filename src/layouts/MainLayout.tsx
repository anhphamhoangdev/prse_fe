import React, { useEffect, useState } from 'react';
import {useNavigate, useLocation, useParams} from 'react-router-dom';
import { CategoryList } from '../components/category/CategoryList';
import { Category } from '../models/Category';
import { getCategories } from '../services/categoryService';
import { SearchHeaderAndFooterLayout } from './UserLayout';

interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const { categoryId } = useParams();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const data = await getCategories();
                setCategories(data);
                if (categoryId) {
                    for (const category of data) {
                        const subCategory = category.subCategories.find(
                            sub => sub.id === Number(categoryId)
                        );
                        if (subCategory) {
                            setSelectedCategory(subCategory.name);
                            break;
                        }
                    }
                }
            } catch (err) {
                console.error('Error fetching categories:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const handleSelectSubCategory = (subCategoryId: number, subCategoryName: string) => {
        setSelectedCategory(subCategoryName);
        navigate(`/category/${subCategoryId}`);
    };

    const handleHomeClick = () => {
        setSelectedCategory(null);
        navigate('/');
    };

    return (
        <SearchHeaderAndFooterLayout>
            <main className="flex">
                <aside className="w-1/5 p-4">
                    <div
                        onClick={handleHomeClick}
                        className={`cursor-pointer mb-6 p-3 rounded-lg transition-all duration-200 
              ${location.pathname === '/' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                    >
                        <div className="flex items-center gap-2">
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                />
                            </svg>
                            <span className="font-semibold">Trang chủ</span>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold mb-4">Thể loại</h2>
                    {categories.map((category) => (
                        <CategoryList
                            key={category.id}
                            category={category}
                            onSelectSubCategory={handleSelectSubCategory}
                            selectedCategory={selectedCategory}
                        />
                    ))}
                </aside>
                <div className="w-4/5 p-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-screen">
                            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        children
                    )}
                </div>
            </main>
        </SearchHeaderAndFooterLayout>
    );
};