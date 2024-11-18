import {SearchHeaderAndFooterLayout} from "../../../layouts/UserLayout";
import React from "react";
import {Link} from "react-router-dom";
import {ArrowRight} from "lucide-react";

export const CourseNotFound: React.FC = () => {
    return (
        <SearchHeaderAndFooterLayout>
            <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center p-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        Khoá học không tồn tại
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Khoá học bạn tìm kiếm không tồn tại hoặc đã bị xoá
                    </p>
                    <Link
                        to="/"
                        className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                        <span>Về trang chủ</span>
                        <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                </div>
            </div>
        </SearchHeaderAndFooterLayout>
    );
};