import React, { useState, useEffect } from "react";
import {Link, useLocation, useNavigate, useSearchParams} from "react-router-dom";
import {
    Search, Heart, ShoppingCart, User, LogOut, BookOpen,
    ChevronDown, Wallet, Award, GraduationCap, ArrowRight
} from "lucide-react";
import {ENDPOINTS} from "../../constants/endpoint";
import {requestWithAuth} from "../../utils/request";


interface UserData {
    id: number;
    username: string;
    email: string;
    fullName: string;
    avatarUrl: string | null;
    money: number;
    point: number;
}

interface ProfileResponse {
    student: UserData;
}

export const Header = () => {

    // state for searching
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(() => {
        // Khởi tạo giá trị search từ URL nếu có
        return searchParams.get('q') || '';
    });

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [user, setUser] = useState<UserData | null>(null);
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [isAuthChecking, setIsAuthChecking] = useState(true); // New state for loading

    const [isInstructor, setIsInstructor] = useState(true);



    useEffect(() => {
        // Kiểm tra authentication status khi component mount
        checkAuthStatus();
    }, []);

    useEffect(() => {
        const query = searchParams.get('q');
        if (query) {
            setSearchTerm(query);
        }
    }, [searchParams]);


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

        if (!searchTerm.trim()){
            navigate('/')
            return;
        };

        if (location.pathname.includes('/category/')) {
            const categoryId = location.pathname.split('/').pop();
            navigate(ENDPOINTS.CATEGORY.BY_SUBCATEGORY+`/${categoryId}?q=${encodeURIComponent(searchTerm)}`);
        } else {
            navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
        }
    };

    const checkAuthStatus = () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem("token");
        if (token) {
            fetchUserInfo(token);
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
            setUser(null);
        }
        setIsAuthChecking(false); // Set loading to false after check completes
    };


    const fetchUserInfo = async (token: string) => {
        try {
            const response = await requestWithAuth<ProfileResponse>(ENDPOINTS.STUDENT.PROFILE);
            setUser(response.student);
            // Fetch cart and wishlist counts
            // fetchCartCount(token);
            // fetchWishlistCount(token);

        } catch (error) {
            console.error('Error fetching user info:', error);
            handleLogout();
        }
    };

    const fetchCartCount = async (token: string) => {
        try {
            const response = await fetch('/api/cart/count', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const { count } = await response.json();
                setCartCount(count);
            }
        } catch (error) {
            console.error('Error fetching cart count:', error);
        }
    };

    const fetchWishlistCount = async (token: string) => {
        try {
            const response = await fetch('/api/wishlist/count', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const { count } = await response.json();
                setWishlistCount(count);
            }
        } catch (error) {
            console.error('Error fetching wishlist count:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        setIsLoggedIn(false);
        setUser(null);
        setCartCount(0);
        setWishlistCount(0);
        navigate('/');
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm backdrop-blur-sm bg-white/80">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center py-4 px-4 sm:px-6">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
                    >
                        Easy<span className="bg-gradient-to-r from-slate-600 to-slate-900 bg-clip-text text-transparent">Edu</span>
                    </Link>

                    {/* Search Bar */}
                    <div className="hidden sm:block flex-1 max-w-xl mx-8">
                        <form onSubmit={handleSearch} className="relative group">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Tìm kiếm khóa học..."
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50
                                         focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                                         transition-all duration-300 pl-11"
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                        </form>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1 sm:space-x-4">
                        {!isAuthChecking && (
                            isLoggedIn ? (
                                <>
                                    {/*/!* Wishlist *!/*/}
                                    {/*<Link to="/wishlist" className="relative p-2 hover:bg-slate-100 rounded-full transition-colors">*/}
                                    {/*    <Heart className="w-6 h-6 text-slate-600 hover:text-blue-500 transition-colors" />*/}
                                    {/*    {wishlistCount > 0 && (*/}
                                    {/*        <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">*/}
                                    {/*            {wishlistCount}*/}
                                    {/*        </span>*/}
                                    {/*    )}*/}
                                    {/*</Link>*/}

                                    {/* Cart */}
                                    <Link to="/cart" className="relative p-2 hover:bg-slate-100 rounded-full transition-colors">
                                        <ShoppingCart className="w-6 h-6 text-slate-600 hover:text-blue-500 transition-colors" />
                                        {cartCount > 0 && (
                                            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                                                {cartCount}
                                            </span>
                                        )}
                                    </Link>

                                    {/* User Menu */}
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
                                                    <div className="mt-2 flex items-center justify-between text-xs">
                                                        <div className="flex items-center text-blue-600">
                                                            <Wallet className="w-4 h-4 mr-1" />
                                                            {user?.money.toLocaleString()} VND
                                                        </div>
                                                        <div className="flex items-center text-amber-600">
                                                            <Award className="w-4 h-4 mr-1" />
                                                            {user?.point} điểm
                                                        </div>
                                                    </div>
                                                </div>

                                                <Link to="/profile"
                                                      className="flex items-center px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                                                    <User className="w-4 h-4 mr-2" />
                                                    Tài khoản của tôi
                                                </Link>

                                                <Link to="/my-courses"
                                                      className="flex items-center px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                                                    <BookOpen className="w-4 h-4 mr-2" />
                                                    Khóa học của tôi
                                                </Link>

                                                {/* Instructor Option */}
                                                {isInstructor ? (
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

                                                {/* Divider */}
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
                            )
                        )}
                    </div>
                </div>

                {/* Mobile Search */}
                <div className="sm:hidden px-4 pb-4">
                    <form onSubmit={handleSearch} className="relative group">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm kiếm khóa học..."
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50
                                     focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                                     transition-all duration-300 pl-11"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    </form>
                </div>
            </div>
        </header>
    );
};