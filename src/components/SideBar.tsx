import React, {useState} from "react";
import {FiHome} from "react-icons/fi";
import {FaBlog} from "react-icons/fa";
import {IoBookOutline} from "react-icons/io5";

export function SideBar() {

    const [isAllCoursesOpen, setIsAllCoursesOpen] = useState<boolean>(false);

    const toggleAllCoursesType = (): void => {
        setIsAllCoursesOpen(!isAllCoursesOpen);
    };


    return(
        <>
            <aside className="w-16 mr-8">
                <nav className="space-y-4">
                    <a href="#" className="flex flex-col items-center text-gray-500 hover:text-blue-500">
                        <FiHome className="text-3xl"/>
                        <span className="text-sm font-bold mt-2">Home</span>
                    </a>
                    <a href="#" className="flex flex-col items-center text-gray-500 hover:text-blue-500">
                        <IoBookOutline className="text-3xl"/>
                        <span className="text-sm font-bold mt-2">Courses</span>
                    </a>
                    <a href="#" className="flex flex-col items-center text-gray-500 hover:text-blue-500">
                        <FaBlog className="text-3xl"/>
                        <span className="text-sm font-bold mt-2">Blog</span>
                    </a>
                </nav>
            </aside>
        </>
    )
}