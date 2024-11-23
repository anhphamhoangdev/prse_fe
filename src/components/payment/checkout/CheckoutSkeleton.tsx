import React from "react";
import {CourseCardSkeleton} from "./CourseCardSkeleton";
import {OrderSummarySkeleton} from "./OrderSummarySkeleton";
import {SearchHeaderAndFooterLayout} from "../../../layouts/UserLayout";

export const CheckoutSkeleton = () => (
    <SearchHeaderAndFooterLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="h-8 w-48 bg-gray-200 rounded mb-8 animate-pulse" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Course List Skeleton */}
                    <div className="bg-white rounded-lg border p-6">
                        <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <CourseCardSkeleton key={i} />
                            ))}
                        </div>
                    </div>

                    {/* Payment Methods Skeleton */}
                    <div className="bg-white rounded-lg border p-6">
                        <div className="h-6 w-48 bg-gray-200 rounded mb-4" />
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-16 bg-gray-200 rounded" />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <OrderSummarySkeleton />
                </div>
            </div>
        </div>
    </SearchHeaderAndFooterLayout>
);
