import React, {useState} from "react";
import {FiChevronDown, FiSearch, FiUser} from "react-icons/fi";


export function Header(){

    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState<boolean>(false);

    const toggleAccountMenu = (): void => {
        setIsAccountMenuOpen(!isAccountMenuOpen);
    };

    const [isFocusSearch, setIsFocusSearch] = useState<boolean>(false);

    return (
            <div className="mx-auto px-4 py-4 flex items-center justify-between">
                {/*Logo*/}
                <div className="flex flex-col items-start">
                    <div className="text-xl sm:text-2xl md:text-2xl lg:text-2xl font-bold text-blue-600">EASY EDU</div>
                    <span className="text-xs sm:text-sm md:text-sm lg:text-sm text-gray-600">Study Smart, Not Hard!</span>
                </div>
                {/*Search*/}
                <div className="flex-1 max-w-xl mx-4">
                    <div className="relative">
                        <input
                            type="text"
                            id="floating_outlined"
                            placeholder=""
                            onFocus={() => setIsFocusSearch(true)}
                            onBlur={() => setIsFocusSearch(false)}
                            className="w-full py-2 px-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 peer"
                        />
                        <label htmlFor="floating_outlined"
                               className="absolute text-base text-gray-500 ml-2 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-5 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
                            {isFocusSearch ? 'Search' : 'Search courses, blogs,...'}
                        </label>
                        <FiSearch className="absolute z-50 right-3 top-3 text-gray-400"/>
                    </div>
                </div>
                {/*Account*/}
                <div className="relative">

                    <button
                        onClick={toggleAccountMenu}
                        className="flex items-center space-x-2 text-gray-700 hover:text-blue-500 focus:outline-none"
                    >
                        {/*<FiUser className="text-xl"/>*/}
                        <img
                            className="size-8 rounded-full border border-gray-300 hover:border-0 transition-all duration-75 ease-in-out"
                            src="https://scontent.fsgn10-2.fna.fbcdn.net/v/t39.30808-6/416238737_2395657973950734_3403316050107008880_n.jpg?stp=cp6_dst-jpg&_nc_cat=107&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=h83JeE4IWVYQ7kNvgErRXo1&_nc_ht=scontent.fsgn10-2.fna&_nc_gid=AIPmWLCzPjjM_m0F_RS8g_v&oh=00_AYC6IoPjfDd5nDfT_X8H3E0RHd3hHMvZY74FDbLTpLTytA&oe=66EECF78"
                            alt=""
                        />
                        <h1 className="font-bold">Anh</h1>
                        <FiChevronDown
                            className={`transform transition-transform duration-300 ${isAccountMenuOpen ? 'rotate-180' : ''}`}/>
                    </button>
                    {/*DropDown*/}
                    {isAccountMenuOpen && (
                        <div className="absolute right-0 mt-4 w-72 bg-white rounded-md shadow-lg py-1 border">
                            <div className="flex items-center">
                                <img
                                    className="inline-block mx-4 h-full w-16 rounded-full ring-2 ring-white"
                                    src="https://scontent.fsgn10-2.fna.fbcdn.net/v/t39.30808-6/416238737_2395657973950734_3403316050107008880_n.jpg?stp=cp6_dst-jpg&_nc_cat=107&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=h83JeE4IWVYQ7kNvgErRXo1&_nc_ht=scontent.fsgn10-2.fna&_nc_gid=AIPmWLCzPjjM_m0F_RS8g_v&oh=00_AYC6IoPjfDd5nDfT_X8H3E0RHd3hHMvZY74FDbLTpLTytA&oe=66EECF78"
                                    alt=""
                                />
                                <div>
                                    <h1 className="text-xl text-gray-500 font-bold">Anh Pham</h1>
                                    <span className="text-sm text-gray-500">@anhphamhoang033</span>
                                </div>
                            </div>
                            <hr className="m-2"/>
                            <a href="#"
                               className="block px-4 py-2 text-sm text-gray-500 ease-in-out hover:text-blue-500 hover:font-bold">My
                                Account</a>
                            <hr className="m-2"/>
                            <a href="#"
                               className="block px-4 py-2 text-sm text-gray-500 ease-in-out hover:text-blue-500 hover:font-bold">My
                                courses</a>
                            <hr className="m-2"/>
                            <a href="#"
                               className="block px-4 py-2 text-sm text-gray-500 ease-in-out hover:text-blue-500 hover:font-bold">
                                Write Blog</a>
                            <a href="#"
                               className="block px-4 py-2 text-sm text-gray-500 ease-in-out hover:text-blue-500 hover:font-bold">
                                My Blog</a>
                            <a href="#"
                               className="block px-4 py-2 text-sm text-gray-500 ease-in-out hover:text-blue-500 hover:font-bold">
                                Saved Blog</a>
                            <hr className="m-2"/>
                            <a href="#"
                               className="block px-4 py-2 text-sm text-gray-500 ease-in-out hover:text-blue-500 hover:font-bold">
                                Settings</a>
                            <a href="#"
                               className="block px-4 py-2 text-sm text-gray-500 ease-in-out hover:text-blue-500 hover:font-bold">
                                Log Out</a>
                        </div>
                    )}
                </div>
            </div>
    );
};