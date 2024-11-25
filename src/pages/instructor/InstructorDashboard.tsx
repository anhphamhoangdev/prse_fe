import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, LogOut, BookOpen, ChevronDown, Wallet, Award, GraduationCap, ArrowRight } from "lucide-react";
import { InstructorData, UserData } from "../../types/users";
import { requestWithAuth } from "../../utils/request";
import { ENDPOINTS } from "../../constants/endpoint";

export const InstructorDashboard: React.FC = () => {
    const [user, setUser] = useState<UserData | null>(null);
    const [instructor, setInstructor] = useState<InstructorData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                const response = await requestWithAuth<{ student: UserData }>(ENDPOINTS.STUDENT.PROFILE);
                const userData = response.student;
                setUser(userData);
                if (userData.instructor) {
                    const instructorResponse = await requestWithAuth<{ instructor: InstructorData }>(ENDPOINTS.INSTRUCTOR.PROFILE);
                    if (instructorResponse.instructor) {
                        setInstructor(instructorResponse.instructor);
                    } else {
                        navigate('/');
                    }
                } else {
                    navigate('/');
                }
            } catch (err) {
                console.error('Error fetching user profile:', err);
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        checkAuthentication();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        navigate('/');
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div>
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold leading-tight text-gray-900">
                        Instructor Dashboard
                    </h1>
                    <div className="relative">
                        <button
                            onClick={toggleDropdown}
                            className="flex items-center space-x-2 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            {instructor?.avatarUrl ? (
                                <img
                                    src={instructor.avatarUrl}
                                    alt={instructor.fullName}
                                    className="w-8 h-8 rounded-full object-cover border-2 border-blue-500"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <User className="w-5 h-5 text-blue-600" />
                                </div>
                            )}
                            <ChevronDown className="w-4 h-4 text-slate-600" />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg py-2 border border-slate-200">
                                <div className="px-4 py-3 border-b border-slate-100">
                                    <p className="text-sm font-medium text-slate-900">{instructor?.fullName}</p>
                                    <p className="text-sm text-slate-500">{user?.email}</p>
                                    <div className="mt-2 flex items-center justify-between text-xs">
                                        <div className="flex items-center text-blue-600">
                                            <Wallet className="w-4 h-4 mr-1" />
                                            {instructor?.money.toLocaleString()} VND
                                        </div>
                                        <div className="flex items-center text-amber-600">
                                            <Award className="w-4 h-4 mr-1" />
                                            {instructor?.totalStudent} học viên
                                        </div>
                                    </div>
                                </div>

                                <Link to="/instructor/profile"
                                      className="flex items-center px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                                    <User className="w-4 h-4 mr-2" />
                                    Hồ sơ của tôi
                                </Link>

                                <Link to="/instructor/courses"
                                      className="flex items-center px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                                    <BookOpen className="w-4 h-4 mr-2" />
                                    Khóa học của tôi
                                </Link>

                                <button
                                    onClick={() => navigate('/')}
                                    className="flex items-center w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 group"
                                >
                                    <GraduationCap className="w-4 h-4 mr-2" />
                                    <span className="flex-1 text-left">Chuyển sang Học viên</span>
                                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>

                                <div className="h-px bg-slate-200 my-2"></div>

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Đăng xuất
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            <main>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <div className="border-4 border-dashed border-gray-200 rounded-lg h-96">
                            {/* Content goes here */}
                            <p>Welcome, {instructor?.fullName}!</p>
                            <p>Số khóa học: {instructor?.totalCourse}</p>
                            <p>Số học viên: {instructor?.totalStudent}</p>
                            <p>Phí: {instructor?.fee}%</p>
                            <p>Trạng thái: {instructor?.isActive ? 'Đang hoạt động' : 'Không hoạt động'}</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};