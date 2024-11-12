import {Link, useParams} from "react-router-dom";
import { SearchHeaderAndFooterLayout } from "../../layouts/UserLayout";
import {useEffect, useState} from "react";
import {activateStudentAccount} from "../../services/studentService";

export function ActivateAccount() {
    const {email} = useParams();
    const {activateCode} = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [isSuccess, setSuccess] = useState<boolean>();
    const [notification, setNotification] = useState<string>('');

    useEffect(() => {
        if(email && activateCode){
            handleActivateAccount();
        }
    }, []);

    async function handleActivateAccount() {
        try {
            const result = await activateStudentAccount({email, activateCode});
            if(result.success) {
                setSuccess(true);
            } else {
                setSuccess(false);
                setNotification(result.error_message);
            }
        } catch(error) {
            setSuccess(false);
            setNotification("Đã có lỗi xảy ra !");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <SearchHeaderAndFooterLayout>
            <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
                <div className="sm:mx-auto sm:w-full sm:max-w-lg">
                    <div className="bg-white p-8 shadow-lg rounded-2xl">
                        <div className="text-center">
                            {isLoading ? (
                                // Loading State
                                <>
                                    <div className="mx-auto h-16 w-16 flex items-center justify-center mb-6">
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                                    </div>
                                    <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-4">
                                        Đang kích hoạt tài khoản...
                                    </h2>
                                    <p className="text-center text-gray-600">
                                        Xin vui lòng chờ trong khi chúng tôi xác minh tài khoản của bạn.
                                    </p>
                                </>
                            ) : isSuccess ? (
                                // Success State
                                <>
                                    <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                                        <svg className="h-10 w-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-4">
                                        Kích hoạt thành công!
                                    </h2>
                                    <div className="space-y-3">
                                        <p className="text-center text-gray-600">
                                            Chúc mừng! Tài khoản của bạn đã được kích hoạt thành công.
                                        </p>
                                        <p className="text-center text-gray-600">
                                            Bạn có thể bắt đầu sử dụng tài khoản của mình ngay bây giờ.
                                        </p>
                                    </div>
                                </>
                            ) : (
                                // Error State
                                <>
                                    <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                                        <svg className="h-10 w-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                    <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-4">
                                        Kích hoạt không thành công.
                                    </h2>
                                    <div className="space-y-3">
                                        <p className="text-center font-semibold text-red-600">
                                            {notification}
                                        </p>
                                        <p className="text-center text-sm text-gray-500">
                                            Vui lòng liên hệ với bộ phận hỗ trợ nếu bạn tiếp tục gặp vấn đề.
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        {!isLoading && (
                            <div className="mt-8">
                                <Link
                                    to={isSuccess ? "/login" : "/support"}
                                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white  transition-colors duration-200 
                                        ${isSuccess
                                        ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                                        : "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                                    } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                                >
                                    {isSuccess ? "Đăng nhập vào tài khoản của bạn" : "Liên hệ hỗ trợ"}
                                </Link>
                                {!isSuccess && (
                                    <Link
                                        to="/"
                                        className="mt-4 w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                                    >
                                        Trở về trang chủ
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </SearchHeaderAndFooterLayout>
    );
}