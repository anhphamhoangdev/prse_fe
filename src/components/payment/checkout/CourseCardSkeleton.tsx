import React from "react";

export const CourseCardSkeleton = () => (
    <div className="bg-white rounded-lg border p-4 animate-pulse">
        <div className="flex gap-4">
            <div className="w-24 h-16 bg-gray-200 rounded" />
            <div className="flex-1">
                <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-full bg-gray-200 rounded mb-2" />
                <div className="h-3 w-1/2 bg-gray-200 rounded" />
            </div>
        </div>
    </div>
);
