// layouts/UserLayout.tsx
import React from 'react';
import { Header } from "../components/common/Header";
import { Footer } from "../components/common/Footer";

interface UserLayoutProps {
    children: React.ReactNode;
}

export function SearchHeaderAndFooterLayout({ children }: UserLayoutProps) {

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