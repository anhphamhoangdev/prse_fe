import {CheckoutDraft} from "../../../types/checkout";
import {formatCurrency} from "../../../utils/formatCurrency";
import {CreditCard} from "lucide-react";
import React from "react";

export const OrderSummary = ({
                                 checkoutDraft,
                                 onProceed,
                                 selectedPaymentMethod,
                                 isProcessing = false
                             }: {
    checkoutDraft: CheckoutDraft;
    onProceed: () => void;
    selectedPaymentMethod: number | null;
    isProcessing: boolean;
}) => {
    const hasDiscount = checkoutDraft.totalDiscount > 0;

    return (
        <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Chi tiết thanh toán</h2>

            <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-600">
                    <span>Số lượng khóa học</span>
                    <span className="font-medium">{checkoutDraft.items.length}</span>
                </div>

                <div className="flex justify-between text-sm text-gray-600">
                    <span>Tạm tính</span>
                    <span>{formatCurrency(checkoutDraft.totalPrice)}</span>
                </div>

                {hasDiscount && (
                    <div className="flex justify-between text-sm text-green-600">
                        <span>Giảm giá</span>
                        <span>- {formatCurrency(checkoutDraft.totalDiscount)}</span>
                    </div>
                )}

                <div className="pt-3 border-t">
                    <div className="flex justify-between text-base font-semibold">
                        <span>Tổng thanh toán</span>
                        <span className="text-blue-600">
                            {formatCurrency(checkoutDraft.totalPriceAfterDiscount)}
                        </span>
                    </div>
                </div>

                <button
                    onClick={onProceed}
                    disabled={!selectedPaymentMethod || isProcessing}
                    className={`
                    w-full mt-4 py-3 rounded-lg
                    text-sm font-medium
                    flex items-center justify-center gap-2
                    transition-all duration-300
                    ${selectedPaymentMethod && !isProcessing
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm hover:shadow-blue-500/25'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                `}
                >
                    {isProcessing ? (
                        <>
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Đang xử lý...</span>
                        </>
                    ) : (
                        <>
                            <CreditCard className="w-4 h-4"/>
                            {selectedPaymentMethod ? 'Tiến hành thanh toán' : 'Vui lòng chọn phương thức thanh toán'}
                        </>
                    )}
                </button>

                {hasDiscount && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <div className="flex items-start gap-2 text-green-700 text-xs">
                            <div className="mt-0.5">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd"
                                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                          clipRule="evenodd"/>
                                </svg>
                            </div>
                            <p>Bạn đã tiết kiệm được {formatCurrency(checkoutDraft.totalDiscount)}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};