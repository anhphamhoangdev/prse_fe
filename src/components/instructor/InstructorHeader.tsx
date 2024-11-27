import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, ChevronDown, Wallet, BookOpen, GraduationCap, ArrowRight } from "lucide-react";
import {useInstructor} from "../../layouts/InstructorLayout";

export const InstructorHeader = () => {
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Lấy thông tin instructor từ context
    const { instructor } = useInstructor(); // Sử dụng context

    const handleLogout = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        navigate('/login');
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm backdrop-blur-sm bg-white/80">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center py-4 px-4 sm:px-6">
                    {/* Logo */}
                    <Link to="/instructor/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <img src="/logo.png" alt="HCMUTE Logo" className="w-10 h-10 object-contain" />
                        <div className="flex flex-col">
                            <span className="text-2xl sm:text-3xl font-bold">
                                <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Easy</span>
                                <span className="bg-gradient-to-r from-slate-600 to-slate-900 bg-clip-text text-transparent">Edu</span>
                            </span>
                            <span className="text-sm text-slate-600">Instructor Portal</span>
                        </div>
                    </Link>

                    {/* User Menu */}
                    {instructor && (
                        <div className="relative">
                            <button onClick={toggleDropdown} className="flex items-center space-x-2 p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                {instructor.avatarUrl ? (
                                    <img src={instructor.avatarUrl} alt={instructor.fullName} className="w-8 h-8 rounded-full object-cover border-2 border-blue-500" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                        <User className="w-5 h-5 text-blue-600" />
                                    </div>
                                )}
                                <span className="hidden sm:block text-sm font-medium text-slate-700">{instructor.fullName}</span>
                                <ChevronDown className="w-4 h-4 text-slate-600" />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg py-2 border border-slate-200">
                                    <div className="px-4 py-3 border-b border-slate-100">
                                        <p className="text-sm font-medium text-slate-900">{instructor.fullName}</p>
                                        <p className="text-sm text-slate-500">{instructor.title}</p> {/* Sử dụng email từ instructor */}
                                        <div className="mt-2 flex items-center text-xs">
                                            <div className="flex items-center text-blue-600">
                                                <Wallet className="w-4 h-4 mr-1" />
                                                Tổng tiền: {instructor.money.toLocaleString()} VND {/* Sử dụng money từ instructor */}
                                            </div>
                                        </div>
                                    </div>

                                    <Link to="/instructor/profile" className="flex items-center px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                                        <User className="w-4 h-4 mr-2" />
                                        Hồ sơ của tôi
                                    </Link>

                                    <Link to="/instructor/courses" className="flex items-center px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                                        <BookOpen className="w-4 h-4 mr-2" />
                                        Khóa học của tôi
                                    </Link>

                                    <button onClick={() => navigate('/')} className="flex items-center w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 group">
                                        <GraduationCap className="w-4 h-4 mr-2" />
                                        <span className="flex-1 text-left">Chuyển sang Học viên</span>
                                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>

                                    <div className="h-px bg-slate-200 my-2"></div>

                                    <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};