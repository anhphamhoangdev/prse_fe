import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SearchHeaderAndFooterLayout } from "../../layouts/UserLayout"; // Assuming this is reusable
import { AlertCircle, ChevronLeft, RefreshCcw } from "lucide-react";
import {requestPostWithAuth} from "../../utils/request";
import {ENDPOINTS} from "../../constants/endpoint";

// Define the type for payment status update (adjust as per your API requirements)
interface PaymentStatusUpdate {
    code: string;
    id: string;
    status: string;
    orderCode: string;
    cancel: boolean;
}

// Simulated API call for updating instructor payment status
export const updatePaymentStatusInstructor = async (data: PaymentStatusUpdate) => {
    try {
        const response = await requestPostWithAuth(
            ENDPOINTS.PAYMENT.UPDATE_STATUS_INSTRUCTOR,
            data
        );
        return response;
    } catch (error) {
        throw new Error('Failed to update instructor payment status');
    }
};

export function InstructorPaymentCancelledPage() {
    const [isProcessing, setIsProcessing] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Parse query parameters from the URL
    const queryParams = new URLSearchParams(location.search);
    const paymentInfo = {
        code: queryParams.get('code'),
        id: queryParams.get('id'),
        status: queryParams.get('status'),
        orderCode: queryParams.get('orderCode'),
        cancel: queryParams.get('cancel')
    };

    useEffect(() => {
        const updatePayment = async () => {
            if (!paymentInfo.id || !paymentInfo.orderCode) {
                setError('Missing payment information');
                setIsProcessing(false);
                return;
            }

            try {
                await updatePaymentStatusInstructor({
                    code: paymentInfo.code || '',
                    id: paymentInfo.id,
                    status: paymentInfo.status || 'PAID',
                    orderCode: paymentInfo.orderCode,
                    cancel: paymentInfo.cancel === 'true'
                });

                setIsProcessing(false);
            } catch (error) {
                setError(error instanceof Error ? error.message : 'An error occurred while processing');
                setIsProcessing(false);
            }
        };

        updatePayment();
    }, [paymentInfo]);

    const handleRetry = () => {
        navigate('/register-instructor'); // Adjust the route as per your app's structure
    };

    const handleBackHome = () => {
        navigate('/'); // Instructor-specific dashboard
    };

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
                        <h2 className="text-xl font-semibold">Processing...</h2>
                    </div>
                </div>
            </SearchHeaderAndFooterLayout>
        );
    }

    return (
        <SearchHeaderAndFooterLayout>
            <div className="max-w-2xl mx-auto px-4 py-16 sm:px-6 sm:py-24">
                <div className="bg-white rounded-lg shadow px-8 py-12">
                    {/* Cancel Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="rounded-full bg-red-100 p-3">
                            <AlertCircle className="w-12 h-12 text-red-600"/>
                        </div>
                    </div>

                    {/* Cancel Message */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Payment Cancellation
                        </h1>
                        <p className="text-gray-600">
                            {error || 'The payment process was cancelled. Please try again or contact support if this was an error.'}
                        </p>
                    </div>

                    {/* Payment Details */}
                    {paymentInfo.orderCode && (
                        <div className="border rounded-lg p-4 mb-8">
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Order Code:</span>
                                    <span className="font-medium">{paymentInfo.orderCode}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Status:</span>
                                    <span className="font-medium text-red-600">Cancelled</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={handleRetry}
                            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg text-center font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all"
                        >
                            <RefreshCcw className="w-4 h-4"/>
                            Thử lại thanh toán
                        </button>

                        <button
                            onClick={handleBackHome}
                            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg text-center font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
                        >
                            <ChevronLeft className="w-4 h-4"/>
                            Quay về bảng điều khiển
                        </button>
                    </div>

                    {/* Thông tin hỗ trợ */}
                    <div className="mt-8 text-center text-sm text-gray-500">
                        Cần hỗ trợ? Vui lòng
                        <a href="/instructor/support" className="text-blue-600 hover:underline ml-1">
                            liên hệ với đội ngũ hỗ trợ của chúng tôi
                        </a>
                    </div>
                </div>
            </div>
        </SearchHeaderAndFooterLayout>
    );
}