import React from 'react';

const CourseContentLoading = () => {
    return (
        <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((index) => (
                <div key={index} className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                            <div className="h-5 bg-gray-200 rounded w-48"></div>
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                        </div>
                        <div className="h-5 w-5 bg-gray-200 rounded"></div>
                    </div>
                    <div className="border-t border-gray-200">
                        {[1, 2, 3].map((lessonIndex) => (
                            <div key={lessonIndex} className="p-4 flex items-center space-x-3">
                                <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                                <div className="flex-grow">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                </div>
                                <div className="h-4 bg-gray-200 rounded w-16"></div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CourseContentLoading;