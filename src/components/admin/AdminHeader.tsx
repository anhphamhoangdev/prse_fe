import React from "react";
import { Link } from "react-router-dom";
import { useAdmin } from "../../layouts/AdminLayout";
import { User, LogOut } from "lucide-react";

export const AdminHeader = () => {
    const { admin } = useAdmin();

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        sessionStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
    };

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-slate-200 shadow-sm">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center py-3 px-4 sm:px-6">
                    {/* Logo và Brand */}
                    <div className="flex items-center space-x-8">
                        <Link to="/admin/dashboard" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                            {/* Logo */}
                            {/*<div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg">*/}
                            {/*    <span className="text-white font-bold text-xl">E</span>*/}
                            {/*</div>*/}

                            {/* Brand Name */}
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">
                                    <span className="text-blue-600">Easy</span>
                                    <span className="text-slate-800">Edu</span>
                                </h1>
                                <p className="text-xs font-medium text-slate-500 tracking-wider uppercase">
                                    Control Panel
                                </p>
                            </div>
                        </Link>

                        {/* Navigation Pills - Optional */}
                        {/*<nav className="hidden md:flex items-center space-x-1">*/}
                        {/*    <Link to="/admin/dashboard"*/}
                        {/*          className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 rounded-md hover:bg-slate-100 transition-colors">*/}
                        {/*        Dashboard*/}
                        {/*    </Link>*/}
                        {/*    <Link to="/admin/users"*/}
                        {/*          className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 rounded-md hover:bg-slate-100 transition-colors">*/}
                        {/*        Users*/}
                        {/*    </Link>*/}
                        {/*    <Link to="/admin/courses"*/}
                        {/*          className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 rounded-md hover:bg-slate-100 transition-colors">*/}
                        {/*        Courses*/}
                        {/*    </Link>*/}
                        {/*</nav>*/}
                    </div>

                    {/* Admin Info & Actions */}
                    {admin && (
                        <div className="flex items-center space-x-6">
                            {/* Admin Info */}
                            <div className="flex items-center space-x-3">
                                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                                    <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="hidden sm:block">
                                    <div className="text-sm font-semibold text-slate-700">{admin.fullName}</div>
                                    <div className="text-xs text-slate-500">{admin.email}</div>
                                </div>
                            </div>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="p-2 text-slate-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};