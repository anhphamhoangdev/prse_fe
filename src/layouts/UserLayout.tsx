// layouts/UserLayout.tsx
import React from 'react';
import { Header } from "../components/common/Header";
import { Footer } from "../components/common/Footer";
import { BackButton } from "../components/common/BackButton";
import { useLocation } from 'react-router-dom';

interface UserLayoutProps {
    children: React.ReactNode;
}

export function SearchHeaderAndFooterLayout({ children }: UserLayoutProps) {
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    return (
        <div className="w-full min-h-screen flex flex-col">
            <Header />
            <div className="flex-grow">
                {children}
            </div>
            <Footer />
        </div>
    );
}