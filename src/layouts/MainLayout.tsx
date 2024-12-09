import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { CategoryList } from '../components/category/CategoryList';
import { Category } from '../models/Category';
import { getCategories } from '../services/categoryService';
import { SearchHeaderAndFooterLayout } from './UserLayout';
import { Loader2 } from 'lucide-react';

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
            <main className="flex min-h-screen bg-gray-50">
                <aside className="w-1/5 bg-white border-r border-gray-200 shadow-lg">
                    <div className="sticky top-0 h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                        <div className="p-6 space-y-6">
                            {/* Home Button */}
                            <div
                                onClick={handleHomeClick}
                                className={`
        cursor-pointer rounded-xl transition-all duration-300
        hover:shadow-md group relative
        ${location.pathname === '/'
                                    ? 'bg-blue-50 text-blue-600' // Thay đổi ở đây: nền trắng nhạt, chữ xanh
                                    : 'hover:bg-blue-50 text-gray-700 hover:text-blue-600' // Hover state cũng nhẹ nhàng hơn
                                }
    `}
                            >
                                <div className="p-4 flex items-center gap-3">
                                    <div className={`
            p-2 rounded-lg transition-all duration-300
            ${location.pathname === '/'
                                        ? 'bg-blue-100' // Icon container cũng nhẹ nhàng hơn
                                        : 'bg-gray-50 group-hover:bg-blue-50'
                                    }
        `}>
                                        <svg
                                            className={`w-5 h-5 ${location.pathname === '/' ? 'text-blue-600' : 'text-gray-600 group-hover:text-blue-500'}`}
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
                                    </div>
                                    <span className="font-medium text-lg">Trang chủ</span>
                                </div>
                            </div>

                            {/* Categories Section */}
                            <div>
                                <div className="flex items-center gap-3 px-4 mb-6">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <i className="fas fa-list text-blue-500"></i>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-800">Thể loại</h2>
                                </div>

                                <div className="space-y-1">
                                    {loading ? (
                                        <div className="flex justify-center py-8">
                                            <Loader2 className="w-8 h-8 animate-spin text-blue-500"/>
                                        </div>
                                    ) : categories.length > 0 ? (
                                        categories.map((category) => (
                                            <CategoryList
                                                key={category.id}
                                                category={category}
                                                onSelectSubCategory={handleSelectSubCategory}
                                                selectedCategory={selectedCategory}
                                            />
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            Không có thể loại nào
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                <div className="w-4/5 p-6 bg-white">
                    {loading ? (
                        <div className="flex justify-center items-center h-[calc(100vh-2rem)]">
                            <Loader2 className="w-12 h-12 animate-spin text-blue-500"/>
                        </div>
                    ) : (
                        children
                    )}
                </div>
            </main>
        </SearchHeaderAndFooterLayout>
    );
};