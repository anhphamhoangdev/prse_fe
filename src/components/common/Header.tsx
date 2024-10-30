import React, {useState} from "react";
import {Link} from "react-router-dom";

export const Header = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    // Demo state for cart and wishlist counts
    const [cartCount, setCartCount] = useState(3);
    const [wishlistCount, setWishlistCount] = useState(5);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <header className="flex justify-between items-center py-3 px-4 bg-white shadow-sm">
            <Link to="/" className="text-4xl font-bold text-blue-600">
                Easy<span className="text-black">Edu.vn</span>
            </Link>

            <div className="flex-1 max-w-xl mx-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500"
                    />
                    <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="flex items-center space-x-6">
                {isLoggedIn ? (
                    <>
                        {/* Wishlist Icon */}
                        <div className="relative">
                            <button className="text-gray-600 hover:text-gray-800">
                                <i className="fas fa-heart text-xl" />
                                {wishlistCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                                )}
                            </button>
                        </div>

                        {/* Cart Icon */}
                        <div className="relative">
                            <button className="text-gray-600 hover:text-gray-800">
                                <i className="fas fa-shopping-cart text-xl" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                                )}
                            </button>
                        </div>

                        {/* User Profile */}
                        <div className="relative">
                            <button
                                onClick={toggleDropdown}
                                className="flex items-center space-x-2 focus:outline-none"
                            >
                                <i className="fas fa-user-circle text-2xl text-gray-600 hover:text-gray-800" />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        <i className="fas fa-user mr-2" />
                                        My Account
                                    </a>
                                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        <i className="fas fa-book-open mr-2" />
                                        My Courses
                                    </a>
                                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        <i className="fas fa-heart mr-2" />
                                        My Wishlist
                                    </a>
                                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        <i className="fas fa-shopping-cart mr-2" />
                                        My Cart
                                    </a>
                                    <hr className="my-1 border-gray-200" />
                                    <a
                                        href="#"
                                        className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                        onClick={() => setIsLoggedIn(false)}
                                    >
                                        <i className="fas fa-sign-out-alt mr-2" />
                                        Log Out
                                    </a>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <a href="#" className="text-blue-600 hover:text-blue-700">LOGIN/SIGN UP</a>
                )}
            </div>
        </header>
    );
};
