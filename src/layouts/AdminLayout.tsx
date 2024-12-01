import React, { useEffect, useState, createContext, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AdminData } from "../types/users";
import {requestAdminWithAuth, requestWithAuth} from "../utils/request";
import { ENDPOINTS } from "../constants/endpoint";
import {AdminHeaderAndFooterLayout} from "./AdminHeaderAndFooterLayout";

// Context Type
interface AdminContextType {
    admin: AdminData | null;
    setAdmin: (admin: AdminData | null) => void;
}

// Create Context
export const AdminContext = createContext<AdminContextType>({
    admin: null,
    setAdmin: () => {}
});

// Hook để sử dụng admin context
export const useAdmin = () => useContext(AdminContext);

interface AdminLayoutProps {
    children: React.ReactNode;
}

interface AdminStats {
    totalCourses: number;
    totalStudents: number;
    totalInstructors: number;
    totalRevenue: number;
}

// layouts/AdminLayout.tsx
export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [admin, setAdmin] = useState<AdminData | null>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                setLoading(true);
                const response = await requestAdminWithAuth<{ admin: AdminData }>(ENDPOINTS.ADMIN.PROFILE);

                if (!response.admin) {
                    navigate('/admin/login');
                    return;
                }

                setAdmin(response.admin);
            } catch (err) {
                console.error('Error fetching admin data:', err);
                navigate('/admin/login');
            } finally {
                setLoading(false);
            }
        };

        fetchAdminData();
    }, []);

    const menuItems = [
        {
            id: 'dashboard',
            path: '/admin/dashboard',
            name: 'Dashboard',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            )
        },
        {
            id: 'users',
            path: '/admin/users',
            name: 'Quản lý Users',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            )
        },
        {
            id: 'courses',
            path: '/admin/courses',
            name: 'Quản lý khóa học',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            )
        },
        {
            id: 'settings',
            path: '/admin/settings',
            name: 'Cài đặt hệ thống',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            )
        }
    ];

    if (loading || !admin) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <AdminContext.Provider value={{ admin, setAdmin }}>
            <AdminHeaderAndFooterLayout>
                <main className="flex min-h-screen bg-gray-50">
                    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white shadow-lg transition-all duration-300 ease-in-out`}>
                        <div className="relative p-4">
                            {/* Toggle button */}
                            <button
                                onClick={() => setIsCollapsed(!isCollapsed)}
                                className="absolute -right-3 top-6 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-50"
                            >
                                <svg
                                    className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            <nav className="space-y-2 mt-8">
                                {menuItems.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => navigate(item.path)}
                                        className={`
                                            flex items-center gap-3 p-3 rounded-lg cursor-pointer 
                                            transition-all duration-200 relative group
                                            ${location.pathname === item.path
                                            ? 'bg-blue-100 text-blue-600'
                                            : 'hover:bg-gray-100'
                                        }
                                            ${isCollapsed ? 'justify-center py-4' : ''}
                                        `}
                                    >
                                        <div className={`transition-all duration-300 ${isCollapsed ? 'scale-100' : ''}`}>
                                            {item.icon}
                                        </div>
                                        <span className={`font-medium whitespace-nowrap transition-all duration-300 ${
                                            isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'
                                        }`}>
                                            {item.name}
                                        </span>

                                        {/* Tooltip when collapsed */}
                                        {isCollapsed && (
                                            <div className="absolute left-full ml-3 px-3 py-2 bg-gray-800 text-white text-sm rounded-md
                                                opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200
                                                whitespace-nowrap z-50">
                                                {item.name}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    <div className="flex-1 p-6 transition-all duration-300">
                        {children}
                    </div>
                </main>
            </AdminHeaderAndFooterLayout>
        </AdminContext.Provider>
    );
};