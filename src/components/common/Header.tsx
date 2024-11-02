import React, { useState, useEffect } from "react";
import {Link, useLocation, useNavigate, useSearchParams} from "react-router-dom";
import {ENDPOINTS} from "../../constants/endpoint";

export const Header = () => {

    // state for searching
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(() => {
        // Khởi tạo giá trị search từ URL nếu có
        return searchParams.get('q') || '';
    });

    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);




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
        const token = localStorage.getItem('token');
        if (token) {
            fetchUserInfo(token);
        } else {
            setIsLoggedIn(false);
            setUser(null);
        }
    };

    const fetchUserInfo = async (token: string) => {
        try {
            const response = await fetch('/api/user/info', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                setIsLoggedIn(true);
                // Fetch cart and wishlist counts
                fetchCartCount(token);
                fetchWishlistCount(token);
            } else {
                handleLogout();
            }
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
        <header className="flex justify-between items-center py-3 px-4 bg-white shadow-sm">
            <Link to="/" className="text-4xl font-bold text-blue-600">
                Easy<span className="text-black">Edu.vn</span>
            </Link>

            <div className="flex-1 max-w-xl mx-4">
                <form onSubmit={handleSearch} className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm kiếm khóa học..."
                        className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500"
                    />
                    <button
                        type="submit"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={handleSearch}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none"
                             viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                    </button>
                </form>
            </div>

            <div className="flex items-center space-x-6">
                {isLoggedIn ? (
                    <>
                        {/* Wishlist Icon */}
                        <Link to="/wishlist" className="relative">
                            <button className="text-gray-600 hover:text-gray-800">
                                <i className="fas fa-heart text-xl"/>
                                {wishlistCount > 0 && (
                                    <span
                                        className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {wishlistCount}
                                    </span>
                                )}
                            </button>
                        </Link>

                        {/* Cart Icon */}
                        <Link to="/cart" className="relative">
                            <button className="text-gray-600 hover:text-gray-800">
                                <i className="fas fa-shopping-cart text-xl"/>
                                {cartCount > 0 && (
                                    <span
                                        className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        </Link>

                        {/* User Profile */}
                        <div className="relative">
                            <button
                                onClick={toggleDropdown}
                                className="flex items-center space-x-2 focus:outline-none"
                            >

                                <i className="fas fa-user-circle text-2xl text-gray-600 hover:text-gray-800"/>
                            </button>

                            {isDropdownOpen && (
                                <div
                                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                                    <Link to="/profile"
                                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        <i className="fas fa-user mr-2"/>
                                        My Account
                                    </Link>
                                    <Link to="/my-courses"
                                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        <i className="fas fa-book-open mr-2"/>
                                        My Courses
                                    </Link>
                                    <Link to="/wishlist"
                                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        <i className="fas fa-heart mr-2"/>
                                        My Wishlist
                                    </Link>
                                    <Link to="/cart"
                                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        <i className="fas fa-shopping-cart mr-2"/>
                                        My Cart
                                    </Link>
                                    <hr className="my-1 border-gray-200"/>
                                    <button
                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                        onClick={handleLogout}
                                    >
                                        <i className="fas fa-sign-out-alt mr-2"/>
                                        Log Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex items-center space-x-4">
                        <Link
                            to="/login"
                            className="flex items-center justify-center px-4 py-2 text-sm text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-md shadow-md hover:from-blue-600 hover:to-blue-700 transition duration-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                 strokeLinejoin="round">
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                                <polyline points="10 17 15 12 10 7"/>
                                <line x1="15" y1="12" x2="3" y2="12"/>
                            </svg>
                            Đăng nhập
                        </Link>
                        <Link
                            to="/signup"
                            className="flex items-center justify-center px-4 py-2 text-sm text-white bg-gradient-to-r from-green-500 to-green-600 rounded-md shadow-md hover:from-green-600 hover:to-green-700 transition duration-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                 strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="8.5" cy="7" r="4"/>
                                <line x1="20" y1="8" x2="20" y2="14"/>
                                <line x1="23" y1="11" x2="17" y2="11"/>
                            </svg>
                            Đăng ký
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
};