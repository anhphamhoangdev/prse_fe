import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
    Search,
    ShoppingCart,
    User,
    LogOut,
    BookOpen,
    ChevronDown,
    GraduationCap,
    ArrowRight,
    Bot,
    History,
    MessageCircle,
    Headphones,
} from 'lucide-react';
import { ENDPOINTS } from '../../constants/endpoint';
import { requestWithAuth } from '../../utils/request';
import { UserData } from '../../types/users';
import { useUser } from '../../context/UserContext';

interface ProfileResponse {
    student: UserData;
}

interface CartCountResponse {
    count: number;
}

export const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(() => searchParams.get('q') || '');
    const { user, setUser, isLoggedIn, setIsLoggedIn } = useUser();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [isAuthChecking, setIsAuthChecking] = useState(true);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    useEffect(() => {
        const query = searchParams.get('q');
        if (query) {
            setSearchTerm(query);
        }
    }, [searchParams]);

    useEffect(() => {
        if (user) {
            fetchCartCount();
        }
    }, [user]);

    const handleBecomeInstructor = () => {
        navigate('/become-instructor');
        setIsDropdownOpen(false);
    };

    const handleSwitchToInstructor = () => {
        navigate('/instructor/dashboard');
        setIsDropdownOpen(false);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) {
            navigate('/');
            return;
        }
        if (location.pathname.includes('/category/')) {
            const categoryId = location.pathname.split('/').pop();
            navigate(ENDPOINTS.CATEGORY.BY_SUBCATEGORY + `/${categoryId}?q=${encodeURIComponent(searchTerm)}`);
        } else {
            navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
        }
    };

    const checkAuthStatus = () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            fetchUserInfo(token);
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
            setUser(null);
        }
        setIsAuthChecking(false);
    };

    const fetchUserInfo = async (token: string) => {
        try {
            const response = await requestWithAuth<ProfileResponse>(ENDPOINTS.STUDENT.PROFILE);
            setUser(response.student);
        } catch (error) {
            console.error('Error fetching user info:', error);
            handleLogout();
        }
    };

    const fetchCartCount = async () => {
        try {
            const response = await requestWithAuth<CartCountResponse>(ENDPOINTS.CART.COUNT);
            setCartCount(response.count);
        } catch (error) {
            console.error('Error fetching cart count:', error);
            setCartCount(0);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        setIsLoggedIn(false);
        setUser(null);
        setCartCount(0);
        window.dispatchEvent(new Event('auth-logout'));
        navigate('/');
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm backdrop-blur-sm bg-white/80">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center py-4 px-4 sm:px-6">
                    <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <img src="/logo.png" alt="HCMUTE Logo" className="w-10 h-10 object-contain" />
                        <span className="text-2xl sm:text-3xl font-bold">
                            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Easy</span>
                            <span className="bg-gradient-to-r from-slate-600 to-slate-900 bg-clip-text text-transparent">Edu</span>
                        </span>
                    </Link>

                    <div className="hidden sm:block flex-1 max-w-xl mx-8">
                        <form onSubmit={handleSearch} className="relative group">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Tìm kiếm khóa học..."
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 pl-11 pr-24"
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                            <Link
                                to="/advisor-chat"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-sm hover:shadow-md"
                            >
                                <Bot className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">AI Tư vấn</span>
                                <div className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-blue-200 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                                </div>
                            </Link>
                        </form>
                    </div>

                    <div className="flex items-center space-x-1 sm:space-x-4">
                        {!isAuthChecking &&
                            (isLoggedIn ? (
                                <>
                                    <Link to="/cart" className="relative p-2 hover:bg-slate-100 rounded-full transition-colors">
                                        <ShoppingCart className="w-6 h-6 text-slate-600 hover:text-blue-500 transition-colors" />
                                        {cartCount > 0 && (
                                            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                                                {cartCount}
                                            </span>
                                        )}
                                    </Link>

                                    <div className="relative">
                                        <button
                                            onClick={toggleDropdown}
                                            className="flex items-center space-x-2 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                        >
                                            {user?.avatarUrl ? (
                                                <img
                                                    src={user.avatarUrl}
                                                    alt={user.fullName}
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
                                                    <p className="text-sm font-medium text-slate-900">{user?.fullName}</p>
                                                    <p className="text-sm text-slate-500">{user?.email}</p>
                                                </div>
                                                <Link
                                                    to="/profile"
                                                    className="flex items-center px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                                >
                                                    <User className="w-4 h-4 mr-2" />
                                                    Tài khoản của tôi
                                                </Link>
                                                <Link
                                                    to="/my-courses"
                                                    className="flex items-center px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                                >
                                                    <BookOpen className="w-4 h-4 mr-2" />
                                                    Khóa học của tôi
                                                </Link>
                                                <Link
                                                    to="/messages"
                                                    className="flex items-center px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                                >
                                                    <MessageCircle className="w-4 h-4 mr-2" />
                                                    Tin nhắn
                                                </Link>
                                                <Link
                                                    to="/history"
                                                    className="flex items-center px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                                >
                                                    <History className="w-4 h-4 mr-2" />
                                                    Lịch sử giao dịch
                                                </Link>
                                                <Link
                                                    to="/create-ticket"
                                                    className="flex items-center px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                                >
                                                    <Headphones className="w-4 h-4 mr-2" />
                                                    Hỗ trợ
                                                </Link>
                                                {user?.instructor ? (
                                                    <button
                                                        onClick={handleSwitchToInstructor}
                                                        className="flex items-center w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 group"
                                                    >
                                                        <GraduationCap className="w-4 h-4 mr-2" />
                                                        <span className="flex-1 text-left">Chuyển sang Instructor</span>
                                                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={handleBecomeInstructor}
                                                        className="flex items-center w-full px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 group"
                                                    >
                                                        <GraduationCap className="w-4 h-4 mr-2" />
                                                        <span className="flex-1 text-left">Trở thành Instructor</span>
                                                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </button>
                                                )}
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
                                </>
                            ) : (
                                <div className="flex items-center space-x-3">
                                    <Link
                                        to="/login"
                                        className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                                    >
                                        Đăng nhập
                                    </Link>
                                    <Link
                                        to="/signup"
                                        className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                                    >
                                        Đăng ký
                                    </Link>
                                </div>
                            ))}
                    </div>
                </div>

                <div className="sm:hidden px-4 pb-4">
                    <form onSubmit={handleSearch} className="relative group">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm kiếm khóa học..."
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 pl-11 pr-24"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Link
                            to="/advisor-chat"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                            <Bot className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">AI Tư vấn</span>
                            <div className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-blue-200 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                            </div>
                        </Link>
                    </form>
                </div>
            </div>
        </header>
    );
};