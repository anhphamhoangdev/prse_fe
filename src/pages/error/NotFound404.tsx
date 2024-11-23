import { Link } from "react-router-dom";
import { SearchHeaderAndFooterLayout } from "../../layouts/UserLayout";

export function NotFound404() {
    return (
        <SearchHeaderAndFooterLayout>
            <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
                <div className="sm:mx-auto sm:w-full sm:max-w-lg">
                    <div className="bg-white p-8 shadow-lg rounded-2xl">
                        <div className="text-center">
                            <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                                <svg
                                    className="h-10 w-10 text-red-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M3 3l18 18M21 3l-18 18"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-4">
                                Trang không tồn tại
                            </h2>
                            <div className="space-y-3">
                                <p className="text-center text-gray-600">
                                    Rất tiếc, trang bạn đang tìm kiếm không có sẵn.
                                </p>
                                <p className="text-center text-sm text-gray-500">
                                    Vui lòng kiểm tra lại đường dẫn hoặc quay lại trang chủ.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8">
                            <Link
                                to="/"
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200"
                            >
                                Trở về trang chủ
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </SearchHeaderAndFooterLayout>
    );
}