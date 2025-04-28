import React, { useEffect, useState, createContext, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AdminData } from "../types/users";
import { requestAdminWithAuth } from "../utils/request";
import { ENDPOINTS } from "../constants/endpoint";
import { AdminHeaderAndFooterLayout } from "./AdminHeaderAndFooterLayout";

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

// layouts/AdminLayout.tsx
export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [admin, setAdmin] = useState<AdminData | null>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

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

    // Check if any item in a group is active
    useEffect(() => {
        const findActiveGroup = () => {
            for (const group of menuGroups) {
                if (group.items && group.items.some(item => location.pathname === item.path)) {
                    setExpandedGroups(prev =>
                        prev.includes(group.id) ? prev : [...prev, group.id]
                    );
                    break;
                }
            }
        };

        findActiveGroup();
    }, [location.pathname]);

    const toggleGroup = (groupId: string) => {
        setExpandedGroups(prev =>
            prev.includes(groupId)
                ? prev.filter(id => id !== groupId)
                : [...prev, groupId]
        );
    };

    // Grouped menu items
    const menuGroups = [
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
            id: 'management',
            name: 'Quản lý',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
            ),
            items: [
                {
                    id: 'students',
                    path: '/admin/students',
                    name: 'Học viên',
                    icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    )
                },
                {
                    id: 'instructors',
                    path: '/admin/instructors',
                    name: 'Giảng viên',
                    icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    )
                },
                {
                    id: 'courses',
                    path: '/admin/courses',
                    name: 'Khóa học',
                    icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    )
                },
                {
                    id: 'invoices',
                    path: '/admin/invoices',
                    name: 'Hóa đơn',
                    icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    )
                },
                {
                    id: 'withdrawals',
                    path: '/admin/withdrawals',
                    name: 'Rút tiền',
                    icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    )
                },
                {
                    id: 'tickets',
                    path: '/admin/tickets',
                    name: 'Phiếu hỗ trợ',
                    icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                    )
                }
            ]
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
                                {menuGroups.map((group) => (
                                    <div key={group.id} className="mb-2">
                                        {/* Group header or direct link */}
                                        {group.items ? (
                                            <div
                                                onClick={() => !isCollapsed && toggleGroup(group.id)}
                                                className={`
                                                    flex items-center gap-3 p-3 rounded-lg cursor-pointer 
                                                    transition-all duration-200 relative group
                                                    ${isCollapsed ? 'justify-center py-4' : ''}
                                                    ${expandedGroups.includes(group.id) ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}
                                                `}
                                            >
                                                <div className={`transition-all duration-300 ${isCollapsed ? 'scale-100' : ''}`}>
                                                    {group.icon}
                                                </div>

                                                {!isCollapsed && (
                                                    <>
                                                        <span className="font-medium whitespace-nowrap flex-1">{group.name}</span>
                                                        <svg
                                                            className={`w-4 h-4 transition-transform duration-200 ${expandedGroups.includes(group.id) ? 'rotate-180' : ''}`}
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </>
                                                )}

                                                {/* Tooltip when collapsed */}
                                                {isCollapsed && (
                                                    <div className="absolute left-full ml-3 px-3 py-2 bg-gray-800 text-white text-sm rounded-md
                                                        opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200
                                                        whitespace-nowrap z-50">
                                                        {group.name}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => navigate(group.path!)}
                                                className={`
                                                    flex items-center gap-3 p-3 rounded-lg cursor-pointer 
                                                    transition-all duration-200 relative group
                                                    ${location.pathname === group.path ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}
                                                    ${isCollapsed ? 'justify-center py-4' : ''}
                                                `}
                                            >
                                                <div className={`transition-all duration-300 ${isCollapsed ? 'scale-100' : ''}`}>
                                                    {group.icon}
                                                </div>
                                                <span className={`font-medium whitespace-nowrap transition-all duration-300 ${
                                                    isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'
                                                }`}>
                                                    {group.name}
                                                </span>

                                                {/* Tooltip when collapsed */}
                                                {isCollapsed && (
                                                    <div className="absolute left-full ml-3 px-3 py-2 bg-gray-800 text-white text-sm rounded-md
                                                        opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200
                                                        whitespace-nowrap z-50">
                                                        {group.name}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Group items */}
                                        {!isCollapsed && group.items && expandedGroups.includes(group.id) && (
                                            <div className="mt-1 ml-6 pl-2 border-l-2 border-blue-100 space-y-1">
                                                {group.items.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        onClick={() => navigate(item.path)}
                                                        className={`
                                                            flex items-center gap-3 p-2 rounded-lg cursor-pointer 
                                                            transition-all duration-200
                                                            ${location.pathname === item.path
                                                            ? 'bg-blue-100 text-blue-600'
                                                            : 'hover:bg-gray-100'
                                                        }
                                                        `}
                                                    >
                                                        <div className="text-gray-500">
                                                            {item.icon}
                                                        </div>
                                                        <span className="font-medium text-sm">
                                                            {item.name}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Collapsed menu subitem tooltips */}
                                        {isCollapsed && group.items && (
                                            <div className="relative">
                                                <div
                                                    className="absolute left-full top-0 ml-3 bg-gray-800 rounded-lg p-2
                                                    invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 z-50"
                                                >
                                                    <div className="text-white text-xs mb-2 font-medium border-b pb-1">{group.name}</div>
                                                    <div className="space-y-2">
                                                        {group.items.map(item => (
                                                            <div
                                                                key={item.id}
                                                                onClick={() => navigate(item.path)}
                                                                className="flex items-center gap-2 cursor-pointer text-white whitespace-nowrap py-1 px-2 rounded
                                                                hover:bg-gray-700 transition-colors duration-150"
                                                            >
                                                                <div className="text-gray-300">
                                                                    {item.icon}
                                                                </div>
                                                                <span className="text-sm">{item.name}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
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