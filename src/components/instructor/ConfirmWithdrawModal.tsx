import React from 'react';
import { Bank } from "../../types/bank";
import { WithdrawFormData } from "../../types/withdraw";

interface ConfirmWithdrawModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading: boolean;
    withdrawType: 'bank' | 'student';
    formData: WithdrawFormData;
    selectedBank: Bank | null;
}

export const ConfirmWithdrawModal: React.FC<ConfirmWithdrawModalProps> = ({
                                                                              isOpen,
                                                                              onClose,
                                                                              onConfirm,
                                                                              loading,
                                                                              withdrawType,
                                                                              formData,
                                                                              selectedBank,
                                                                          }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Điều chỉnh max-width cho modal dựa vào withdrawType */}
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <div
                    className={`bg-white rounded-xl shadow-xl transform transition-all duration-300 scale-100 w-full ${
                        withdrawType === 'student' ? 'max-w-md' : 'max-w-lg'
                    }`}
                >
                    {/* Header - làm gọn padding khi là student */}
                    <div className={`px-6 ${withdrawType === 'student' ? 'py-3' : 'py-4'} border-b border-slate-200`}>
                        <h3 className="text-lg font-semibold text-slate-900">
                            Xác nhận thông tin rút tiền
                        </h3>
                    </div>

                    {/* Content */}
                    <div className={`${withdrawType === 'student' ? 'p-4' : 'p-6'} space-y-4`}>
                        {/* Với student, bỏ phần "kiểm tra kỹ thông tin" vì chỉ có 2 thông tin đơn giản */}
                        {withdrawType === 'bank' && (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <p className="text-blue-800 font-medium">
                                    Vui lòng kiểm tra kỹ các thông tin sau:
                                </p>
                            </div>
                        )}

                        <div className="flex justify-between py-2">
                            <span className="text-slate-600">Phương thức:</span>
                            <span className="font-medium text-slate-900">
                                {withdrawType === 'bank'
                                    ? 'Rút về tài khoản ngân hàng'
                                    : 'Chuyển vào tài khoản học viên'
                                }
                            </span>
                        </div>

                        <div className="flex justify-between py-2">
                            <span className="text-slate-600">Số tiền:</span>
                            <span className="font-semibold text-green-600">
                                {formData.amount.toLocaleString()} VND
                            </span>
                        </div>

                        {withdrawType === 'bank' && (
                            <>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600">Ngân hàng:</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{selectedBank?.shortName}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-slate-600">Số tài khoản:</span>
                                    <span className="font-medium">{formData.accountNumber}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-slate-600">Chủ tài khoản:</span>
                                    <span className="font-medium">{formData.accountHolder}</span>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Actions - giảm padding khi là student */}
                    <div
                        className={`${withdrawType === 'student' ? 'px-4 py-3' : 'px-6 py-4'} bg-slate-50 flex justify-end gap-3 rounded-b-xl`}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                            disabled={loading}
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            className={`px-4 py-2 rounded-lg text-white transition-colors ${
                                withdrawType === 'bank'
                                    ? 'bg-blue-600 hover:bg-blue-700'
                                    : 'bg-violet-600 hover:bg-violet-700'
                            } disabled:opacity-50`}
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                                    <span>Đang xử lý...</span>
                                </div>
                            ) : (
                                'Xác nhận rút tiền'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};