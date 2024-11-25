// LoadingState.tsx
import React from "react";

export const LoadingState: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto py-6 px-4 lg:px-6">
                {/* Loading Navigation Bar */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6 animate-pulse">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-gray-200"></div>
                            <div>
                                <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                                <div className="h-5 w-32 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
                            <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
                        </div>
                    </div>
                </div>

                {/* Loading Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content Loading */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            {/* Video Player Skeleton */}
                            <div className="relative w-full bg-gray-200" style={{ paddingTop: '56.25%' }}>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            </div>

                            {/* Content Skeleton */}
                            <div className="p-6">
                                <div className="animate-pulse">
                                    <div className="h-8 bg-gray-200 rounded-lg w-3/4 mb-4"></div>
                                    <div className="flex flex-wrap gap-4 mb-6">
                                        <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
                                        <div className="h-6 w-32 bg-gray-200 rounded-full"></div>
                                        <div className="h-6 w-28 bg-gray-200 rounded-full"></div>
                                    </div>
                                    <div className="border-t pt-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                            </div>
                                            <div className="flex justify-end">
                                                <div className="h-10 w-40 bg-gray-200 rounded-lg"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Loading */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="animate-pulse">
                                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                                <div className="space-y-4">
                                    <div className="h-2 bg-gray-200 rounded-full"></div>
                                    <div className="h-8 bg-gray-200 rounded"></div>
                                    <div className="space-y-3">
                                        {[1, 2, 3].map((item) => (
                                            <div key={item} className="border rounded-lg p-4">
                                                <div className="flex justify-between items-center">
                                                    <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                                                    <div className="h-5 bg-gray-200 rounded w-16"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

