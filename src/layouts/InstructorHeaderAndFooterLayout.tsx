import {Header} from "../components/common/Header";
import {Footer} from "../components/common/Footer";
import React from "react";
import {InstructorHeader} from "../components/instructor/InstructorHeader";


interface InstructorHeaderAndFooterLayoutProps {
    children: React.ReactNode;
}

export function InstructorHeaderAndFooterLayout({ children }: InstructorHeaderAndFooterLayoutProps) {

    return (
        <div className="w-full min-h-screen flex flex-col">
            <InstructorHeader/>
            <div className="flex-grow">
                {children}
            </div>
            <Footer/>
        </div>
    );
}