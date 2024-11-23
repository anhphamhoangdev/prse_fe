import React from "react";

export const OrderSummarySkeleton = () => (
    <div className="bg-white rounded-lg border p-6 animate-pulse">
        <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
        <div className="space-y-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-4 bg-gray-200 rounded" />
            ))}
            <div className="h-12 bg-gray-200 rounded" />
        </div>
    </div>
);
