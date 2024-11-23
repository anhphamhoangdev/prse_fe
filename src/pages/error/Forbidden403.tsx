import { Link } from "react-router-dom";
import { SearchHeaderAndFooterLayout } from "../../layouts/UserLayout";

export function Forbidden403() {
    return (
        <SearchHeaderAndFooterLayout>
            <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
                <div className="sm:mx-auto sm:w-full sm:max-w-lg">
                    <div className="bg-white p-8 shadow-lg rounded-2xl">
                        <div className="text-center">
                            <div className="mx-auto h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                                <svg
                                    className="h-10 w-10 text-yellow-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 15v2m0 0v2m0-2h2m-2 0H10m0 0l4-8m0 0l4 8m-4-8h2m-2 0h-4m4 0l-4 8"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-4">
                                Truy cập bị từ chối
                            </h2>
                            <div className="space-y-3">
                                <p className="text-center text-gray-600">
                                    Rất tiếc, bạn không có quyền truy cập vào nội dung này.
                                </p>
                                <p className="text-center text-sm text-gray-500">
                                    Vui lòng liên hệ với quản trị viên nếu bạn cho rằng đây là một sự nhầm lẫn.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8">
                            <Link
                                to="/"
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200"
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