import {SearchHeaderAndFooterLayout} from "../../layouts/UserLayout";
import {Link, useLocation, useNavigate} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {CheckCircle, ChevronLeft} from "lucide-react";
import {updatePaymentStatus} from "../../services/paymentService";

export function PaymentSuccessPage() {
    const [isProcessing, setIsProcessing] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const paymentInfo = {
        code: queryParams.get('code'),
        id: queryParams.get('id'),
        status: queryParams.get('status'),
        orderCode: queryParams.get('orderCode'),
        cancel: queryParams.get('cancel') === 'false'
    };

    useEffect(() => {
        console.log("CALLLLLLLLLLLLLLL ===== > ", paymentInfo)
        const updatePayment = async () => {
            if (!paymentInfo.id || !paymentInfo.orderCode) {
                setError('Thiếu thông tin thanh toán');
                setIsProcessing(false);
                return;
            }

            try {
                await updatePaymentStatus({
                    code: paymentInfo.code || '',
                    id: paymentInfo.id,
                    status: paymentInfo.status || 'PAID',
                    orderCode: paymentInfo.orderCode,
                    cancel: paymentInfo.cancel
                });

                setIsProcessing(false);
            } catch (error) {
                setError(error instanceof Error ? error.message : 'Có lỗi xảy ra');
                setIsProcessing(false);
            }
        };

        updatePayment();
    }, []);

    // Show loading state
    if (isProcessing) {
        return (
            <SearchHeaderAndFooterLayout>
                <div className="max-w-2xl mx-auto px-4 py-16 sm:px-6 sm:py-24">
                    <div className="bg-white rounded-lg shadow px-8 py-12 text-center">
                        <div className="flex justify-center mb-4">
                            <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold">Đang xử lý thanh toán...</h2>
                    </div>
                </div>
            </SearchHeaderAndFooterLayout>
        );
    }

    // Show error state if there's an error
    if (error) {
        return (
            <SearchHeaderAndFooterLayout>
                <div className="max-w-2xl mx-auto px-4 py-16 sm:px-6 sm:py-24">
                    <div className="bg-white rounded-lg shadow px-8 py-12 text-center">
                        <div className="text-red-600 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold mb-2">Có lỗi xảy ra</h2>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={() => navigate('/cart')}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Quay lại giỏ hàng
                        </button>
                    </div>
                </div>
            </SearchHeaderAndFooterLayout>
        );
    }

    // Show success state
    return (
        <SearchHeaderAndFooterLayout>
            <div className="max-w-2xl mx-auto px-4 py-16 sm:px-6 sm:py-24">
                <div className="bg-white rounded-lg shadow px-8 py-12">
                    {/* Success Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="rounded-full bg-green-100 p-3">
                            <CheckCircle className="w-12 h-12 text-green-600"/>
                        </div>
                    </div>

                    {/* Success Message */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Thanh toán thành công!
                        </h1>
                        <p className="text-gray-600">
                            Cảm ơn bạn rất nhiều vì đã đăng ký khóa học! Hy vọng bạn sẽ có những trải nghiệm thú vị ^^
                        </p>
                    </div>

                    {/* Transaction Details */}
                    <div className="border rounded-lg p-4 mb-8">
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Mã đơn hàng:</span>
                                <span className="font-medium">{paymentInfo.orderCode}</span>
                            </div>
                            {/*<div className="flex justify-between text-sm">*/}
                            {/*    <span className="text-gray-500">Mã giao dịch:</span>*/}
                            {/*    <span className="font-medium">{paymentInfo.id}</span>*/}
                            {/*</div>*/}
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Trạng thái:</span>
                                <span className="font-medium text-green-600">
                                    Thành công
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <Link
                            to="/learning"
                            className="block w-full py-3 px-4 rounded-lg text-center font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all"
                        >
                            Bắt đầu học ngay
                        </Link>

                        <Link
                            to="/"
                            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg text-center font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Quay về trang chủ
                        </Link>
                    </div>
                </div>
            </div>
        </SearchHeaderAndFooterLayout>
    );
}