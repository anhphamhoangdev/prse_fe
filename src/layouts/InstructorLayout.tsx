import React, { useEffect, useState, createContext, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { InstructorHeaderAndFooterLayout } from "./InstructorHeaderAndFooterLayout";
import {InstructorData} from "../types/users";
import {requestWithAuth} from "../utils/request";
import {ENDPOINTS} from "../constants/endpoint";
import {useWebSocket, WebSocketProvider} from "../context/WebSocketContext";

// Context Type
interface InstructorContextType {
    instructor: InstructorData | null;
    setInstructor: (instructor: InstructorData | null) => void;
}

// Create Context
export const InstructorContext = createContext<InstructorContextType>({
    instructor: null,
    setInstructor: () => {}
});

// Hook để sử dụng instructor context
export const useInstructor = () => useContext(InstructorContext);

interface InstructorLayoutProps {
    children: React.ReactNode;
}

interface CourseStats {
    totalCourses: number;
    totalStudents: number;
    totalEarnings: number;
}

export const InstructorLayout: React.FC<InstructorLayoutProps> = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [instructor, setInstructor] = useState<InstructorData | null>(null);
    const [stats, setStats] = useState<CourseStats>({
        totalCourses: 0,
        totalStudents: 0,
        totalEarnings: 0
    });
    const [isCollapsed, setIsCollapsed] = useState(false);


    const location = useLocation();

    const { connect, disconnect } = useWebSocket();

    const navigate = useNavigate();


    useEffect(() => {
        if (instructor?.id) {
            connect(instructor.id);
            return () => disconnect();
        }
    }, [instructor?.id]);


    useEffect(() => {
        const fetchInstructorData = async () => {
            try {
                setLoading(true);
                const response = await requestWithAuth<{ instructor: InstructorData }>(ENDPOINTS.INSTRUCTOR.PROFILE);

                if (!response.instructor) {
                    navigate('/');
                    return;
                }

                setInstructor(response.instructor);
                setStats({
                    totalCourses: response.instructor.totalCourse || 0,
                    totalStudents: response.instructor.totalStudent || 0,
                    totalEarnings: response.instructor.money || 0
                });
            } catch (err) {
                console.error('Error fetching instructor data:', err);
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        fetchInstructorData();
    }, []);


    const menuItems = [
        {
            id: 'dashboard',
            path: '/instructor/dashboard',
            name: 'Tổng quan',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            )
        },
        {
            id: 'courses',
            path: '/instructor/courses',
            name: 'Khóa học của tôi',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            )
        },
        {
            id: 'upload',
            path: '/instructor/upload',
            name: 'Tạo khóa học mới',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 4v16m8-8H4" />
                </svg>
            )
        },
        // {
        //     id: 'earnings',
        //     path: '/instructor/earnings',
        //     name: 'Doanh thu',
        //     icon: (
        //         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        //                   d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        //         </svg>
        //     )
        // },
        {
            id: 'withdraw',
            path: '/instructor/withdraw',
            name: 'Rút tiền',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            )
        },
        {
            id: 'uploads',
            path: '/instructor/uploads',
            name: 'Quản lý uploads',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
            )
        }
    ];

    // const handleMenuClick = (path: string) => {
    //     navigate(path, { replace: true }); // Use replace instead of push
    // };

    if (loading || !instructor) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }


    return (
        <InstructorContext.Provider value={{ instructor, setInstructor }}>
            <WebSocketProvider>
                <InstructorHeaderAndFooterLayout>
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

                                {/* Stats section */}
                                <div className={`mb-6 p-4 bg-blue-50 rounded-lg overflow-hidden transition-all duration-300 ${
                                    isCollapsed ? 'w-0 h-0 opacity-0 p-0 mb-0' : ''
                                }`}>
                                    <h3 className="font-semibold text-blue-900 mb-2">Tổng quan</h3>
                                    <div className="space-y-2 text-sm">
                                        <p>Số khóa học: {stats.totalCourses}</p>
                                        <p>Tổng học viên: {stats.totalStudents}</p>
                                        <p>Doanh thu: {stats.totalEarnings.toLocaleString()} VND</p>
                                    </div>
                                </div>

                                {/* Navigation */}
                                <nav className="space-y-2">
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
                </InstructorHeaderAndFooterLayout>
            </WebSocketProvider>
        </InstructorContext.Provider>
    );
};

