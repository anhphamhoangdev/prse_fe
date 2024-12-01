import React from "react";
import {Footer} from "../components/common/Footer";
import {AdminHeader} from "../components/admin/AdminHeader";

interface AdminHeaderAndFooterLayoutProps {
    children: React.ReactNode;
}

export function AdminHeaderAndFooterLayout({ children }: AdminHeaderAndFooterLayoutProps) {
    return (
        <div className="w-full min-h-screen flex flex-col">
            <AdminHeader/>
            <div className="flex-grow">
                {children}
            </div>
            <Footer/>
        </div>
    );
}