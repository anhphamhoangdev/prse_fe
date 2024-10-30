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
                {!isHomePage && (
                    <div className="container mx-auto px-4 py-2">
                        <BackButton />
                    </div>
                )}
                {children}
            </div>
            <Footer />
        </div>
    );
}