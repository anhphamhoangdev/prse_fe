import React from 'react';
import {SearchHeaderAndFooterLayout} from '../layouts/UserLayout';

export function CourseDetail() {
    return (
        <SearchHeaderAndFooterLayout>
            <main className="container mx-auto px-4 py-8">
                {/* Course detail content */}
                <h1 className="text-3xl font-bold mb-6">Course Title</h1>
                <div className="grid grid-cols-3 gap-8">
                    <div className="col-span-2">
                        {/* Course information */}
                        <div className="bg-white rounded-lg shadow p-6">
                            {/* Course content goes here */}
                        </div>
                    </div>
                    <div className="col-span-1">
                        {/* Sidebar information */}
                        <div className="bg-white rounded-lg shadow p-6">
                            {/* Course meta information */}
                        </div>
                    </div>
                </div>
            </main>
        </SearchHeaderAndFooterLayout>
    );
}